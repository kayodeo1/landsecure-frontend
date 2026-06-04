"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Toast, { ToastState } from "@/components/Toast";
import { api } from "@/lib/api";
import type { GeoFeatureCollection, Severity, Zone } from "@/lib/types";

const ZoneEditorMap = dynamic(() => import("@/components/ZoneEditorMap"), {
  ssr: false,
  loading: () => <div className="mapbox skeleton" />,
});

const TYPES = [
  "Government Acquisition",
  "Infrastructure Corridor",
  "Environmental / Protected",
  "Aviation Safety Zone",
  "Government Institution",
];

export default function ZoneEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const zoneId = isNew ? null : parseInt(params.id, 10);

  const [name, setName] = useState("");
  const [zoneType, setZoneType] = useState(TYPES[0]);
  const [authority, setAuthority] = useState("");
  const [status, setStatus] = useState("Restricted");
  const [severity, setSeverity] = useState<Severity>("high");
  const [note, setNote] = useState("");
  const [legal, setLegal] = useState("");
  const [boundary, setBoundary] = useState<[number, number][]>([]);
  const [allZones, setAllZones] = useState<GeoFeatureCollection | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    api.zonesGeojson().then(setAllZones).catch(() => {});
    if (!isNew && zoneId != null) {
      api
        .zones()
        .then((zones) => {
          const z = zones.find((x) => x.zone_id === zoneId);
          if (z) {
            setName(z.name);
            setZoneType(z.zone_type);
            setAuthority(z.authority ?? "");
            setStatus(z.status ?? "Restricted");
            setSeverity(z.severity);
            setNote(z.note ?? "");
            setLegal(z.legal ?? "");
            setBoundary(z.boundary);
          }
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // context = every other zone, so the admin can see neighbours while drawing
  const context = useMemo<GeoFeatureCollection | null>(() => {
    if (!allZones) return null;
    return {
      type: "FeatureCollection",
      features: allZones.features.filter((f) => f.properties.zone_id !== zoneId),
    };
  }, [allZones, zoneId]);

  async function save() {
    if (!name.trim()) return setToast({ msg: "Zone name is required", kind: "err" });
    if (boundary.length < 3)
      return setToast({ msg: "Draw a boundary with at least 3 points on the map", kind: "err" });
    setSaving(true);
    const payload = {
      name,
      zone_type: zoneType,
      authority,
      status,
      severity,
      note,
      legal,
      boundary,
    };
    try {
      if (isNew) await api.createZone(payload as any);
      else await api.updateZone(zoneId!, payload as any);
      router.push("/admin/zones");
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Save failed", kind: "err" });
      setSaving(false);
    }
  }

  const crumb = (
    <>
      Admin / Government Zones / <b>{isNew ? "Add zone" : "Edit zone"}</b>
    </>
  );

  if (loading) {
    return (
      <AppShell variant="admin" requireAdmin crumb={crumb}>
        <div className="center-screen">
          <span className="spinner" /> &nbsp;Loading zone…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell variant="admin" requireAdmin crumb={crumb}>
      <div className="page-h">
        <div>
          <h1>{isNew ? "Add a government zone" : "Edit government zone"}</h1>
          <p>Draw the zone boundary on the map and describe the restriction.</p>
        </div>
      </div>

      <div className="verify-grid">
        <div className="card">
          <div className="card-b">
            <div className="field">
              <label>Zone name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Zone type</label>
              <select value={zoneType} onChange={(e) => setZoneType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Responsible authority</label>
              <input value={authority} onChange={(e) => setAuthority(e.target.value)} />
            </div>
            <div className="row-2">
              <div className="field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option>Restricted</option>
                  <option>Caution</option>
                  <option>Cleared</option>
                </select>
              </div>
              <div className="field">
                <label>Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Description / note</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="field">
              <label>Legal reference</label>
              <textarea rows={2} value={legal} onChange={(e) => setLegal(e.target.value)} />
            </div>
            <div className="field">
              <label>Boundary ([lat, lng] vertices)</label>
              <textarea
                className="mono"
                rows={3}
                value={JSON.stringify(boundary)}
                onChange={(e) => {
                  try {
                    setBoundary(JSON.parse(e.target.value));
                  } catch {
                    /* keep typing */
                  }
                }}
              />
              <div className="hint">
                Use the polygon tool on the map to draw, edit or clear the boundary — or paste
                coordinates here.
              </div>
            </div>
            <div className="flex gap">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save zone"}
              </button>
              <Link className="btn btn-outline" href="/admin/zones">
                Cancel
              </Link>
            </div>
          </div>
        </div>
        <div>
          <ZoneEditorMap
            context={context}
            initial={boundary.length >= 3 ? boundary : null}
            onChange={setBoundary}
            height={560}
          />
          <div className="alert ok mt">
            ✓{" "}
            <span>
              <b>Drawing mode:</b> use the polygon tool (top-right) to draw the boundary. Click each
              vertex, then click the first point to close it. The risk engine will flag any
              coordinate that falls inside.
            </span>
          </div>
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  );
}
