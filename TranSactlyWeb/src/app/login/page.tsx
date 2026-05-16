"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [done, setDone] = useState(false);

  return (
    <>
      <style>{`
        /* ─── TOKENS (mirrored from Hero) ─── */
        :root {
          --amber  : #F5A800;
          --amber2 : #E09700;
          --amber3 : #FFD166;
          --navy   : #1A1033;
          --navy2  : #2C1D55;
          --ink    : #0E0920;
          --white  : #FFFCF0;
        }

.highlight-big {
  display: inline-block;
  background: var(--navy);
  color: var(--amber);
  padding: 6px 14px;
  border-radius: 8px;

  font-size: 22px;     /* BIG */
  font-weight: 800;
  letter-spacing: 0.02em;

  margin-bottom: 6px;
}

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: var(--amber);
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
          position: relative;
        }

        /* Halftone dot field — matches Hero */
        .login-dot-field {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(26,16,51,0.22) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        /* ══════════════════════════════════════
           LEFT PANEL
        ══════════════════════════════════════ */
        .login-left {
          display: none;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          z-index: 1;
        }
        @media (min-width: 1024px) { .login-left { display: flex; width: 50%; } }

        /* Amber glow */
        .login-left-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(14,9,32,0.18) 0%, transparent 80%);
        }
        /* Navy border right */
        .login-left::after {
          content: '';
          position: absolute; top: 0; right: 0; bottom: 0;
          width: 3px;
          background: var(--ink);
        }

        /* Logo — top left */
        .login-logo {
          position: absolute; top: 32px; left: 32px;
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .login-logo-icon {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: var(--navy);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 3px 3px 0 var(--ink);
        }
        .login-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px;
          color: var(--navy);
          letter-spacing: -0.04em;
        }
        .login-logo-dot { color: var(--ink); }

        /* Dashboard card */
        .login-card {
          position: relative;
          width: 100%; max-width: 340px;
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.25);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 8px 8px 0 var(--ink);
          animation: lc-float 7s ease-in-out infinite;
        }
        @keyframes lc-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }

        .lc-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .lc-greeting-sub { font-size: 10px; color: rgba(245,168,0,0.45); margin-bottom: 2px; }
        .lc-greeting-name { font-size: 13px; font-weight: 600; color: var(--white); }
        .lc-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--amber);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: var(--navy);
          border: 2px solid var(--ink);
        }

        .lc-balance-box {
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 16px;
          background: rgba(245,168,0,0.1);
          border: 1.5px solid rgba(245,168,0,0.25);
        }
        .lc-balance-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--amber3); margin-bottom: 4px;
        }
        .lc-balance-amount {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: var(--white); letter-spacing: -0.03em;
          line-height: 1;
        }
        .lc-balance-change {
          font-size: 10px; color: var(--amber3); margin-top: 4px;
        }

        .lc-chart { width: 100%; margin-bottom: 14px; }

        .lc-tx {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 0;
          border-bottom: 1px solid rgba(245,168,0,0.1);
        }
        .lc-tx:last-child { border-bottom: none; }
        .lc-tx-left { display: flex; align-items: center; gap: 8px; }
        .lc-tx-name { font-size: 11px; color: rgba(255,252,240,0.55); }
        .lc-tx-pos { font-size: 11px; font-weight: 600; color: var(--amber3); }
        .lc-tx-neg { font-size: 11px; font-weight: 600; color: rgba(255,252,240,0.45); }

        /* Floating chip */
        .lc-chip {
          position: absolute;
          top: -18px; right: -18px;
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.3);
          border-radius: 100px;
          padding: 7px 13px;
          display: flex; align-items: center; gap: 7px;
          box-shadow: 3px 3px 0 var(--ink);
          animation: lc-float 5s ease-in-out infinite 1s;
          white-space: nowrap;
        }
        .lc-chip-pip {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--amber3);
          animation: chip-blink 2s ease-in-out infinite;
        }
        @keyframes chip-blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .lc-chip-label {
          font-size: 10px; font-weight: 700;
          color: var(--amber3);
          letter-spacing: 0.04em;
        }

        /* Bottom text */
        .login-left-foot {
          position: absolute; bottom: 36px;
          font-size: 11px; font-weight: 400;
          color: rgba(14,9,32,0.45);
          text-align: center; max-width: 260px; line-height: 1.6;
        }

        /* ══════════════════════════════════════
           RIGHT PANEL — FORM
        ══════════════════════════════════════ */
        .login-right {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 24px;
          position: relative; z-index: 1;
        }

        /* Mobile logo */
        .login-mobile-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          margin-bottom: 40px;
        }
        @media (min-width: 1024px) { .login-mobile-logo { display: none; } }

        .login-form-wrap { width: 100%; max-width: 360px; }

        /* ── Success state ── */
        .login-success {
          text-align: center; padding: 32px 0;
        }
        .login-success-icon {
          width: 68px; height: 68px; border-radius: 50%;
          background: rgba(26,16,51,0.12);
          border: 2px solid var(--navy);
          box-shadow: 4px 4px 0 var(--ink);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 20px;
        }
        .login-success h2 {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: var(--navy); letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .login-success p {
          font-size: 14px; color: rgba(26,16,51,0.55);
          margin-bottom: 24px;
        }
        .login-success-link {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy); color: var(--amber);
          font-size: 13px; font-weight: 700;
          padding: 12px 24px; border-radius: 8px;
          text-decoration: none;
          box-shadow: 4px 4px 0 var(--ink);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .login-success-link:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 var(--ink);
        }

        /* ── Tab switcher ── */
        .login-tabs {
          display: flex;
          background: var(--navy);
          border: 2px solid var(--ink);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 32px;
          box-shadow: 4px 4px 0 var(--ink);
        }
        .login-tab {
          flex: 1; padding: 10px;
          border: none; border-radius: 7px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: background 0.2s, color 0.2s;
          text-transform: capitalize;
        }
        .login-tab.active {
          background: var(--amber);
          color: var(--navy);
        }
        .login-tab:not(.active) {
          background: transparent;
          color: rgba(245,168,0,0.4);
        }
        .login-tab:not(.active):hover { color: var(--amber3); }

        /* ── Heading ── */
        .login-heading {
          font-family: 'Syne', sans-serif;
          font-size: 30px; font-weight: 800;
          color: var(--navy); letter-spacing: -0.035em;
          margin-bottom: 6px;
          position: relative;
          display: inline-block;
          padding-bottom: 8px;
        }
        .login-heading::after {
          content: '';
          position: absolute; left: 0; bottom: 0;
          width: 60%; height: 4px;
          background: var(--ink); border-radius: 3px;
        }
        .login-subhead {
          font-size: 13px; font-weight: 300; line-height: 1.6;
          color: rgba(14,9,32,0.5);
          margin-bottom: 28px; margin-top: 14px;
        }

        /* ── Social buttons ── */
        .login-socials {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 22px;
        }
        .login-social-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          background: var(--navy);
          border: 2px solid var(--ink);
          border-radius: 10px;
          padding: 11px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--white);
          cursor: pointer;
          box-shadow: 3px 3px 0 var(--ink);
          transition: transform 0.18s, box-shadow 0.18s, background 0.2s;
        }
        .login-social-btn:hover {
          background: var(--navy2);
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 var(--ink);
        }

        /* ── Divider ── */
        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 22px;
        }
        .login-divider-line {
          flex: 1; height: 1.5px;
          background: rgba(14,9,32,0.18);
        }
        .login-divider-label {
          font-size: 11px; color: rgba(14,9,32,0.4);
          white-space: nowrap;
        }

        /* ── Form fields ── */
        .login-field { margin-bottom: 16px; }
        .login-field-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 7px;
        }
        .login-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgb(14, 9, 32);
        }
        .login-forgot {
          font-size: 11px; font-weight: 600;
          color: rgb(14, 9, 32); text-decoration: none;
          opacity: 0.65;
          transition: opacity 0.2s;
        }
        .login-forgot:hover { opacity: 1; }

        .login-input {
          width: 100%;
          background: rgba(26,16,51,0.07);
          border: 2px solid rgba(14,9,32,0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 400;
          color: rgb(14, 9, 32);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input::placeholder { color: rgba(14,9,32,0.28); }
        .login-input:focus {
          border-color: var(--navy);
          box-shadow: 3px 3px 0 var(--ink);
        }

        /* ── Submit button ── */
        .login-submit {
          width: 100%;
          background: var(--navy);
          color: var(--amber);
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 14px;
          border: 2px solid var(--ink);
          border-radius: 10px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 4px 4px 0 var(--ink);
          transition: background 0.2s, transform 0.18s, box-shadow 0.18s;
          margin-top: 8px;
        }
        .login-submit:hover:not(:disabled) {
          background: var(--ink);
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(14,9,32,0.5);
        }
        .login-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── Footer text ── */
        .login-switch {
          text-align: center;
          font-size: 12px;
          color: rgb(14, 9, 32);
          margin-top: 22px;
        }
        .login-switch-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 700;
          color: rgb(14, 9, 32); 
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .login-switch-btn:hover { opacity: 0.7; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="login-root">
        <div className="login-dot-field" />

        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-left-glow" />

          {/* Logo */}
          <Link href="/" className="login-logo">
            <div className="login-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#F5A800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="login-logo-name">
              fin<span className="login-logo-dot">orio</span>
            </span>
          </Link>

          {/* Dashboard preview card */}
          <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
            <div className="login-card">
              <div className="lc-header">
                <div>
                  <p className="lc-greeting-sub">Good morning</p>
                  <p className="lc-greeting-name">Welcome back 👋</p>
                </div>
                <div className="lc-avatar">AM</div>
              </div>

              <div className="lc-balance-box">
                <p className="lc-balance-label">Balance</p>
                <p className="lc-balance-amount">$24,891.50</p>
                <p className="lc-balance-change">↑ +12.4% this month</p>
              </div>

              {/* Mini chart */}
              <svg viewBox="0 0 280 55" className="lc-chart">
                <defs>
                  <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A800" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 C40,30 70,45 110,25 C140,10 170,38 210,18 C240,4 265,30 280,12"
                  fill="none"
                  stroke="#F5A800"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M0,40 C40,30 70,45 110,25 C140,10 170,38 210,18 C240,4 265,30 280,12 L280,55 L0,55Z"
                  fill="url(#lcg)"
                />
              </svg>

              {/* Transactions */}
              {[
                { icon: "🛒", n: "Groceries", a: "-$42.00", pos: false },
                { icon: "💼", n: "Salary", a: "+$4,200", pos: true },
                { icon: "☕", n: "Coffee", a: "-$5.80", pos: false },
              ].map((t, i) => (
                <div key={i} className="lc-tx">
                  <div className="lc-tx-left">
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span className="lc-tx-name">{t.n}</span>
                  </div>
                  <span className={t.pos ? "lc-tx-pos" : "lc-tx-neg"}>
                    {t.a}
                  </span>
                </div>
              ))}
            </div>

            {/* Floating chip */}
            <div className="lc-chip">
              <span className="lc-chip-pip" />
              <span className="lc-chip-label">Live sync active</span>
            </div>
          </div>

          <p className="login-left-foot">
            Join 500,000+ users who trust Finorio with their finances every day.
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          {/* Mobile logo */}
          <Link href="/" className="login-mobile-logo">
            <div
              className="login-logo-icon"
              style={{
                background: "var(--navy)",
                boxShadow: "3px 3px 0 var(--ink)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#F5A800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="login-logo-name">
              fin<span className="login-logo-dot">orio</span>
            </span>
          </Link>

          <div className="login-form-wrap">
            {done ? (
              <div className="login-success">
                <div className="login-success-icon">✓</div>
                <h2>You&apos;re in!</h2>
                <p>Redirecting to your dashboard…</p>
                <Link href="/dashboard" className="login-success-link">
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <>
                <p className="login-subhead">
                  <span className="highlight-big">Join Us</span>
                  <br />
                  and start managing money smarter today.
                </p>
                {/* Social login */}
                <div className="login-socials">
                  {[
                    {
                      label: "Google",
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      ),
                    },
                    {
                      label: "Apple",
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                          style={{ color: "var(--white)" }}
                        >
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.26c1.4-.06 2.37.71 3.17.75.96-.19 1.87-.98 3.3-.83 1.72.22 3 .98 3.79 2.54-3.47 1.88-2.9 6.16.48 7.62-.41 1.19-.89 2.28-1.74 3.94M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" />
                        </svg>
                      ),
                    },
                  ].map((s) => (
                    <button key={s.label} className="login-social-btn">
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
