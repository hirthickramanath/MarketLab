import test from "node:test";
import assert from "node:assert/strict";
import {
  account,
  submit,
  equity,
  fee,
  reserves,
  finish,
  settle,
  Session,
  tick,
} from "../src/lib/engine";
import { price, bars } from "../src/lib/market";
const input = (extra = {}) => ({
  id: crypto.randomUUID(),
  instrument: "XNAS:AAPL",
  side: "buy" as const,
  kind: "market" as const,
  quantity: 10,
  reason: "Diversified hypothesis",
  ...extra,
});
test("buy and sell preserve integer accounting including fees", () => {
  const a = account("USD", 10000000),
    p = price("XNAS:AAPL");
  submit(a, input());
  assert.equal(a.cash, 10000000 - p * 10 - fee(p * 10));
  assert.equal(a.positions[0].cost, p * 10 + fee(p * 10));
  assert.equal(equity(a), 10000000 - fee(p * 10));
  submit(a, input({ side: "sell", quantity: 5 }));
  assert.equal(a.positions[0].quantity, 5);
  assert.equal(equity(a), 10000000 - fee(p * 10) - fee(p * 5));
});
test("duplicate id is idempotent", () => {
  const a = account("USD", 10000000),
    o = input();
  submit(a, o);
  const cash = a.cash;
  submit(a, o);
  assert.equal(a.cash, cash);
  assert.equal(a.orders.length, 1);
  assert.equal(a.ledger.length, 2);
});
test("rejects currency mixing, overspend, invalid shares and short sells", () => {
  assert.throws(() => submit(account("INR", 10000000), input()), /currencies/);
  assert.throws(() => submit(account("USD", 1), input()), /cash/);
  assert.throws(
    () => submit(account("USD", 10000000), input({ quantity: 1.5 })),
    /quantity/,
  );
  assert.throws(
    () => submit(account("USD", 10000000), input({ side: "sell" })),
    /holdings/,
  );
});
test("limit orders reserve funds and cannot double spend", () => {
  const a = account("USD", 24000);
  submit(a, input({ kind: "limit", limit: 22000, quantity: 1 }));
  assert.equal(a.orders[0].status, "pending");
  assert.equal(reserves(a), 22022);
  assert.throws(() => submit(a, input({ quantity: 1 })), /cash/);
  a.orders[0].status = "cancelled";
  assert.equal(reserves(a), 0);
});
test("pending sells reserve holdings", () => {
  const a = account("USD", 10000000);
  submit(a, input());
  submit(
    a,
    input({ side: "sell", kind: "limit", limit: 999999, quantity: 10 }),
  );
  assert.throws(
    () => submit(a, input({ side: "sell", quantity: 1 })),
    /holdings/,
  );
});
test("expiration marks positions, cancels limits, retains capital and freezes report", () => {
  const start = 1000;
  const s: Session = {
    id: "session",
    start,
    expires: start + 15 * 60000,
    duration: 15,
    region: "USA",
    status: "active",
    news: ["n1"],
    account: account("USD", 10000000),
  };
  submit(s.account, input({ kind: "limit", limit: 1 }), 0, start);
  settle(s, s.expires);
  assert.equal(s.status, "completed");
  assert.equal(s.account.orders[0].status, "cancelled");
  assert.equal(s.account.initial, 10000000);
  assert.equal(s.report!.equity, 10000000);
  const report = JSON.stringify(s.report);
  finish(s, s.expires + 10000);
  assert.equal(JSON.stringify(s.report), report);
});
test("replay clock caps at expiry and chart has no future candles", () => {
  const s = { start: 1000, expires: 901000, duration: 15 } as Session;
  assert.equal(tick(s, 31000), 0);
  assert.equal(tick(s, 121000), 2);
  assert.equal(tick(s, 100000000), 15);
  assert.equal(bars("XNAS:AAPL", 2).length, 32);
  assert.equal(bars("XNAS:AAPL", 2).at(-1)!.close, price("XNAS:AAPL", 2) / 100);
});
test("pending orders never execute against ticks before submission", () => {
  const s: Session = {
    id: "s",
    start: 1000,
    expires: 901000,
    duration: 15,
    region: "USA",
    status: "active",
    news: [],
    account: account("USD", 10000000),
  };
  submit(
    s.account,
    input({
      side: "buy",
      kind: "limit",
      quantity: 1,
      limit: price("XNAS:AAPL", 0) - 1000,
    }),
    0,
    121000,
  );
  settle(s, 121000);
  const o = s.account.orders[0];
  if (o.status === "filled") assert.ok(s.account.ledger.at(-1)!.time >= 121000);
});

test("sell realizes weighted-average cost including both transaction fees", () => {
  const a = account("USD", 10000000),
    p = price("XNAS:AAPL");
  submit(a, input({ quantity: 2 }));
  submit(a, input({ side: "sell", quantity: 2 }));
  assert.equal(a.realized, -2 * fee(p * 2));
  assert.equal(a.positions.length, 0);
});
test("rejects order notional overflow before mutating state", () => {
  const a = account("USD", 10000000);
  assert.throws(
    () =>
      submit(
        a,
        input({
          kind: "limit",
          limit: Number.MAX_SAFE_INTEGER,
          quantity: 10000,
        }),
      ),
    /overflow/,
  );
  assert.equal(a.orders.length, 0);
});
