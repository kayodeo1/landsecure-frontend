"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { GeoFeatureCollection } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="map-mini" />,
});

export default function LandingPage() {
  const { user } = useAuth();
  const [zones, setZones] = useState<GeoFeatureCollection | null>(null);

  useEffect(() => {
    api.zonesGeojson().then(setZones).catch(() => {});
  }, []);

  const appHref = user ? (user.role === "admin" ? "/admin/dashboard" : "/dashboard") : "/login";

  return (
    <>
      <header className="nav">
        <div className="container">
          <Link className="brand" href="/">
            <span className="logo">🛡️</span>
            <span>
              LandSecure<small>Property Risk Assessment</small>
            </span>
          </Link>
          <nav className="nav-links">
            <Link href="/">Home</Link>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <Link href="/verify">Verify Land</Link>
            <Link href={user ? appHref : "/login"}>{user ? "Dashboard" : "Sign in"}</Link>
            <Link className="btn btn-primary btn-sm" href={user ? appHref : "/register"}>
              {user ? "Open app" : "Get Started"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div>
            <span className="pill">● Government &amp; restricted-land verification</span>
            <h1>
              Don&apos;t lose your money to <span>unsafe land.</span>
            </h1>
            <p className="lead">
              LandSecure instantly checks any property coordinate against government-acquired,
              infrastructure and protected zones — so you know the risk <em>before</em> you pay.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" href="/verify">
                Verify a property →
              </Link>
              <a className="btn btn-ghost btn-lg" href="#how">
                See how it works
              </a>
            </div>
            <div className="stats">
              <div>
                <b>8,400+</b>
                <span>Verifications run</span>
              </div>
              <div>
                <b>1,200+</b>
                <span>Restricted zones mapped</span>
              </div>
              <div>
                <b>&lt; 3s</b>
                <span>Average report time</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="map-mini">
              <MapView
                center={[6.413, 3.682]}
                zoom={12}
                zones={zones}
                marker={{ lat: 6.41, lng: 3.68, color: "#d6322e" }}
                height={230}
                scrollWheelZoom={false}
              />
            </div>
            <div className="hc-body">
              <div className="flex between center" style={{ marginBottom: 10 }}>
                <strong style={{ color: "#0d2438" }}>Plot at 6.4100, 3.6800</strong>
                <span className="pill high">● High Risk</span>
              </div>
              <p style={{ margin: 0, color: "#5d6b78", fontSize: 14 }}>
                Falls within <b>Lekki Free Trade Zone (Acquisition Belt)</b>. Private title not
                recognised — do not proceed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="head">
            <div className="eyebrow">How it works</div>
            <h2>Three steps to peace of mind</h2>
            <p>No surveyor, no waiting in government offices, no guesswork.</p>
          </div>
          <div className="grid-3">
            <div className="feature">
              <div className="step">
                <span className="n">1</span>
                <h3>Enter the coordinates</h3>
                <p>
                  Type the latitude &amp; longitude, or drop a pin on the interactive map at the
                  exact plot you are considering.
                </p>
              </div>
            </div>
            <div className="feature">
              <div className="step">
                <span className="n">2</span>
                <h3>We check the zones</h3>
                <p>
                  The risk engine tests the point against every mapped government, infrastructure
                  and protected zone in real time.
                </p>
              </div>
            </div>
            <div className="feature">
              <div className="step">
                <span className="n">3</span>
                <h3>Get an instant report</h3>
                <p>
                  Receive a clear risk score, the legal basis, and a downloadable report you can
                  keep or share with your lawyer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt" id="features">
        <div className="container">
          <div className="head">
            <div className="eyebrow">Features</div>
            <h2>Built for everyday buyers</h2>
          </div>
          <div className="grid-4">
            {[
              ["🗺️", "Interactive maps", "See restricted zones drawn over a real map of your area."],
              ["⚡", "Instant scoring", "A 0–100 risk score with a HIGH / MEDIUM / LOW verdict in seconds."],
              ["⚖️", "Legal references", "Each flag cites the law and authority behind the restriction."],
              ["📄", "Downloadable reports", "Keep a timestamped PDF record of every verification."],
              ["📱", "Mobile-ready", "Check a plot on-site, from your phone, while you stand on it."],
              ["🕑", "Verification history", "All your past checks saved in one secure dashboard."],
              ["🔔", "Authority updates", "Zone data maintained by administrators from government sources."],
              ["🔒", "Audit trail", "Every check is logged for transparency and accountability."],
            ].map(([ic, h, p]) => (
              <div className="feature" key={h}>
                <div className="ic">{ic}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              background: "linear-gradient(150deg,#0d2438,#0b5c3a)",
              borderRadius: 18,
              padding: 54,
              textAlign: "center",
              color: "#fff",
            }}
          >
            <h2 style={{ color: "#fff", fontSize: 30 }}>Verify before you buy.</h2>
            <p style={{ color: "#c8d6e2", fontSize: 17, maxWidth: 560, margin: "10px auto 26px" }}>
              Join thousands of Nigerians who check land status before they pay a kobo.
            </p>
            <Link className="btn btn-primary btn-lg" href="/register">
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="cols">
            <div>
              <Link className="brand" href="/" style={{ color: "#fff", marginBottom: 14 }}>
                <span className="logo">🛡️</span> LandSecure
              </Link>
              <p>
                A web-based property risk assessment platform for instant verification of government
                and restricted land in Nigeria.
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <Link href="/verify">Verify land</Link>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
            </div>
            <div>
              <h4>Account</h4>
              <Link href="/login">Sign in</Link>
              <Link href="/register">Register</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="#">Privacy policy</a>
              <a href="#">Terms of use</a>
              <a href="#">Disclaimer</a>
            </div>
          </div>
          <div className="copy">
            <span>
              © 2025 LandSecure. A final-year project by Adiamo Sodiq (E046135), University of
              Ibadan.
            </span>
            <span>Verify Before You Buy</span>
          </div>
        </div>
      </footer>
    </>
  );
}
