"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import LegendBox from "@/components/LegendBox";
import Pill from "@/components/Pill";
import RiskGauge from "@/components/RiskGauge";
import { api } from "@/lib/api";
import { fmtCoord } from "@/lib/format";
import type { GeoFeatureCollection, Report } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div id="map" className="skeleton" />,
});

export default function VerifyPage() {
  const [lat, setLat] = useState("6.41000");
  const [lng, setLng] = useState("3.68000");
  const [desc, setDesc] = useState("Plot 24, Lekki Phase 2 layout");
  const [stateName, setStateName] = useState("Lagos");
  const [zones, setZones] = useState<GeoFeatureCollection | null>(null);
  const [result, setResult] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.zonesGeojson().then(setZones).catch(() => {});
  }, []);

  async function assess(method: "coordinate" | "map_pin", la = lat, ln = lng) {
    const latN = parseFloat(la);
    const lngN = parseFloat(ln);
    if (Number.isNaN(latN) || Number.isNaN(lngN)) {
      setError("Enter a valid latitude and longitude.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const r = await api.verify({
        lat: latN,
        lng: lngN,
        description: desc,
        state: stateName,
        method,
      });
      setResult(r);
    } catch (err: any) {
      setError(err?.message ?? "Assessment failed");
    } finally {
      setBusy(false);
    }
  }

  function onMapClick(la: number, ln: number) {
    const las = la.toFixed(5);
    const lns = ln.toFixed(5);
    setLat(las);
    setLng(lns);
    assess("map_pin", las, lns);
  }

  const marker = result
    ? { lat: result.lat, lng: result.lng, color: result.color }
    : null;

  return (
    <AppShell variant="buyer" crumb={<>Buyer / <b>New Verification</b></>}>
      <div className="page-h">
        <div>
          <h1>Verify a property</h1>
          <p>Enter coordinates or click the map to drop a pin at the plot you want to check.</p>
        </div>
      </div>

      <div className="verify-grid">
        <div className="card">
          <div className="card-b">
            {error && <div className="form-error">{error}</div>}
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
            <div className="field">
              <label>
                Property / plot description{" "}
                <span style={{ fontWeight: 400, color: "#5d6b78" }}>(optional)</span>
              </label>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="field">
              <label>State</label>
              <select value={stateName} onChange={(e) => setStateName(e.target.value)}>
                <option>Lagos</option>
                <option>Oyo</option>
                <option>Ogun</option>
                <option>FCT Abuja</option>
              </select>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => assess("coordinate")}
              disabled={busy}
            >
              {busy ? "Assessing…" : "Assess risk →"}
            </button>
            <p style={{ fontSize: 13, color: "#5d6b78", textAlign: "center", margin: "12px 0 0" }}>
              or 📍 click anywhere on the map to set the point
            </p>

            <LegendBox />
          </div>
        </div>

        <div>
          <MapView
            center={[6.413, 3.682]}
            zoom={12}
            zones={zones}
            marker={marker}
            onClick={onMapClick}
            height={560}
          />
          {result && (
            <div className="card mt">
              <div className="card-b flex between center">
                <div className="verdict">
                  <RiskGauge score={result.score} color={result.color} caption="/ 100" size={120} />
                  <div className="vtxt">
                    <Pill level={result.risk_level} />
                    <b style={{ color: "#0d2438", marginTop: 6, display: "block" }}>
                      {result.verdict}
                    </b>
                    <div className="mono" style={{ color: "#5d6b78", fontSize: 13 }}>
                      {fmtCoord(result.lat)}, {fmtCoord(result.lng)}
                    </div>
                  </div>
                </div>
                <Link className="btn btn-primary btn-lg" href={`/report/${result.report_id}`}>
                  View full report →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
