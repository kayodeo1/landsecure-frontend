"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Pill from "@/components/Pill";
import RiskGauge from "@/components/RiskGauge";
import { api } from "@/lib/api";
import { fmtCoord, fmtDateTime } from "@/lib/format";
import type { GeoFeatureCollection, Report } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 300, borderRadius: 10 }} />,
});

export default function ReportPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const [report, setReport] = useState<Report | null>(null);
  const [zones, setZones] = useState<GeoFeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.report(id).then(setReport).catch((e) => setError(e?.message ?? "Not found"));
    api.zonesGeojson().then(setZones).catch(() => {});
  }, [id]);

  async function downloadPdf() {
    if (!report) return;
    setDownloading(true);
    try {
      await api.downloadReportPdf(report.report_id, report.reference);
    } finally {
      setDownloading(false);
    }
  }

  const crumb = (
    <>
      Buyer / Reports / <b>{report?.reference ?? "…"}</b>
    </>
  );

  if (error) {
    return (
      <AppShell variant="buyer" crumb={crumb}>
        <div className="empty">
          {error}. <Link href="/history">Back to history</Link>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell variant="buyer" crumb={crumb}>
        <div className="center-screen">
          <span className="spinner" /> &nbsp;Loading report…
        </div>
      </AppShell>
    );
  }

  const alertClass =
    report.risk_level === "high" ? "danger" : report.risk_level === "medium" ? "warn" : "ok";

  return (
    <AppShell variant="buyer" crumb={crumb}>
      <div className="page-h">
        <div>
          <h1>Risk Assessment Report</h1>
          <p>
            Generated for plot at {fmtCoord(report.lat)}, {fmtCoord(report.lng)}
          </p>
        </div>
        <div className="flex gap">
          <Link className="btn btn-outline" href="/verify">
            ↻ New check
          </Link>
          <button className="btn btn-primary" onClick={downloadPdf} disabled={downloading}>
            {downloading ? "Preparing…" : "⬇ Download report"}
          </button>
        </div>
      </div>

      <div className="report-head">
        <div className="verdict">
          <RiskGauge score={report.score} color={report.color} caption="Risk score" />
          <div className="vtxt">
            <Pill level={report.risk_level} />
            <b style={{ color: "#0d2438", marginTop: 8, display: "block" }}>{report.verdict}</b>
            <div className="mono" style={{ color: "#5d6b78", marginTop: 4 }}>
              {fmtCoord(report.lat)}, {fmtCoord(report.lng)}
            </div>
          </div>
        </div>
        <dl className="kv">
          <dt>Reference</dt>
          <dd className="mono">{report.reference}</dd>
          <dt>Date issued</dt>
          <dd>{fmtDateTime(report.created_at)}</dd>
          <dt>Plot description</dt>
          <dd>{report.description || "—"}</dd>
          <dt>Zones matched</dt>
          <dd>{report.matched_zones.length}</dd>
        </dl>
      </div>

      <div className="grid-2 mb">
        <div className="card">
          <div className="card-h">
            <h3>Assessment summary</h3>
          </div>
          <div className="card-b">
            <div className={`alert ${alertClass} mb`}>
              ⚠ <span>{report.recommendation}</span>
            </div>
            <h4 style={{ marginBottom: 10 }}>Findings</h4>
            <ul className="findings">
              {report.matched_zones.length === 0 && (
                <li>
                  <b style={{ color: "#0f7a4d" }}>No restricted zone</b> detected at or within 500 m
                  of this coordinate.
                </li>
              )}
              {report.matched_zones.map((m, i) => (
                <li key={i}>
                  {m.relation === "within" ? (
                    <b style={{ color: "#d6322e" }}>Inside restricted zone: </b>
                  ) : (
                    <b style={{ color: "#d98a00" }}>Near restricted zone ({m.distance} m): </b>
                  )}
                  {m.name} <span className="muted">— {m.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Location</h3>
          </div>
          <div className="card-b">
            <MapView
              center={[report.lat, report.lng]}
              zoom={14}
              zones={zones}
              marker={{ lat: report.lat, lng: report.lng, color: report.color }}
              height={300}
            />
            <p style={{ fontSize: 13, color: "#5d6b78", marginBottom: 0 }}>
              Red/amber overlays show restricted zones near the assessed point.
            </p>
          </div>
        </div>
      </div>

      {report.matched_zones.length > 0 && (
        <div className="card mb">
          <div className="card-h">
            <h3>Legal basis &amp; authority</h3>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Type</th>
                <th>Authority</th>
                <th>Relation</th>
                <th>Legal reference</th>
              </tr>
            </thead>
            <tbody>
              {report.matched_zones.map((m, i) => (
                <tr key={i}>
                  <td>
                    <b>{m.name}</b>
                  </td>
                  <td>{m.zone_type}</td>
                  <td>{m.authority}</td>
                  <td>
                    {m.relation === "within" ? (
                      <span className="pill high">● Within</span>
                    ) : (
                      <span className="pill med">● {m.distance} m</span>
                    )}
                  </td>
                  <td className="muted">{m.legal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="alert warn">
        ⚠{" "}
        <span>
          <b>Disclaimer:</b> LandSecure provides an automated risk indication from mapped government
          data. It is not a substitute for a formal title search or a registered surveyor&apos;s
          report. Always confirm at the State Lands Registry before any payment.
        </span>
      </div>
    </AppShell>
  );
}
