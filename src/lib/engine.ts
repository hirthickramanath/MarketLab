import { convert } from "./metrics";
import { instruments, price } from "./market";
export type Position = { instrument: string; quantity: number; cost: number };
export type Order = {
  id: string;
  instrument: string;
  side: "buy" | "sell";
  kind: "market" | "limit";
  quantity: number;
  limit?: number;
  status: "pending" | "filled" | "cancelled";
  created: number;
  fill?: number;
  fee?: number;
  reason: string;
};
export type Ledger = {
  id: string;
  time: number;
  amount: number;
  reason: string;
};
export type Account = {
  id: string;
  currency: string;
  cash: number;
  available?: number;
  markedEquity?: number;
  initial: number;
  realized?: number;
  otherAssets?: number;
  positions: Position[];
  orders: Order[];
  ledger: Ledger[];
};
export type Session = {
  id: string;
  start: number;
  expires: number;
  duration: number;
  region: string;
  status: "active" | "completed";
  lastTick?: number;
  snapshots?: { time: number; equity: number }[];
  news: string[];
  account: Account;
  report?: {
    equity: number;
    return: number;
    fees: number;
    trades: number;
    ended: number;
  };
};
export type State = {
  accounts: Account[];
  sessions: Session[];
  watchlist: string[];
  journal: { id: string; text: string; time: number }[];
  completed: number[];
  notifications: { id: string; text: string; read: boolean }[];
  ipo?: { shares: number; cost: number };
};
export function account(
  currency: string,
  capital: number,
  id = crypto.randomUUID(),
): Account {
  return {
    id,
    currency,
    cash: capital,
    initial: capital,
    positions: [],
    orders: [],
    ledger: [
      {
        id: crypto.randomUUID(),
        time: Date.now(),
        amount: capital,
        reason: "Initial demonstration allocation — virtual funds only",
      },
    ],
  };
}
export function initialState(): State {
  return {
    accounts: [
      account("INR", 10000000),
      account("USD", 10000000),
      account("GBP", 10000000),
      account("JPY", 10000000),
    ],
    sessions: [],
    watchlist: ["XNSE:RELIANCE", "XNAS:AAPL"],
    journal: [],
    completed: [],
    notifications: [
      {
        id: "welcome",
        text: "Welcome. All market prices and events are illustrative; funds have no monetary value.",
        read: false,
      },
    ],
  };
}
export function tick(s: Session, now = Date.now()) {
  return Math.max(
    0,
    Math.min(
      s.duration,
      Math.floor((Math.min(now, s.expires) - s.start) / 60000),
    ),
  );
}
export function equity(a: Account, t = 0) {
  return (
    a.cash +
    (a.otherAssets ?? 0) +
    a.positions.reduce((sum, p) => sum + p.quantity * price(p.instrument, t), 0)
  );
}
export function fee(value: number) {
  return Math.max(1, Number((BigInt(value) + 999n) / 1000n));
}
export function reserves(a: Account) {
  return a.orders
    .filter((o) => o.status === "pending" && o.side === "buy")
    .reduce(
      (s, o) => s + o.quantity * o.limit! + fee(o.quantity * o.limit!),
      0,
    );
}
function fill(a: Account, o: Order, p: number, now: number) {
  const value = p * o.quantity,
    cost = fee(value);
  const holding = a.positions.find((x) => x.instrument === o.instrument);
  if (o.side === "buy") {
    if (a.cash < value + cost)
      throw new Error("Insufficient available virtual cash");
    a.cash -= value + cost;
    if (holding) {
      holding.cost += value + cost;
      holding.quantity += o.quantity;
    } else
      a.positions.push({
        instrument: o.instrument,
        quantity: o.quantity,
        cost: value + cost,
      });
  } else {
    if (!holding || holding.quantity < o.quantity)
      throw new Error("Insufficient unreserved holdings");
    const removed = convert(holding.cost, o.quantity, holding.quantity);
    holding.quantity -= o.quantity;
    holding.cost -= removed;
    a.cash += value - cost;
    a.realized = (a.realized ?? 0) + value - cost - removed;
    a.positions = a.positions.filter((p) => p.quantity > 0);
  }
  o.status = "filled";
  o.fill = p;
  o.fee = cost;
  a.ledger.push({
    id: o.id,
    time: now,
    amount: o.side === "buy" ? -value - cost : value - cost,
    reason: `${o.side} ${o.quantity} ${o.instrument}; fictional observed tick; fee included`,
  });
}
export function submit(
  a: Account,
  input: Pick<
    Order,
    "id" | "instrument" | "side" | "kind" | "quantity" | "limit" | "reason"
  >,
  t = 0,
  now = Date.now(),
) {
  if (a.orders.some((o) => o.id === input.id)) return;
  const instrument = instruments.find((i) => i.id === input.instrument);
  if (!instrument || instrument.currency !== a.currency)
    throw new Error("Instrument and account currencies must match");
  if (
    !Number.isSafeInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 10000
  )
    throw new Error("Invalid quantity");
  if (
    input.kind === "limit" &&
    (!Number.isSafeInteger(input.limit) || input.limit! <= 0)
  )
    throw new Error("A positive limit price is required");
  const p = price(input.instrument, t);
  const value = (input.kind === "limit" ? input.limit! : p) * input.quantity;
  if (!Number.isSafeInteger(value) || !Number.isSafeInteger(value + fee(value)))
    throw new Error("Order value overflow");
  if (input.side === "buy" && a.cash - reserves(a) < value + fee(value))
    throw new Error("Insufficient available virtual cash");
  const reserved = a.orders
    .filter(
      (o) =>
        o.status === "pending" &&
        o.side === "sell" &&
        o.instrument === input.instrument,
    )
    .reduce((s, o) => s + o.quantity, 0);
  if (
    input.side === "sell" &&
    (a.positions.find((p) => p.instrument === input.instrument)?.quantity ??
      0) -
      reserved <
      input.quantity
  )
    throw new Error("Insufficient unreserved holdings");
  const o: Order = { ...input, status: "pending", created: now };
  a.orders.push(o);
  if (o.kind === "market" || (o.side === "buy" ? p <= o.limit! : p >= o.limit!))
    fill(a, o, p, now);
}
export function settle(s: Session, now = Date.now()) {
  if (s.status !== "active") return;
  const end = tick(s, now);
  for (let t = (s.lastTick ?? -1) + 1; t <= end; t++) {
    const observed = s.start + t * 60000;
    for (const o of s.account.orders.filter(
      (o) => o.status === "pending" && o.created <= observed,
    )) {
      const p = price(o.instrument, t);
      if (o.side === "buy" ? p <= o.limit! : p >= o.limit!)
        fill(s.account, o, p, observed);
    }
    (s.snapshots ??= []).push({ time: observed, equity: equity(s.account, t) });
    s.lastTick = t;
  }
  if (now >= s.expires) finish(s, now);
}
export function finish(s: Session, now = Date.now()) {
  if (s.status === "completed") return;
  for (const o of s.account.orders)
    if (o.status === "pending") o.status = "cancelled";
  const e = equity(s.account, tick(s, now));
  (s.snapshots ??= []).push({ time: Math.min(now, s.expires), equity: e });
  s.status = "completed";
  s.report = {
    equity: e,
    return: e - s.account.initial,
    fees: s.account.orders.reduce((sum, o) => sum + (o.fee ?? 0), 0),
    trades: s.account.orders.filter((o) => o.status === "filled").length,
    ended: Math.min(now, s.expires),
  };
}
