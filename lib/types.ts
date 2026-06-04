export type Role = "buyer" | "agent" | "legal" | "admin";
export type RiskLevel = "high" | "medium" | "low";
export type Severity = "high" | "medium" | "low";

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: Role;
  status: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface MatchedZone {
  zone_id: number | null;
  code: string | null;
  name: string;
  zone_type: string | null;
  authority: string | null;
  severity: string | null;
  status: string | null;
  note: string | null;
  legal: string | null;
  relation: string; // "within" | "near"
  distance: number;
}

export interface Report {
  report_id: number;
  reference: string;
  lat: number;
  lng: number;
  description: string | null;
  state: string | null;
  score: number;
  risk_level: RiskLevel;
  verdict: string | null;
  recommendation: string | null;
  color: string;
  matched_zones: MatchedZone[];
  created_at: string;
}

export interface Zone {
  zone_id: number;
  code: string | null;
  layer_id: number | null;
  name: string;
  zone_type: string;
  authority: string | null;
  status: string | null;
  severity: Severity;
  note: string | null;
  legal: string | null;
  boundary: [number, number][]; // [lat, lng]
}

export interface Layer {
  layer_id: number;
  name: string;
  source: string | null;
  visible: boolean;
  zone_count: number;
}

export interface LogRow {
  log_id: number;
  user_id: number | null;
  user_name: string | null;
  report_id: number | null;
  reference: string | null;
  method: string | null;
  risk_level: string | null;
  score: number | null;
  coordinate: string | null;
  ts: string;
}

export interface Stats {
  users: number;
  zones: number;
  verifications: number;
  high_risk_pct: number;
  reports_high: number;
  reports_medium: number;
  reports_low: number;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Polygon"; coordinates: number[][][] };
    properties: Record<string, any>;
  }>;
}
