export default function EquityCurve({
  points,
  currency,
}: {
  points: { time: number; equity: number }[];
  currency: string;
}) {
  if (points.length < 2)
    return <p>Equity observations will appear as the session progresses.</p>;
  const values = points.map((p) => p.equity),
    min = Math.min(...values),
    max = Math.max(...values),
    range = Math.max(100, max - min);
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${20 + (i / (points.length - 1)) * 660},${170 - ((p.equity - min) / range) * 140}`,
    )
    .join(" ");
  return (
    <figure style={{ margin: "20px 0" }}>
      <figcaption className="muted small">
        Observed session equity · {currency} · after fees
      </figcaption>
      <svg
        viewBox="0 0 700 200"
        role="img"
        aria-label={`Equity curve from ${(values[0] / 100).toFixed(2)} to ${(values.at(-1)! / 100).toFixed(2)} ${currency}`}
        style={{ width: "100%", maxHeight: 240 }}
      >
        <path d="M20 170 H680" stroke="var(--line)" />
        <path d={path} stroke="var(--teal)" strokeWidth="2.5" fill="none" />
        <text x="20" y="195" fill="var(--muted)" fontSize="10">
          Session start
        </text>
        <text x="600" y="195" fill="var(--muted)" fontSize="10">
          Last observation
        </text>
      </svg>
    </figure>
  );
}
