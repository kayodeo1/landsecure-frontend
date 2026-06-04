"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Pill from "@/components/Pill";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fmtCoord, fmtDate } from "@/lib/format";
import type { Report } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState("6.41000");
  const [lng, setLng] = useState("3.68000");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .reports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = reports.length;
  const high = reports.filter((r) => r.risk_level === "high").length;
  const low = reports.filter((r) => r.risk_level === "low").length;

  async function quickVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.verify({ lat: parseFloat(lat), lng: parseFloat(lng), method: "coordinate" });
      router.push(`/report/${r.report_id}`);
    } catch {
      setBusy(false);
    }
  }

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <AppShell variant="buyer" crumb={<>Buyer / <b>Dashboard</b></>}>
      <div className="page-h">
        <div>
          <h1>Welcome back, {firstName}</h1>
          <p>Here&apos;s an overview of your land verification activity.</p>
        </div>
        <Link className="btn btn-primary" href="/verify">
          ⊕ New Verification
        </Link>
      </div>

      <div className="grid-4 mb">
        <StatCard icon="▦" tone="b" value={total} label="Total verifications" />
        <StatCard icon="⚠" tone="r" value={high} label="High-risk flags"
          delta={{ dir: "down", text: "avoided" }} />
        <StatCard icon="✓" tone="g" value={low} label="Cleared (low risk)"
          delta={{ dir: "up", text: "safe to proceed" }} />
        <StatCard icon="📄" tone="a" value={total} label="Reports saved"
          delta={{ dir: "up", text: "downloadable" }} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-h">
            <h3>Recent verifications</h3>
            <Link href="/history" className="btn btn-outline btn-sm">
              View all
            </Link>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Coordinates</th>
                <th>Risk</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="muted">
                    <span className="spinner" /> Loading…
                  </td>
                </tr>
              )}
              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    No verifications yet. Run your first check.
                  </td>
                </tr>
              )}
              {reports.slice(0, 5).map((r) => (
                <tr
                  key={r.report_id}
                  className="clickable"
                  onClick={() => router.push(`/report/${r.report_id}`)}
                >
                  <td className="mono">{r.reference}</td>
                  <td className="mono">
                    {fmtCoord(r.lat)}, {fmtCoord(r.lng)}
                  </td>
                  <td>
                    <Pill level={r.risk_level} suffix="" />
                  </td>
                  <td className="muted">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Quick verify</h3>
          </div>
          <div className="card-b">
            <p style={{ color: "#5d6b78", marginTop: 0 }}>
              Enter a coordinate to run an instant risk check.
            </p>
            <form onSubmit={quickVerify}>
              <div className="coord-row">
                <div className="field">
                  <label>Latitude</label>
                  <input value={lat} onChange={(e) => setLat(e.target.value)} />
                </div>
                <div className="field">
                  <label>Longitude</label>
                  <input value={lng} onChange={(e) => setLng(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary btn-block" disabled={busy}>
                {busy ? "Running…" : "Run verification →"}
              </button>
            </form>
            <div className="alert warn mt">
              ⚠{" "}
              <span>
                <b>Tip:</b> always confirm a low-risk result with a title search at the State Lands
                Registry before payment.
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
