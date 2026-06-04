"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Pill from "@/components/Pill";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import { fmtTime } from "@/lib/format";
import type { GeoFeatureCollection, LogRow, Stats } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 320, borderRadius: 10 }} />,
});

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((100 * value) / total) : 0;
  return (
    <div className="mb">
      <div className="flex between">
        <span>{label}</span>
        <b>
          {value} · {pct}%
        </b>
      </div>
      <div className="progress">
        <i style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [zones, setZones] = useState<GeoFeatureCollection | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.zonesGeojson().then(setZones).catch(() => {});
    api.logs().then(setLogs).catch(() => {});
  }, []);

  const totalReports = stats ? stats.reports_high + stats.reports_medium + stats.reports_low : 0;

  return (
    <AppShell variant="admin" requireAdmin crumb={<>Admin / <b>Dashboard</b></>}>
      <div className="page-h">
        <div>
          <h1>Administration overview</h1>
          <p>Platform activity and government zone data at a glance.</p>
        </div>
        <Link className="btn btn-primary" href="/admin/zones/new">
          ✎ Add government zone
        </Link>
      </div>

      <div className="grid-4 mb">
        <StatCard icon="👥" tone="b" value={stats?.users ?? "—"} label="Registered users" />
        <StatCard icon="▤" tone="g" value={stats?.zones ?? "—"} label="Mapped zones" />
        <StatCard icon="▦" tone="a" value={stats?.verifications ?? "—"} label="Verifications" />
        <StatCard
          icon="⚠"
          tone="r"
          value={stats ? `${stats.high_risk_pct}%` : "—"}
          label="High-risk flags"
          delta={{ dir: "down", text: "of all checks" }}
        />
      </div>

      <div className="grid-2 mb">
        <div className="card">
          <div className="card-h">
            <h3>Zone coverage</h3>
            <Link href="/admin/zones" className="btn btn-outline btn-sm">
              Manage zones
            </Link>
          </div>
          <div className="card-b">
            <MapView center={[6.95, 3.7]} zoom={8} zones={zones} height={320} />
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Verifications by risk level</h3>
          </div>
          <div className="card-b">
            <Bar label="High risk" value={stats?.reports_high ?? 0} total={totalReports} color="#d6322e" />
            <Bar label="Medium risk" value={stats?.reports_medium ?? 0} total={totalReports} color="#d98a00" />
            <Bar label="Low risk" value={stats?.reports_low ?? 0} total={totalReports} color="#0f7a4d" />
            <hr style={{ border: "none", borderTop: "1px solid #e3e8ee", margin: "18px 0" }} />
            <h4 style={{ marginBottom: 12 }}>At a glance</h4>
            <div className="flex between" style={{ fontSize: 14, marginBottom: 8 }}>
              <span>
                <span className="dot high" /> Flagged (high + medium)
              </span>
              <b>{(stats?.reports_high ?? 0) + (stats?.reports_medium ?? 0)}</b>
            </div>
            <div className="flex between" style={{ fontSize: 14 }}>
              <span>
                <span className="dot low" /> Cleared (low risk)
              </span>
              <b>{stats?.reports_low ?? 0}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Recent verification activity</h3>
          <Link href="/admin/logs" className="btn btn-outline btn-sm">
            View full log
          </Link>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Coordinates</th>
              <th>Reference</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  No verification activity yet.
                </td>
              </tr>
            )}
            {logs.slice(0, 6).map((l) => (
              <tr key={l.log_id}>
                <td className="muted">{fmtTime(l.ts)}</td>
                <td>{l.user_name ?? "—"}</td>
                <td className="mono">{l.coordinate ?? "—"}</td>
                <td className="mono">{l.reference ?? "—"}</td>
                <td>{l.risk_level ? <Pill level={l.risk_level} suffix="" /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
