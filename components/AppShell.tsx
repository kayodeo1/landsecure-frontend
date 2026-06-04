"use client";

import { useRequireAuth } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Authenticated layout: sidebar + topbar + content, gated by role.
 * Shows a spinner while the session resolves / redirects.
 */
export default function AppShell({
  variant,
  crumb,
  children,
  requireAdmin = false,
}: {
  variant: "buyer" | "admin";
  crumb: React.ReactNode;
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading } = useRequireAuth(requireAdmin ? "admin" : undefined);

  if (loading || !user || (requireAdmin && user.role !== "admin")) {
    return (
      <div className="center-screen">
        <span className="spinner" /> &nbsp;Loading…
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar variant={variant} />
      <div className="main">
        <Topbar crumb={crumb} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
