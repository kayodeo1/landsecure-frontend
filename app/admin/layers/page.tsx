"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Toast, { ToastState } from "@/components/Toast";
import { api } from "@/lib/api";
import type { Layer } from "@/lib/types";

export default function AdminLayersPage() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [source, setSource] = useState("");

  function load() {
    api
      .layers()
      .then(setLayers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function toggle(layer: Layer) {
    try {
      await api.updateLayer(layer.layer_id, { visible: !layer.visible });
      setLayers((ls) =>
        ls.map((l) => (l.layer_id === layer.layer_id ? { ...l, visible: !l.visible } : l)),
      );
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Update failed", kind: "err" });
    }
  }

  async function addLayer() {
    if (!name.trim()) return setToast({ msg: "Layer name is required", kind: "err" });
    try {
      await api.createLayer({ name, source });
      setToast({ msg: `Added ${name}`, kind: "ok" });
      setShowAdd(false);
      setName("");
      setSource("");
      load();
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Create failed", kind: "err" });
    }
  }

  return (
    <AppShell variant="admin" requireAdmin crumb={<>Admin / <b>Map Layers</b></>}>
      <div className="page-h">
        <div>
          <h1>Map layers</h1>
          <p>GIS data layers rendered on the verification map and used by the risk engine.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          ＋ Import layer
        </button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Source</th>
              <th>Zones</th>
              <th>Visible</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="muted">
                  <span className="spinner" /> Loading…
                </td>
              </tr>
            )}
            {!loading &&
              layers.map((l) => (
                <tr key={l.layer_id}>
                  <td>
                    <b>{l.name}</b>
                  </td>
                  <td className="muted">{l.source ?? "—"}</td>
                  <td>{l.zone_count}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={l.visible}
                        onChange={() => toggle(l)}
                      />
                      <span className="track" />
                    </label>
                  </td>
                  <td>
                    {l.visible ? (
                      <span className="pill low">Active</span>
                    ) : (
                      <span className="pill muted">Hidden</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3 style={{ margin: 0 }}>Import map layer</h3>
              <button className="iconbtn" onClick={() => setShowAdd(false)}>
                ✕
              </button>
            </div>
            <div className="modal-b">
              <div className="field">
                <label>Layer name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coastal setbacks" />
              </div>
              <div className="field">
                <label>Source</label>
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. NESREA / State GIS"
                />
              </div>
              <div className="hint">
                Zones are attached to a layer when you create them in the zone editor.
              </div>
            </div>
            <div className="modal-f">
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={addLayer}>
                Add layer
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  );
}
