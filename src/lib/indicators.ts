export function sma(values: number[], period: number): (number | null)[] {
  return values.map((_, i) =>
    i < period - 1
      ? null
      : values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period,
  );
}
export function ema(values: number[], period: number): (number | null)[] {
  let previous: number | null = null;
  return values.map((value, i) => {
    if (i < period - 1) return null;
    if (previous === null)
      previous = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    else
      previous = (value * 2) / (period + 1) + previous * (1 - 2 / (period + 1));
    return previous;
  });
}
export function rsi(values: number[], period = 14): (number | null)[] {
  let gain = 0,
    loss = 0;
  return values.map((value, i) => {
    if (i === 0) return null;
    const delta = value - values[i - 1],
      g = Math.max(0, delta),
      l = Math.max(0, -delta);
    if (i <= period) {
      gain += g / period;
      loss += l / period;
    } else {
      gain = (gain * (period - 1) + g) / period;
      loss = (loss * (period - 1) + l) / period;
    }
    if (i < period) return null;
    return gain === 0 && loss === 0
      ? 50
      : loss === 0
        ? 100
        : 100 - 100 / (1 + gain / loss);
  });
}
export function macd(values: number[]) {
  const fast = ema(values, 12),
    slow = ema(values, 26);
  return values.map((_, i) =>
    fast[i] !== null && slow[i] !== null ? fast[i]! - slow[i]! : null,
  );
}
