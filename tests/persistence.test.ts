import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { submit, account } from "../src/lib/engine";
import { price } from "../src/lib/market";

test("persistent authentication, transactional state, funding and classroom isolation", async () => {
  process.env.MARKETLAB_DB_PATH = join(
    mkdtempSync(join(tmpdir(), "marketlab-unit-")),
    "test.sqlite",
  );
  const db = await import("../src/lib/db");
  const password = crypto.randomUUID(),
    student = db.register("student@test.invalid", "Student", password),
    other = db.register("other@test.invalid", "Other", crypto.randomUUID()),
    admin = db.register(
      "admin@test.invalid",
      "Admin",
      crypto.randomUUID(),
      "admin",
    );
  assert.equal(db.login("student@test.invalid", password), student);
  assert.equal(db.login("student@test.invalid", "incorrect password"), null);
  const token = db.token(student);
  assert.equal(db.authenticate(token).id, student);
  db.revoke(token);
  assert.throws(() => db.authenticate(token), /Authentication/);
  const order = {
    id: crypto.randomUUID(),
    instrument: "XNAS:AAPL",
    side: "buy" as const,
    kind: "market" as const,
    quantity: 1,
    reason: "Persistent test hypothesis",
  };
  db.mutate(student, (s) => submit(s.accounts[1], order));
  assert.equal(db.state(student).accounts[1].orders.length, 1);
  assert.equal(db.state(other).accounts[1].orders.length, 0);
  const before = db.state(student).accounts[1].cash;
  assert.throws(() =>
    db.mutate(student, (s) => {
      s.accounts[1].cash = 1;
      throw new Error("Rollback test");
    }),
  );
  assert.equal(db.state(student).accounts[1].cash, before);
  const key = crypto.randomUUID();
  db.fund(admin, student, "USD", 500000, "Practice allocation test", key);
  db.fund(admin, student, "USD", 500000, "Practice allocation test", key);
  assert.equal(db.state(student).accounts[1].cash, before + 500000);
  assert.equal(db.audit().length, 1);
  assert.throws(() =>
    db.fund(
      admin,
      student,
      "USD",
      -100000000,
      "Oversized debit adjustment",
      crypto.randomUUID(),
    ),
  );
  assert.equal(db.state(student).accounts[1].cash, before + 500000);
  db.mutate(student, (s) => {
    s.sessions.push({
      id: "expired",
      start: Date.now() - 16 * 60000,
      expires: Date.now() - 60000,
      duration: 15,
      region: "USA",
      status: "active",
      news: ["n1"],
      account: account("USD", 10000000),
    });
  });
  assert.equal(db.state(student).sessions[0].status, "completed");
  assert.equal(db.state(student).sessions[0].report!.equity, 10000000);
  assert.throws(
    () =>
      db.configureRules(
        student,
        { capital: 20000000, durations: [15], regions: ["USA"] },
        "Unauthorized rules change",
        crypto.randomUUID(),
      ),
    /Administrator/,
  );
  db.configureRules(
    admin,
    { capital: 20000000, durations: [15], regions: ["USA"] },
    "Focused classroom session capital",
    crypto.randomUUID(),
  );
  assert.equal(db.tradingRules().capital, 20000000);
  assert.deepEqual(db.tradingRules().regions, ["USA"]);
  const classroom = db.createClassroom(admin, "First principles");
  const owned = db.classrooms(admin, "admin");
  const code = owned[0].code as string;
  db.joinClassroom(student, code);
  db.joinClassroom(student, code);
  assert.equal(db.classrooms(student, "student")[0].id, classroom);
  assert.equal(db.classrooms(student, "student")[0].code, undefined);
  assert.equal(db.classrooms(other, "student").length, 0);
  assert.equal(db.classrooms(student, "student")[0].members.length, 1);
  assert.equal(
    db.state(student).accounts[1].positions[0].cost,
    price("XNAS:AAPL") + Math.ceil(price("XNAS:AAPL") / 1000),
  );
});
