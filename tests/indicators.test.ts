import test from "node:test";
import assert from "node:assert/strict";
import { sma, ema, rsi, macd } from "../src/lib/indicators";
test("SMA and EMA are unavailable until the seeded period is observed", () => {
  assert.deepEqual(sma([1, 2, 3, 4], 3), [null, null, 2, 3]);
  assert.deepEqual(ema([1, 2, 3, 4], 3), [null, null, 2, 3]);
});
test("Wilder RSI handles flat, rising and falling valid series", () => {
  assert.equal(rsi(Array(20).fill(100)).at(-1), 50);
  assert.equal(rsi(Array.from({ length: 20 }, (_, i) => i)).at(-1), 100);
  assert.equal(rsi(Array.from({ length: 20 }, (_, i) => 20 - i)).at(-1), 0);
  assert.equal(rsi([10, 20])[1], null);
});
test("MACD uses only available seeded observations", () => {
  const result = macd(Array(35).fill(10));
  assert.equal(result[24], null);
  assert.equal(result[25], 0);
  assert.equal(result.at(-1), 0);
});
