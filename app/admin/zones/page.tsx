"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Toast, { ToastState } from "@/components/Toast";
import { api } from "@/lib/api";
import type { Zone } from "@/lib/types";

function statusPill(status: string | null) {
  if (status === "Restricted") return <span className="pill high">Restricted</span>;
  if (status === "Caution") return <span className="pill med">Caution</span>;
  if (status === "Cleared") return <span className="pill low">Cleared</span>;
  return <span className="pill muted">{status ?? "—"}</span>;
}

function severityPill(sev: string) {
  const cls = sev === "high" ? "high" : sev === "medium" ? "med" : "low";
  const label = sev.charAt(0).toUpperCase() + sev.slice(1);
  return <span className={`pill ${cls}`}>● {label}</span>;
}

export default function AdminZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All types");
  const [sevFilter, setSevFilter] = useState("All severities");
  const [toast, setToast] = useState<ToastState | null>(null);

  function load() {
    api
      .zones()
      .then(setZones)
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function remove(z: Zone, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete zone "${z.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteZone(z.zone_id);
      setToast({ msg: `Deleted ${z.name}`, kind: "ok" });
      load();
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Delete failed", kind: "err" });
    }
  }

  const types = Array.from(new Set(zones.map((z) => z.zone_type)));
  const filtered = zones.filter(
    (z) =>
      (typeFilter === "All types" || z.zone_type === typeFilter) &&
      (sevFilter === "All severities" || z.severity === sevFilter.toLowerCase()),
  );

  return (
    <AppShell variant="admin" requireAdmin crumb={<>Admin / <b>Government Zones</b></>}>
      <div className="page-h">
        <div>
          <h1>Government zones</h1>
          <p>Restricted, acquired and protected land parcels used by the risk engine.</p>
        </div>
        <Link className="btn btn-primary" href="/admin/zones/new">
          ✎ Add new zone
        </Link>
      </div>

      <div className="flex gap mb">
        <select
          className="field"
          style={{ width: 220, margin: 0 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option>All types</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          className="field"
          style={{ width: 180, margin: 0 }}
          value={sevFilter}
          onChange={(e) => setSevFilter(e.target.value)}
        >
          <option>All severities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>{filtered.length} zones</h3>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Zone name</th>
              <th>Type</th>
              <th>Authority</th>
              <th>Status</th>
              <th>Severity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="muted">
                  <span className="spinner" /> Loading…
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((z) => (
                <tr
                  key={z.zone_id}
                  className="clickable"
                  onClick={() => router.push(`/admin/zones/${z.zone_id}`)}
                >
                  <td className="mono">{z.code ?? z.zone_id}</td>
                  <td>
                    <b>{z.name}</b>
                  </td>
                  <td>{z.zone_type}</td>
                  <td className="muted">{z.authority}</td>
                  <td>{statusPill(z.status)}</td>
                  <td>{severityPill(z.severity)}</td>
                  <td>
                    <div className="flex gap">
                      <Link
                        href={`/admin/zones/${z.zone_id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <button className="iconbtn danger" onClick={(e) => remove(z, e)} title="Delete">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  );
}
