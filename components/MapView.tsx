"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { GeoFeatureCollection } from "@/lib/types";

export interface MapMarker {
  lat: number;
  lng: number;
  color?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  zones?: GeoFeatureCollection | null;
  marker?: MapMarker | null;
  onClick?: (lat: number, lng: number) => void;
  height?: number | string;
  scrollWheelZoom?: boolean;
}

function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ marker }: { marker?: MapMarker | null }) {
  const map = useMap();
  useEffect(() => {
    if (marker) map.setView([marker.lat, marker.lng], Math.max(map.getZoom(), 14));
  }, [marker, map]);
  return null;
}

function zoneStyle(feature: any) {
  const color = feature?.properties?.color ?? "#5d6b78";
  return { color, weight: 2, fillColor: color, fillOpacity: 0.22 };
}

const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;

/** Escape interpolated zone fields so admin-entered values can't inject markup. */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function onEachZone(feature: any, layer: any) {
  const p = feature?.properties ?? {};
  // Only allow a strict hex colour into the style attribute.
  const color = HEX_COLOR.test(String(p.color ?? "")) ? p.color : "#d6322e";
  layer.bindPopup(
    `<b>${escapeHtml(p.name ?? "Zone")}</b><br>` +
      `<span style="color:#5d6b78">${escapeHtml(p.zone_type ?? "")} — ${escapeHtml(p.authority ?? "")}</span><br>` +
      `<span style="color:${color};font-weight:600">${escapeHtml(p.status ?? "")}</span>`,
  );
}

export default function MapView({
  center = [6.413, 3.682],
  zoom = 12,
  zones,
  marker,
  onClick,
  height = 560,
  scrollWheelZoom = true,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      style={{ height, width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
        maxZoom={19}
      />
      {zones && zones.features.length > 0 && (
        <GeoJSON key={zones.features.length} data={zones as any} style={zoneStyle} onEachFeature={onEachZone} />
      )}
      {marker && (
        <CircleMarker
          center={[marker.lat, marker.lng]}
          radius={10}
          pathOptions={{ color: "#fff", weight: 3, fillColor: marker.color ?? "#1c2733", fillOpacity: 1 }}
        />
      )}
      {onClick && <ClickHandler onClick={onClick} />}
      <Recenter marker={marker} />
    </MapContainer>
  );
}
