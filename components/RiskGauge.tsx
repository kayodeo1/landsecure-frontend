/** The conic-gradient risk gauge from the report/verify pages. */
export default function RiskGauge({
  score,
  color,
  caption = "Risk score",
  size = 150,
}: {
  score: number;
  color: string;
  caption?: string;
  size?: number;
}) {
  const inner = Math.round(size * 0.74);
  return (
    <div
      className="gauge"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${score * 3.6}deg, #eef1f4 0)`,
      }}
    >
      <div className="inner" style={{ width: inner, height: inner }}>
        <b>{score}</b>
        <span>{caption}</span>
      </div>
    </div>
  );
}
