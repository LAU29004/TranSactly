"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code"; // Make sure to import this
import styles from "./styles/Hero.module.css";
import Image from "next/image";
import Navbar from "./Navbar";

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [balance, setBalance] = useState(24891);
  const [showQR, setShowQR] = useState(false); // State for modal visibility

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

  const show = (delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
  });

  return (
    <>
      {/* NAV */}
      <Navbar />
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.dotField} />

        {/* ── LEFT ── */}
        <div className={styles.heroLeft}>
          <div className={styles.badge} style={show(0)}>
            <span className={styles.badgePip} />
            Version 1.0 — Now Live
          </div>

          <h1 className={styles.headline} style={show(100)}>
            Understand Your Finances.
            <br />
            <span className={styles.hlAccent}>Automatically.</span>
          </h1>

          <p className={styles.subtext} style={show(200)}>
            centfluence transforms bank SMS into real-time financial
            intelligence, AI insights, smart categorization, and spending
            forecast.
          </p>

          <div className={styles.ctaRow} style={show(300)}>
            {/* Turned into a interactive button to trigger modal */}
            <button
              onClick={() => setShowQR(true)}
              className={styles.btnSolid}
              style={{ border: "none", cursor: "pointer" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 3h2v2h-2v-2zm-6-3h2v5h-2v-5z" />
              </svg>
              Scan QR To Download Android Application
            </button>
            <Link href="/login" className={styles.btnSolid}>
              Login
            </Link>
            <button
              onClick={() =>
                window.open(
                  "https://youtube.com/watch?v=YOUR_VIDEO_ID",
                  "_blank",
                )
              }
              style={{
                background: "#FF0000",
                color: "#FFFFFF",
                border: "2px solid #FF0000",
                borderRadius: 14,
                padding: "14px 24px",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.background = "#FFFFFF";
                btn.style.color = "#FF0000";
                btn.style.borderColor = "#FF0000";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.background = "#FF0000";
                btn.style.color = "#FFFFFF";
                btn.style.borderColor = "#FF0000";
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.5 6.2a2.96 2.96 0 0 0-2.08-2.1C19.58 3.5 12 3.5 12 3.5s-7.58 0-9.42.6A2.96 2.96 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a2.96 2.96 0 0 0 2.08 2.1c1.84.6 9.42.6 9.42.6s7.58 0 9.42-.6a2.96 2.96 0 0 0 2.08-2.1C24 15.92 24 12 24 12s0-3.92-.5-5.8zM9.75 15.5v-7L16 12l-6.25 3.5z" />
              </svg>
              Watch Live Demo
            </button>
          </div>

          <div className={styles.stats} style={show(420)}>
            <div className={styles.stat}>
              <div className={styles.statVal}>AI</div>
              <div className={styles.statLbl}>Financial Assistant</div>
            </div>
            <div className={styles.statRule} />
            <div className={styles.stat}>
              <div className={styles.statVal}>Smart</div>
              <div className={styles.statLbl}>Transaction Categorization</div>
            </div>
            <div className={styles.statRule} />
            <div className={styles.stat}>
              <div className={styles.statVal}>Live</div>
              <div className={styles.statLbl}>Analytics Dashboard</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — image ── */}
        <div className={styles.heroRight} style={show(150)}>
          <div className={styles.imgWrap}>
            <img
              src="/freepik_2838216654.png"
              alt="centfluence - Understand Your Finances. Automatically."
            />

            <div className={`${styles.chip} ${styles.chipA}`}>
              <span className={styles.chipDot} />
              Bank-grade Security
            </div>

            <div className={`${styles.chip} ${styles.chipB}`}>
              <span
                className={styles.chipDot}
                style={{ background: "#FFD166" }}
              />
              Instant Sync ⚡
            </div>

            <div className={`${styles.chip} ${styles.chipC}`}>
              <span className={styles.chipDot} />
              Payment sent · Rs 340
            </div>
          </div>
        </div>
      </section>

      {/* QR MODAL OVERLAY */}
      {showQR && (
        <div className={styles.qrOverlay}>
          <div className={styles.qrModal}>
            <button className={styles.qrClose} onClick={() => setShowQR(false)}>
              ✕
            </button>

            <h3>Download centfluence</h3>
            <p>Scan this QR code on your Android phone.</p>

            <div className={styles.qrWrapper}>
              <QRCode
                value="https://github.com/LAU29004/TranSactly/releases/download/v1.0.0/app-release.apk"
                size={220}
              />
            </div>
          </div>
        </div>
      )}

      {/* TICKER */}
      <div className={styles.ticker}>
        <div className={styles.tickerTrack}>
          {[
            "AI-Powered Financial Insights",
            "Automatic SMS Transaction Tracking",
            "Smart Expense Categorization",
            "Subscription Monitoring",
            "Advanced Spending Analytics",
            "Merchant Intelligence Engine",
            "Personal Finance Dashboard",
            "Income & Expense Trends",
            "Exportable Financial Reports",
            "Google Secure Authentication",
            "Real-Time Money Insights",
            "Privacy-First Security",
            "AI-Powered Financial Insights",
            "Automatic SMS Transaction Tracking",
            "Smart Expense Categorization",
            "Subscription Monitoring",
            "Advanced Spending Analytics",
            "Merchant Intelligence Engine",
            "Personal Finance Dashboard",
            "Income & Expense Trends",
            "Exportable Financial Reports",
            "Google Secure Authentication",
            "Real-Time Money Insights",
            "Privacy-First Security",
          ].map((item, i) => (
            <span key={i} className={styles.tickItem}>
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
