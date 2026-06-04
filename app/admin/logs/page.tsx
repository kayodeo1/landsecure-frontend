"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Pill from "@/components/Pill";
import { api } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import type { LogRow } from "@/lib/types";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .logs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell variant="admin" requireAdmin crumb={<>Admin / <b>Verification Logs</b></>}>
      <div className="page-h">
        <div>
          <h1>Verification audit trail</h1>
          <p>Every risk check run on the platform, for transparency and accountability.</p>
        </div>
        <button className="btn btn-outline" onClick={() => api.downloadLogsCsv()}>
          ⬇ Export CSV
        </button>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Verification log</h3>
          <span className="muted" style={{ fontSize: 13 }}>
            {logs.length} entries
          </span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Coordinates</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Score</th>
              <th>Result</th>
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
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  No verification activity logged yet.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.log_id}>
                <td className="mono">LOG-{String(l.log_id).padStart(5, "0")}</td>
                <td className="muted">{fmtDateTime(l.ts)}</td>
                <td>{l.user_name ?? "—"}</td>
                <td className="mono">{l.coordinate ?? "—"}</td>
                <td>{l.method === "map_pin" ? "Map pin" : "Coordinate"}</td>
                <td className="mono">{l.reference ?? "—"}</td>
                <td>
                  <b>{l.score ?? "—"}</b>
                </td>
                <td>{l.risk_level ? <Pill level={l.risk_level} suffix="" /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
