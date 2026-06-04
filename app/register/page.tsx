"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const ROLE_FOR_LABEL: Record<string, string> = {
  "Buyer / Individual": "buyer",
  "Real estate agent": "agent",
  "Legal practitioner": "legal",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [first, setFirst] = useState("Sodiq");
  const [last, setLast] = useState("Adiamo");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+234 803 555 0142");
  const [accountType, setAccountType] = useState("Buyer / Individual");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const role = ROLE_FOR_LABEL[accountType] ?? "buyer";
      const u = await register(`${first} ${last}`.trim(), email, password, role);
      router.push(u.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
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
          <h2>Protect your investment.</h2>
          <ul>
            <li>
              <span className="ck">✓</span> Free to create an account
            </li>
            <li>
              <span className="ck">✓</span> Run unlimited property verifications
            </li>
            <li>
              <span className="ck">✓</span> Save and download every report
            </li>
            <li>
              <span className="ck">✓</span> Check plots on-site from your phone
            </li>
          </ul>
        </div>
        <p style={{ color: "#9fb3c4", fontSize: 13, margin: 0 }}>
          © 2025 LandSecure · University of Ibadan
        </p>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={onSubmit}>
          <h1>Create your account</h1>
          <p className="sub">Start verifying land in under a minute.</p>

          {error && <div className="form-error">{error}</div>}

          <div className="row-2">
            <div className="field">
              <label>First name</label>
              <input value={first} onChange={(e) => setFirst(e.target.value)} required />
            </div>
            <div className="field">
              <label>Last name</label>
              <input value={last} onChange={(e) => setLast(e.target.value)} required />
            </div>
          </div>
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
            <label>Phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Account type</label>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
              <option>Buyer / Individual</option>
              <option>Real estate agent</option>
              <option>Legal practitioner</option>
            </select>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>
          <label className="checkline" style={{ marginBottom: 18 }}>
            <input type="checkbox" defaultChecked required /> I agree to the Terms of Use and Privacy
            Policy
          </label>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p className="form-foot" style={{ marginTop: 18 }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
