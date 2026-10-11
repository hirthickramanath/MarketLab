import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { initialState, State, settle, reserves } from "./engine";
// Runtime account storage must never enter application bundles.
const location = resolve(
  /* turbopackIgnore: true */
  process.env.MARKETLAB_DB_PATH ?? ".data/marketlab.sqlite",
);
mkdirSync(dirname(location), { recursive: true });
const db = new DatabaseSync(location);
db.exec(
  "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'student',state TEXT NOT NULL); CREATE TABLE IF NOT EXISTS tokens(hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,actor TEXT NOT NULL,target TEXT NOT NULL,reason TEXT NOT NULL,amount INTEGER NOT NULL,time INTEGER NOT NULL);",
);
type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  state: string;
};
function hash(password: string, salt = randomBytes(16).toString("hex")) {
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function register(
  email: string,
  name: string,
  password: string,
  role = "student",
) {
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO users VALUES(?,?,?,?,?,?)").run(
    id,
    email.toLowerCase(),
    name,
    hash(password),
    role,
    JSON.stringify(initialState()),
  );
  return id;
}
if (
  process.env.MARKETLAB_ADMIN_EMAIL &&
  process.env.MARKETLAB_ADMIN_PASSWORD &&
  !db
    .prepare("SELECT id FROM users WHERE email=?")
    .get(process.env.MARKETLAB_ADMIN_EMAIL.toLowerCase())
)
  register(
    process.env.MARKETLAB_ADMIN_EMAIL,
    "Administrator",
    process.env.MARKETLAB_ADMIN_PASSWORD,
    "admin",
  );
export function login(email: string, password: string) {
  const user = db
    .prepare("SELECT * FROM users WHERE email=?")
    .get(email.toLowerCase()) as User | undefined;
  if (!user) return null;
  const [salt, stored] = user.password.split(":");
  if (
    !timingSafeEqual(Buffer.from(stored, "hex"), scryptSync(password, salt, 64))
  )
    return null;
  return user.id;
}
export function token(userId: string) {
  const value = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO tokens VALUES(?,?,?)").run(
    createHash("sha256").update(value).digest("hex"),
    userId,
    Date.now() + 7 * 86400000,
  );
  return value;
}
export function revoke(value: string) {
  db.prepare("DELETE FROM tokens WHERE hash=?").run(
    createHash("sha256").update(value).digest("hex"),
  );
}
export function authenticate(value: string) {
  const row = db
    .prepare(
      "SELECT users.* FROM users JOIN tokens ON users.id=tokens.user_id WHERE tokens.hash=? AND expires>?",
    )
    .get(createHash("sha256").update(value).digest("hex"), Date.now()) as
    User | undefined;
  if (!row) throw new Error("Authentication required");
  return row;
}
export function mutate<T>(id: string, fn: (state: State) => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db.prepare("SELECT state FROM users WHERE id=?").get(id) as {
      state: string;
    };
    const state = JSON.parse(row.state) as State;
    for (const s of state.sessions) settle(s);
    const result = fn(state);
    db.prepare("UPDATE users SET state=? WHERE id=?").run(
      JSON.stringify(state),
      id,
    );
    db.exec("COMMIT");
    return result;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function state(id: string) {
  return mutate(id, (s) => s);
}
export function users() {
  return db.prepare("SELECT id,name,email,role FROM users").all();
}
export function audit() {
  return db.prepare("SELECT * FROM audit ORDER BY time DESC LIMIT 100").all();
}
export function fund(
  actor: string,
  target: string,
  currency: string,
  amount: number,
  reason: string,
  id: string,
) {
  db.exec("BEGIN IMMEDIATE");
  try {
    if (
      db.prepare("SELECT role FROM users WHERE id=?").get(actor)?.role !==
      "admin"
    )
      throw new Error("Administrator authorization required");
    const prior = db
      .prepare("SELECT actor,target,amount,reason FROM audit WHERE id=?")
      .get(id);
    if (prior) {
      if (
        prior.actor !== actor ||
        prior.target !== target ||
        prior.amount !== amount ||
        prior.reason !== reason
      )
        throw new Error("Idempotency key already used");
      db.exec("COMMIT");
      return;
    }
    const row = db.prepare("SELECT state FROM users WHERE id=?").get(target) as
      { state: string } | undefined;
    if (!row) throw new Error("User not found");
    const s = JSON.parse(row.state) as State;
    const a = s.accounts.find((a) => a.currency === currency);
    if (!a) throw new Error("Account not found");
    const now = Date.now();
    if (
      !Number.isSafeInteger(a.cash + amount) ||
      a.cash - reserves(a) + amount < 0
    )
      throw new Error("Adjustment exceeds available cash");
    a.cash += amount;
    a.initial += amount;
    a.ledger.push({ id, time: now, amount, reason });
    db.prepare("UPDATE users SET state=? WHERE id=?").run(
      JSON.stringify(s),
      target,
    );
    db.prepare("INSERT INTO audit VALUES(?,?,?,?,?,?)").run(
      id,
      actor,
      target,
      reason,
      amount,
      now,
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
db.exec(
  "CREATE TABLE IF NOT EXISTS classrooms(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES users(id),name TEXT NOT NULL,code TEXT UNIQUE NOT NULL,capital INTEGER NOT NULL DEFAULT 10000000); CREATE TABLE IF NOT EXISTS memberships(class_id TEXT NOT NULL REFERENCES classrooms(id),user_id TEXT NOT NULL REFERENCES users(id),PRIMARY KEY(class_id,user_id));",
);
export function classrooms(id: string, role: string) {
  const classes = (
    role === "admin"
      ? db.prepare("SELECT * FROM classrooms WHERE owner=?")
      : db.prepare(
          "SELECT c.* FROM classrooms c JOIN memberships m ON c.id=m.class_id WHERE m.user_id=?",
        )
  ).all(id);
  return classes.map((c) => ({
    id: String(c.id),
    name: String(c.name),
    code: role === "admin" ? String(c.code) : undefined,
    members: db
      .prepare(
        "SELECT u.id,u.name,u.state FROM users u JOIN memberships m ON u.id=m.user_id WHERE m.class_id=?",
      )
      .all(c.id as string)
      .map((u) => ({
        id: String(u.id),
        name: String(u.name),
        lessons: (JSON.parse(u.state as string) as State).completed.length,
      })),
  }));
}
export function createClassroom(owner: string, name: string) {
  if (
    db.prepare("SELECT role FROM users WHERE id=?").get(owner)?.role !== "admin"
  )
    throw new Error("Administrator authorization required");
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO classrooms(id,owner,name,code) VALUES(?,?,?,?)").run(
    id,
    owner,
    name,
    randomBytes(6).toString("hex"),
  );
  return id;
}
export function joinClassroom(id: string, code: string) {
  const c = db.prepare("SELECT id FROM classrooms WHERE code=?").get(code);
  if (!c) throw new Error("Invalid classroom invite code");
  db.prepare("INSERT OR IGNORE INTO memberships VALUES(?,?)").run(
    c.id as string,
    id,
  );
}
export type TradingRules = {
  capital: number;
  durations: number[];
  regions: string[];
};
db.exec(
  "CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL)",
);
db.prepare("INSERT OR IGNORE INTO settings VALUES('trading_rules',?)").run(
  JSON.stringify({
    capital: 10000000,
    durations: [15, 20, 25, 30, 35, 40, 45],
    regions: ["India", "USA", "Global"],
  }),
);
export function tradingRules(): TradingRules {
  return JSON.parse(
    (
      db
        .prepare("SELECT value FROM settings WHERE key='trading_rules'")
        .get() as { value: string }
    ).value,
  );
}
export function configureRules(
  actor: string,
  rules: TradingRules,
  reason: string,
  id: string,
) {
  db.exec("BEGIN IMMEDIATE");
  try {
    if (
      db.prepare("SELECT role FROM users WHERE id=?").get(actor)?.role !==
      "admin"
    )
      throw new Error("Administrator authorization required");
    if (db.prepare("SELECT id FROM audit WHERE id=?").get(id)) {
      db.exec("COMMIT");
      return;
    }
    db.prepare("UPDATE settings SET value=? WHERE key='trading_rules'").run(
      JSON.stringify(rules),
    );
    db.prepare("INSERT INTO audit VALUES(?,?,?,?,?,?)").run(
      id,
      actor,
      actor,
      `Session configuration: ${JSON.stringify(rules)}. ${reason}`,
      0,
      Date.now(),
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
