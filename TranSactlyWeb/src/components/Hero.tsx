"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [balance, setBalance] = useState(24891);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    const iv = setInterval(
      () => setBalance((b) => b + Math.floor(Math.random() * 3 - 1)),
      2800,
    );
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, []);

  const show = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
  });

  return (
    <>
      <style>{`
       

        /* ─── TOKENS ─── */
        :root {
          --amber  : #F5A800;
          --amber2 : #E09700;
          --amber3 : #FFD166;
          --navy   : #1A1033;
          --navy2  : #2C1D55;
          --ink    : #0E0920;
          --white  : #FFFCF0;
        }

        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        html  { scroll-behavior: smooth; }
        body  {
          background: var(--amber);
          color: var(--navy);
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ─── HALFTONE DOT FIELD (matches image corner marks) ─── */
        .dot-field {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(26,16,51,0.22) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        /* ─── NAV ─── */
        .footer-logo-dot { color: var(--amber); }
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 64px; height: 68px;
          background: var(--navy);
          border-bottom: 2px solid rgba(26,16,51,0.15);
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 22px;
          color: var(--navy); letter-spacing: -0.04em;
        }
        .logo-dot { color: var(--ink); }
        .nav-links { display: flex; gap: 40px; }
        .nav-links a {
          font-size: 14px; font-weight: 500;
          color: var(--amber); opacity: 0.65;
          text-decoration: none; transition: opacity .2s;
        }
        .nav-links a:hover { opacity: 1; }
        .nav-btn {
          background: var(--navy); color: var(--amber);
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 0.02em;
          border: none; border-radius: 6px;
          padding: 10px 22px; cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .nav-btn:hover { background: var(--ink); transform: translateY(-1px); }

        .underline-hover {
  position: relative;
  text-decoration: none;
}

.underline-hover::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 0;
  height: 2px;
  background: var(--amber);
  transition: width 0.3s ease;
}

.underline-hover:hover::after {
  width: 100%;
}
  
        /* ─── HERO LAYOUT ─── */
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 68px;
        }

        /* ─── LEFT COPY ─── */
        .hero-left {
          position: relative; z-index: 2;
          padding: 80px 40px 100px 64px;
          display: flex; flex-direction: column; align-items: flex-start;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy);
          color: var(--amber3);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 7px 14px 7px 10px;
          border-radius: 4px;
          margin-bottom: 30px;
        }
        .badge-pip {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--amber3);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }

        .headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(38px, 4.2vw, 66px);
          line-height: 1.0;
          color: rgba(255, 255, 255, 0.68);
          letter-spacing: -0.035em;
          margin-bottom: 22px;
        }
        /* the italic-styled second line, with a bold navy underbar */
        .hl-accent {
          display: block;
          position: relative;
          padding-bottom: 10px;
        }
        .hl-accent::after {
          content: '';
          position: absolute; left: 0; bottom: 0;
          width: 72%; height: 5px;
          background: var(--ink);
          border-radius: 3px;
        }

        .subtext {
          font-size: 16px; font-weight: 300; line-height: 1.7;
          color: rgba(255, 255, 255, 0.68);
          max-width: 400px; margin-bottom: 38px;
        }

        /* ─── CTA BUTTONS ─── */
        .cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 52px; }

        .btn-solid {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--navy); color: var(--amber);
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 14px 26px; border-radius: 6px;
          text-decoration: none;
          border: 2px solid var(--navy);
          transition: background .2s, transform .15s;
        }
        .btn-solid:hover { background: var(--ink); border-color: var(--ink); transform: translateY(-2px); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; color: var(--navy);
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 14px 26px; border-radius: 6px;
          text-decoration: none;
          border: 2px solid var(--navy);
          transition: background .2s, transform .15s;
        }
        .btn-outline:hover { background: rgba(26,16,51,0.08); transform: translateY(-2px); }

        /* ─── STATS ROW ─── */
        .stats { display: flex; align-items: center; gap: 28px; }
        .stat { }
        .stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #F5A800; line-height: 1;
        }
        .stat-lbl {
          font-size: 12px; font-weight: 400; letter-spacing: 0.04em;
          color: rgb(255, 255, 255); margin-top: 3px;
        }
        .stat-rule {
          width: 1.5px; height: 40px;
          background: rgba(26,16,51,0.18);
          flex-shrink: 0;
        }

        /* ─── RIGHT IMAGE SIDE ─── */
        .hero-right {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          padding: 80px 56px 100px 24px;
        }

        .img-wrap {
          position: relative;
          width: 100%; max-width: 560px;
        }

        /* bold navy offset shadow behind image */
        .img-wrap::before {
          content: '';
          position: absolute;
          top: 14px; right: -14px; bottom: -14px; left: 14px;
          background: var(--navy);
          border-radius: 18px;
          z-index: 0;
        }

        .img-wrap img {
          position: relative; z-index: 1;
          width: 100%; height: auto; display: block;
          border-radius: 14px;
          border: 3px solid var(--navy);
        }

        /* ─── FLOATING PILL CHIPS ─── */
        .chip {
          position: absolute; z-index: 4;
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy);
          color: var(--amber);
          font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
          padding: 9px 16px;
          border-radius: 100px;
          border: 2px solid rgba(245,168,0,0.25);
          white-space: nowrap;
          /* hard navy drop-shadow matches image illustration shadow style */
          box-shadow: 3px 3px 0 rgba(14,9,32,0.55);
        }
        .chip-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--amber3);
          flex-shrink: 0;
        }

        .chip-a {
          top: 18px; left: -18px;
          animation: chipfloat1 5s ease-in-out infinite;
        }
        .chip-b {
          top: 50%; right: -22px;
          transform: translateY(-50%);
          animation: chipfloat2 6s ease-in-out infinite 0.8s;
        }
        .chip-c {
          bottom: 28px; left: -18px;
          animation: chipfloat1 7s ease-in-out infinite 1.4s;
        }

        @keyframes chipfloat1 {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-9px); }
        }
        @keyframes chipfloat2 {
          0%,100% { transform: translateY(-50%); }
          50%      { transform: translateY(calc(-50% - 9px)); }
        }

        /* ─── MARQUEE TICKER ─── */
        .ticker {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          height: 42px; overflow: hidden;
          background: var(--navy);
          border-top: 2px solid var(--amber2);
          display: flex; align-items: center;
        }
        .ticker-track {
          display: flex; gap: 0;
          animation: ticker-scroll 30s linear infinite;
          white-space: nowrap;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .tick-item {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 0 28px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--amber);
          border-right: 1px solid rgba(245,168,0,0.18);
        }
        .tick-item svg { opacity: 0.55; flex-shrink: 0; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 860px) {
          .hero { grid-template-columns: 1fr; }
          .hero-right { padding: 0 32px 80px; order: -1; }
          .img-wrap { max-width: 380px; margin: 0 auto; }
          .hero-left { padding: 40px 32px 60px; }
          .nav { padding: 0 24px; }
          .nav-links { display: none; }
          .chip-b { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="logo">
          {" "}
          <span className="footer-logo-name">
            fin<span className="footer-logo-dot">orio</span>
          </span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#faq">FAQs</a>
          <a href="#pricing">Pricing</a>
          <a href="#cta" className="underline-hover">
            Download our app
          </a>
        </div>
        <Link href="/login" className="nav-btn">
          Get Started
        </Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="dot-field" />

        {/* ── LEFT ── */}
        <div className="hero-left">
          <div className="badge" style={show(0)}>
            <span className="badge-pip" />
            Version 3.0 — Now Live
          </div>

          <h1 className="headline" style={show(100)}>
            Manage Money
            <br />
            <span className="hl-accent">with Confidence</span>
          </h1>

          <p className="subtext" style={show(200)}>
            Track spending, monitor your balance, request payments and send
            money effortlessly — all in one beautifully designed finance app
            built for real life.
          </p>

          <div className="cta-row" style={show(300)}>
            <a href="#" className="btn-solid">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.26c1.4-.06 2.37.71 3.17.75.96-.19 1.87-.98 3.3-.83 1.72.22 3 .98 3.79 2.54-3.47 1.88-2.9 6.16.48 7.62-.41 1.19-.89 2.28-1.74 3.94M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" />
              </svg>
              Download for iOS
            </a>
            <a href="#" className="btn-solid">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3.18 23.76c.34.19.74.2 1.1.04l13.2-7.62-2.72-2.72-11.58 10.3zM.38 1.14C.14 1.5 0 1.96 0 2.53v18.94c0 .57.14 1.04.38 1.4l.07.07 10.6-10.6v-.25L.45 1.07l-.07.07zM21.12 9.76l-2.78-1.6-3.04 3.04 3.04 3.04 2.8-1.62c.8-.46.8-1.4 0-1.86zM4.28.18L17.5 7.8l-2.72 2.72L3.18.2 4.28.18z" />
              </svg>
              Get on Android
            </a>
          </div>

          <div className="stats" style={show(420)}>
            <div className="stat">
              <div className="stat-val">2.4M+</div>
              <div className="stat-lbl">Active Users</div>
            </div>
            <div className="stat-rule" />
            <div className="stat">
              <div className="stat-val">$8B+</div>
              <div className="stat-lbl">Transactions</div>
            </div>
            <div className="stat-rule" />
            <div className="stat">
              <div className="stat-val">4.9★</div>
              <div className="stat-lbl">App Rating</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — image ── */}
        <div className="hero-right" style={show(150)}>
          <div className="img-wrap">
            {/* Place freepik_2838216654.png in /public/ */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/freepik_2838216654.png"
              alt="Finorio mobile banking — isometric bank illustration"
            />

            <div className="chip chip-a">
              <span className="chip-dot" />
              Bank-grade Security
            </div>

            <div className="chip chip-b">
              <span className="chip-dot" style={{ background: "#FFD166" }} />
              Instant Sync ⚡
            </div>

            <div className="chip chip-c">
              <span className="chip-dot" />
              Payment sent · $340
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {[
            "Zero Hidden Fees",
            "Instant Transfers",
            "Bank-Grade Security",
            "Smart Budgeting",
            "256-bit Encryption",
            "Real-time Alerts",
            "Global Payments",
            "No Monthly Charges",
            "Smart Analytics",
            "Zero Hidden Fees",
            "Instant Transfers",
            "Bank-Grade Security",
            "Smart Budgeting",
            "256-bit Encryption",
            "Real-time Alerts",
            "Global Payments",
            "No Monthly Charges",
            "Smart Analytics",
          ].map((item, i) => (
            <span key={i} className="tick-item">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="#F5A800">
                <path d="M4 0l1.1 2.8L8 4 5.1 5.2 4 8 2.9 5.2 0 4l2.9-1.2z" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
