import type {
  GeoFeatureCollection,
  Layer,
  LogRow,
  Report,
  Stats,
  TokenResponse,
  User,
  Zone,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const TOKEN_KEY = "ls_token";
const REFRESH_KEY = "ls_refresh";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running on " + API_BASE + "?", 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      (Array.isArray(data?.detail) ? data.detail[0]?.msg : null) ||
      `Request failed (${res.status})`;
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), res.status);
  }
  return data as T;
}

/** Download a protected file (PDF/CSV) honouring the bearer token. */
async function download(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError("Download failed", res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  // --- auth ---
  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (full_name: string, email: string, password: string, role = "buyer") =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password, role }),
    }),
  me: () => request<User>("/api/auth/me"),

  // --- verify / reports ---
  verify: (body: {
    lat: number;
    lng: number;
    description?: string | null;
    state?: string | null;
    method?: string;
  }) => request<Report>("/api/verify", { method: "POST", body: JSON.stringify(body) }),
  reports: () => request<Report[]>("/api/reports"),
  report: (id: number) => request<Report>(`/api/reports/${id}`),
  downloadReportPdf: (id: number, reference: string) =>
    download(`/api/reports/${id}/pdf`, `LandSecure_${reference}.pdf`),

  // --- zones ---
  zones: () => request<Zone[]>("/api/zones"),
  zonesGeojson: () => request<GeoFeatureCollection>("/api/zones/geojson"),
  createZone: (body: Partial<Zone> & { boundary?: number[][]; geometry?: any }) =>
    request<Zone>("/api/zones", { method: "POST", body: JSON.stringify(body) }),
  updateZone: (id: number, body: Partial<Zone> & { boundary?: number[][]; geometry?: any }) =>
    request<Zone>(`/api/zones/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteZone: (id: number) => request<void>(`/api/zones/${id}`, { method: "DELETE" }),

  // --- layers ---
  layers: () => request<Layer[]>("/api/layers"),
  createLayer: (body: { name: string; source?: string | null; visible?: boolean }) =>
    request<Layer>("/api/layers", { method: "POST", body: JSON.stringify(body) }),
  updateLayer: (id: number, body: Partial<Layer>) =>
    request<Layer>(`/api/layers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteLayer: (id: number) => request<void>(`/api/layers/${id}`, { method: "DELETE" }),

  // --- users / logs / stats (admin) ---
  users: () => request<User[]>("/api/users"),
  updateUser: (id: number, body: { full_name?: string; role?: string; status?: string }) =>
    request<User>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  logs: () => request<LogRow[]>("/api/logs"),
  downloadLogsCsv: () => download("/api/logs/export.csv", "landsecure_audit_log.csv"),
  stats: () => request<Stats>("/api/admin/stats"),
};
