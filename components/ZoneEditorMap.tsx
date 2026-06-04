"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet-draw";
import { useEffect } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { GeoFeatureCollection } from "@/lib/types";

type Boundary = [number, number][]; // [lat, lng]

function DrawLayer({
  initial,
  onChange,
}: {
  initial?: Boundary | null;
  onChange: (boundary: Boundary) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const group = new L.FeatureGroup();
    map.addLayer(group);

    // seed with the existing polygon (editable)
    if (initial && initial.length >= 3) {
      const poly = L.polygon(initial as any, {
        color: "#0f7a4d",
        weight: 2,
        fillColor: "#0f7a4d",
        fillOpacity: 0.25,
      });
      group.addLayer(poly);
      try {
        map.fitBounds(poly.getBounds(), { padding: [40, 40] });
      } catch {
        /* ignore */
      }
    }

    const emit = () => {
      let boundary: Boundary = [];
      group.eachLayer((layer: any) => {
        if (layer.getLatLngs) {
          const ring = layer.getLatLngs()[0] as L.LatLng[];
          boundary = ring.map((p) => [
            Number(p.lat.toFixed(6)),
            Number(p.lng.toFixed(6)),
          ]) as Boundary;
        }
      });
      onChange(boundary);
    };

    const drawControl = new (L.Control as any).Draw({
      position: "topright",
      draw: {
        polygon: { allowIntersection: false, showArea: false, shapeOptions: { color: "#0f7a4d" } },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: group, remove: true },
    });
    map.addControl(drawControl);

    const onCreated = (e: any) => {
      group.clearLayers(); // keep a single polygon
      group.addLayer(e.layer);
      emit();
    };

    map.on((L as any).Draw.Event.CREATED, onCreated);
    map.on((L as any).Draw.Event.EDITED, emit);
    map.on((L as any).Draw.Event.DELETED, emit);

    return () => {
      map.off((L as any).Draw.Event.CREATED, onCreated);
      map.off((L as any).Draw.Event.EDITED, emit);
      map.off((L as any).Draw.Event.DELETED, emit);
      map.removeControl(drawControl);
      map.removeLayer(group);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function contextStyle(feature: any) {
  const color = feature?.properties?.color ?? "#5d6b78";
  return { color, weight: 1, fillColor: color, fillOpacity: 0.1, dashArray: "4" };
}

export default function ZoneEditorMap({
  center = [6.6, 3.6],
  zoom = 9,
  context,
  initial,
  onChange,
  height = 520,
}: {
  center?: [number, number];
  zoom?: number;
  context?: GeoFeatureCollection | null; // other zones for reference
  initial?: Boundary | null;
  onChange: (boundary: Boundary) => void;
  height?: number | string;
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%", borderRadius: 12 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
        maxZoom={19}
      />
      {context && context.features.length > 0 && (
        <GeoJSON key={context.features.length} data={context as any} style={contextStyle} />
      )}
      <DrawLayer initial={initial} onChange={onChange} />
    </MapContainer>
  );
}
