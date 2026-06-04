import type { RiskLevel } from "@/lib/types";

const CLASS: Record<string, string> = { high: "high", medium: "med", low: "low" };
const LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

export function riskClass(level: string) {
  return CLASS[level] ?? "muted";
}
export function riskLabel(level: string) {
  return LABEL[level] ?? level;
}

export default function Pill({ level, suffix = " Risk" }: { level: RiskLevel | string; suffix?: string }) {
  return (
    <span className={`pill ${riskClass(level)}`}>
      ● {riskLabel(level)}
      {suffix}
    </span>
  );
}
