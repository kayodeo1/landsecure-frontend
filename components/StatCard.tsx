export default function StatCard({
  icon,
  tone = "g",
  value,
  label,
  delta,
}: {
  icon: string;
  tone?: "g" | "b" | "r" | "a";
  value: React.ReactNode;
  label: string;
  delta?: { dir: "up" | "down"; text: string };
}) {
  return (
    <div className="stat">
      <div className="top">
        <div className={`ic ${tone}`}>{icon}</div>
        {delta && <span className={`delta ${delta.dir}`}>{delta.text}</span>}
      </div>
      <div className="v">{value}</div>
      <div className="l">{label}</div>
    </div>
  );
}
