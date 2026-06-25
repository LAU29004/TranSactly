"use client";
import { useRef, useEffect, useState } from "react";
import styles from "./styles/Features.module.css";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <rect x="2" y="3" width="20" height="14" rx="3" stroke="#1A1033" strokeWidth="1.8" />
        <path d="M6 8h12M6 12h8" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "AI Transaction Intelligence",
    desc: "Automatically converts bank SMS into structured transactions with merchant detection, categorization, and spending insights.",
    tag: "AI Engine",
    value: "95%+",
    change: "accuracy",
    positive: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M3 17l4-8 4 5 3-3 4 6" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21H3" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Smart Financial Analytics",
    desc: "Visualize spending trends, category breakdowns, monthly performance, savings rate, and top merchants in real time.",
    tag: "Analytics",
    value: "24/7",
    change: "monitoring",
    positive: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M7 16.5A9.5 9.5 0 1 1 20.5 9" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 14l2 2 4-4" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v4l2 2" stroke="#1A1033" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    ),
    title: "AI Financial Assistant",
    desc: "Ask questions about your finances and receive personalized insights, spending summaries, and actionable recommendations.",
    tag: "Copilot",
    value: "< 2s",
    change: "response",
    positive: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#1A1033" strokeWidth="1.8" />
        <path d="M2 10h20" stroke="#1A1033" strokeWidth="1.8" />
        <path d="M6 15h4" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Privacy & Security First",
    desc: "Protected with AES-256 encryption, secure authentication, and privacy-focused architecture for sensitive financial data.",
    tag: "Security",
    value: "AES-256",
    change: "encrypted",
    positive: true,
  },
];

type Feature = {
  icon: React.ReactElement;
  title: string;
  desc: string;
  tag: string;
  value: string;
  change: string;
  positive: boolean;
};

function FeatureCard({ f, i }: { f: Feature; i: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={styles.featCard}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`,
      }}
    >
      {/* top row */}
      <div className={styles.featTop}>
        <div className={styles.featIconWrap}>{f.icon}</div>
        <div className={styles.featStat}>
          <p className={styles.featStatVal}>{f.value}</p>
          <p className={styles.featStatSub}>{f.change}</p>
        </div>
      </div>

      <h3 className={styles.featTitle}>{f.title}</h3>
      <p className={styles.featDesc}>{f.desc}</p>

      <div className={styles.featTag}>{f.tag}</div>

      {/* hover fill layer */}
      <div className={styles.featHoverFill} />
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className={styles.featInner}>

        {/* HEADER */}
        <div className={styles.featHeader}>
          <div className={styles.featEyebrow}>◆ Features</div>
          <h2 className={styles.featHeadline}>
            Powered by{" "}
            <span className={styles.featHeadlineAccent}>Financial Intelligence</span>
          </h2>
          <p className={styles.featSub}>
            AI-powered transaction analysis, intelligent categorization,
            financial insights, and secure money management — all in one
            platform.
          </p>
        </div>

        {/* GRID */}
        <div className={styles.featGrid}>
          {features.map((f, i) => (
            <FeatureCard key={i} f={f} i={i} />
          ))}
        </div>

      </div>
    </section>
  );
}