"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("buyer@landsecure.ng");
  const [password, setPassword] = useState("buyer1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const u = await login(email, password);
      router.push(u.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-side">
        <Link className="brand" href="/" style={{ color: "#fff" }}>
          <span className="logo">🛡️</span> LandSecure
        </Link>
        <div>
          <h2>Verify before you buy.</h2>
          <ul>
            <li>
              <span className="ck">✓</span> Instant risk checks against government &amp; restricted
              zones
            </li>
            <li>
              <span className="ck">✓</span> Interactive maps with the exact legal basis for each flag
            </li>
            <li>
              <span className="ck">✓</span> Downloadable, timestamped verification reports
            </li>
            <li>
              <span className="ck">✓</span> Your full verification history in one place
            </li>
          </ul>
        </div>
        <p style={{ color: "#9fb3c4", fontSize: 13, margin: 0 }}>
          © 2025 LandSecure · University of Ibadan
        </p>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={onSubmit}>
          <h1>Welcome back</h1>
          <p className="sub">Sign in to run a new verification or review your reports.</p>

          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex between center" style={{ marginBottom: 20 }}>
            <label className="checkline">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="#" style={{ fontSize: 14 }}>
              Forgot password?
            </a>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="form-foot" style={{ marginTop: 18 }}>
            New to LandSecure? <Link href="/register">Create an account</Link>
          </p>
          <p className="form-foot" style={{ marginTop: 10, fontSize: 12 }}>
            Demo admin:{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setEmail("admin@landsecure.ng");
                setPassword("admin1234");
              }}
            >
              admin@landsecure.ng
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
