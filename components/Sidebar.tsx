"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const BUYER_NAV: NavItem[] = [
  { href: "/dashboard", icon: "▦", label: "Dashboard" },
  { href: "/verify", icon: "⊕", label: "New Verification" },
  { href: "/history", icon: "🕑", label: "History" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", icon: "▦", label: "Dashboard" },
  { href: "/admin/zones", icon: "🗺", label: "Government Zones" },
  { href: "/admin/layers", icon: "▤", label: "Map Layers" },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/admin/logs", icon: "🧾", label: "Audit Logs" },
];

export function initials(name?: string) {
  if (!name) return "··";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar({ variant }: { variant: "buyer" | "admin" }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const nav = variant === "admin" ? ADMIN_NAV : BUYER_NAV;
  const roleLabel = variant === "admin" ? "Administrator" : "Buyer";

  return (
    <aside className="sidebar">
      <Link className="brand" href="/" style={{ color: "#fff" }}>
        <span className="logo">🛡️</span> LandSecure
      </Link>
      <nav>
        <div className="navlabel">{variant === "admin" ? "Administration" : "Buyer"}</div>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={active ? "active" : ""}>
              <span className="ic">{item.icon}</span> {item.label}
            </Link>
          );
        })}
        <div className="navlabel">Account</div>
        <Link href="#">
          <span className="ic">⚙</span> Settings
        </Link>
        <Link href="/login">
          <span className="ic">⎋</span> Sign out
        </Link>
      </nav>
      <div className="side-foot">
        <div className="flex center gap">
          <span className="avatar">{initials(user?.full_name)}</span>
          <div>
            <b style={{ color: "#fff", display: "block", fontSize: 13 }}>
              {user?.full_name ?? "—"}
            </b>
            <span style={{ color: "#65798c" }}>{roleLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
