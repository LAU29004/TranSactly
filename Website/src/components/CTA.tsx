"use client";
import { Fragment } from "react";
import { useState } from "react";
import QRCode from "react-qr-code";
import styles from "./styles/CTA.module.css";

export default function CTA() {
  const [showQR, setShowQR] = useState(false);
  return (
    <section className={styles.ctaSection} id="cta">
      <div className={styles.ctaDotField} />

      <div className={styles.ctaWrap}>
        <div className={styles.ctaCard}>
          {/* Decorative elements */}
          <div className={styles.ctaGlow} />
          <div className={styles.ctaGrid} />
          <div className={styles.ctaDecoA}>
            <div className={styles.ctaDecoAInner} />
          </div>
          <div className={styles.ctaDecoB} />
          <div className={styles.ctaDecoC} />

          <div className={styles.ctaContent}>
            {/* Badge */}
            <div className={styles.ctaBadge}>
              <span className={styles.ctaBadgePip} />
              Get Started Today
            </div>

            {/* Heading */}
            <h2 className={styles.ctaHeading}>
              Start managing your money{" "}
              <span className={styles.ctaHeadingAccent}>the smart way</span>
            </h2>

            {/* Sub */}
            <p className={styles.ctaSub}>
              From tracking expenses to sending payments, everything is designed
              to be simple, fast, and secure.
            </p>

            {/* DOWNLOAD TRIGGER BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                marginBottom: "32px",
                zIndex: 2,
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowQR(true)}
                style={{
                  background: "var(--navy)",
                  color: "var(--amber)",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 24px",
                  border: "2px solid var(--ink)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "4px 4px 0 var(--ink)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 3h2v2h-2v-2zm-6-3h2v5h-2v-5z" />
                </svg>
                Scan to Download APK
              </button>
            </div>

            {/* QR Overlay Modal Layout */}
            {showQR && (
              <div className={styles.qrOverlay}>
                <div className={styles.qrModal}>
                  <button
                    className={styles.qrClose}
                    onClick={() => setShowQR(false)}
                  >
                    ✕
                  </button>

                  <h3>Download centfluence</h3>

                  <p>Scan this QR code on your Android phone.</p>

              <QRCode
                value="https://github.com/LAU29004/TranSactly/releases/download/v1.0.0/CentFluence-v1.0.0.apk"
                size={220}
              />
              Scan QR to Download for Android
              <div className={styles.demoNotice}>
                Due to Google Play Service restrictions, the app demo video is
                only available below.{" "}
                <a
                  href="https://drive.google.com/file/d/1FsbMqtaUgaHRyhQf4GXgGETUT0OEIRNV/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Demo Video
                </a>
              </div>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className={styles.ctaTrust}>
              {[
                "🤖 AI-Powered Insights",
                "📊 Real-Time Analytics",
                "🧠 Smart Categorization",
                "📈 Financial Intelligence",
              ].map((b, i, arr) => (
                <Fragment key={b}>
                  <span>{b}</span>
                  {i < arr.length - 1 && (
                    <div className={styles.ctaTrustRule} />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
