import test from "node:test";
import assert from "node:assert/strict";
import {
  convert,
  averageCost,
  maximumDrawdown,
  ratio,
  learningScore,
} from "../src/lib/metrics";
test("rational currency conversion rounds symmetrically without float money", () => {
  assert.equal(convert(105, 3, 2), 158);
  assert.equal(convert(-105, 3, 2), -158);
  assert.throws(() => convert(100, 1, 0));
  assert.equal(averageCost(10001, 3), 3334);
  assert.equal(averageCost(10, 0), null);
});
test("drawdown tracks peaks rather than measuring against funding", () => {
  assert.equal(maximumDrawdown([10000, 12000, 9000, 11000]), 0.25);
  assert.equal(maximumDrawdown([]), 0);
});
test("invalid financial ratios are unavailable, not zero", () => {
  assert.equal(ratio(10, 0), null);
  assert.equal(ratio(10, -1), null);
  assert.equal(ratio(100, 5), 20);
});
test("learning score rewards lessons and evidence rather than risk or profit", () => {
  assert.equal(learningScore(10, 4), 100);
  assert.equal(learningScore(0, 0), 0);
});
