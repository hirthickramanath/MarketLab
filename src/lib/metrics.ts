/** Integer money conversions use rational rates; no binary float multiplication. */
export function convert(
  amount: number,
  numerator: number,
  denominator: number,
) {
  if (
    ![amount, numerator, denominator].every(Number.isSafeInteger) ||
    numerator < 0 ||
    denominator <= 0
  )
    throw new Error("Invalid conversion");
  const n = BigInt(amount) * BigInt(numerator),
    d = BigInt(denominator);
  const absolute = n < 0n ? -n : n;
  const rounded = (absolute + d / 2n) / d;
  const result = Number(n < 0n ? -rounded : rounded);
  if (!Number.isSafeInteger(result)) throw new Error("Conversion overflow");
  return result;
}
export function averageCost(cost: number, quantity: number) {
  if (quantity <= 0) return null;
  return convert(cost, 1, quantity);
}
export function maximumDrawdown(values: number[]) {
  let peak = 0,
    max = 0;
  for (const value of values) {
    peak = Math.max(peak, value);
    if (peak > 0) max = Math.max(max, (peak - value) / peak);
  }
  return max;
}
export function ratio(numerator: number, denominator: number) {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  )
    return null;
  return numerator / denominator;
}
export function learningScore(completed: number, evidenceEntries: number) {
  return Math.min(
    100,
    Math.max(0, completed) * 8 + Math.min(4, Math.max(0, evidenceEntries)) * 5,
  );
}
