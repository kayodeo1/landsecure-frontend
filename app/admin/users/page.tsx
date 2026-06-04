"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import Toast, { ToastState } from "@/components/Toast";
import { initials } from "@/components/Sidebar";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { Role, User } from "@/lib/types";

function rolePill(role: string) {
  if (role === "admin") return <span className="pill high">Admin</span>;
  if (role === "buyer") return <span className="pill info">Buyer</span>;
  return <span className="pill muted">{role.charAt(0).toUpperCase() + role.slice(1)}</span>;
}

function statusPill(status: string) {
  return status === "active" ? (
    <span className="pill low">Active</span>
  ) : (
    <span className="pill muted">Suspended</span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("buyer");
  const [status, setStatus] = useState("active");
  const [toast, setToast] = useState<ToastState | null>(null);

  function load() {
    api
      .users()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openManage(u: User) {
    setEditing(u);
    setRole(u.role);
    setStatus(u.status);
  }

  async function save() {
    if (!editing) return;
    try {
      await api.updateUser(editing.user_id, { role, status });
      setToast({ msg: `Updated ${editing.full_name}`, kind: "ok" });
      setEditing(null);
      load();
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Update failed", kind: "err" });
    }
  }

  const count = (r: string) => users.filter((u) => u.role === r).length;

  return (
    <AppShell variant="admin" requireAdmin crumb={<>Admin / <b>Users</b></>}>
      <div className="page-h">
        <div>
          <h1>User accounts</h1>
          <p>Manage registered buyers, agents and administrators.</p>
        </div>
      </div>

      <div className="grid-4 mb">
        <StatCard icon="👥" tone="b" value={users.length} label="Total users" />
        <StatCard icon="●" tone="g" value={count("buyer")} label="Buyers" />
        <StatCard icon="●" tone="a" value={count("agent") + count("legal")} label="Agents & legal" />
        <StatCard icon="●" tone="r" value={count("admin")} label="Admins" />
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Users</h3>
          <span className="muted" style={{ fontSize: 13 }}>
            {users.length} accounts
          </span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="muted">
                  <span className="spinner" /> Loading…
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u.user_id}>
                  <td>
                    <div className="flex center gap">
                      <span className="avatar">{initials(u.full_name)}</span>
                      <b>{u.full_name}</b>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td>{rolePill(u.role)}</td>
                  <td className="muted">{fmtDate(u.created_at)}</td>
                  <td>{statusPill(u.status)}</td>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openManage(u);
                      }}
                    >
                      Manage
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3 style={{ margin: 0 }}>Manage {editing.full_name}</h3>
              <button className="iconbtn" onClick={() => setEditing(null)}>
                ✕
              </button>
            </div>
            <div className="modal-b">
              <div className="field">
                <label>Email</label>
                <input value={editing.email} disabled />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="buyer">Buyer</option>
                  <option value="agent">Agent</option>
                  <option value="legal">Legal</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="modal-f">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  );
}
