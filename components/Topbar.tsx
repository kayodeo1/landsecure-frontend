"use client";

import { useAuth } from "@/lib/auth";
import { initials } from "./Sidebar";

export default function Topbar({ crumb }: { crumb: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="topbar">
      <div className="crumb">{crumb}</div>
      <div className="tb-right">
        <div className="searchbox">
          🔍 <input placeholder="Search…" />
        </div>
        <span className="avatar" title={user?.email}>
          {initials(user?.full_name)}
        </span>
      </div>
    </div>
  );
}
