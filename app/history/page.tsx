"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Pill from "@/components/Pill";
import { api } from "@/lib/api";
import { fmtCoord, fmtDate } from "@/lib/format";
import type { Report } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .reports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const high = reports.filter((r) => r.risk_level === "high").length;
  const medium = reports.filter((r) => r.risk_level === "medium").length;
  const low = reports.filter((r) => r.risk_level === "low").length;

  function zoneMatched(r: Report) {
    const within = r.matched_zones.find((m) => m.relation === "within") ?? r.matched_zones[0];
    return within ? within.name : "—";
  }

  return (
    <AppShell variant="buyer" crumb={<>Buyer / <b>History</b></>}>
      <div className="page-h">
        <div>
          <h1>Verification history</h1>
          <p>Every property risk check you have run, with its result.</p>
        </div>
        <Link className="btn btn-primary" href="/verify">
          ⊕ New Verification
        </Link>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>{reports.length} verifications</h3>
          <div className="flex gap">
            <span className="pill high">{high} High</span>
            <span className="pill med">{medium} Medium</span>
            <span className="pill low">{low} Low</span>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Description</th>
              <th>Coordinates</th>
              <th>Zone matched</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="muted">
                  <span className="spinner" /> Loading…
                </td>
              </tr>
            )}
            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  No verifications yet.{" "}
                  <Link href="/verify">Run your first check →</Link>
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr
                key={r.report_id}
                className="clickable"
                onClick={() => router.push(`/report/${r.report_id}`)}
              >
                <td className="mono">{r.reference}</td>
                <td>{r.description || "—"}</td>
                <td className="mono">
                  {fmtCoord(r.lat)}, {fmtCoord(r.lng)}
                </td>
                <td className="muted">{zoneMatched(r)}</td>
                <td>
                  <b>{r.score}</b>
                </td>
                <td>
                  <Pill level={r.risk_level} suffix="" />
                </td>
                <td className="muted">{fmtDate(r.created_at)}</td>
                <td>
                  <Link href={`/report/${r.report_id}`} onClick={(e) => e.stopPropagation()}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
