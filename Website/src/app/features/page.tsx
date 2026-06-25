"use client";
import { useRef, useEffect, useState } from "react";
import styles from './feat.module.css'
const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect
          x="2"
          y="3"
          width="20"
          height="14"
          rx="3"
          stroke="#1A1033"
          strokeWidth="1.8"
        />
        <path
          d="M6 8h12M6 12h8"
          stroke="#1A1033"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path
          d="M3 17l4-8 4 5 3-3 4 6"
          stroke="#1A1033"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 21H3"
          stroke="#1A1033"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path
          d="M7 16.5A9.5 9.5 0 1 1 20.5 9"
          stroke="#1A1033"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16 14l2 2 4-4"
          stroke="#1A1033"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8v4l2 2"
          stroke="#1A1033"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
          stroke="#1A1033"
          strokeWidth="1.8"
        />
        <path d="M2 10h20" stroke="#1A1033" strokeWidth="1.8" />
        <path
          d="M6 15h4"
          stroke="#1A1033"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
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
  icon: JSX.Element;
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
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`,
      }}
      className={styles['feat-card']}
    >
      {/* top row */}
      <div className={styles['feat-top']}>
        <div className={styles['feat-icon-wrap']}>{f.icon}</div>
        <div className={styles['feat-stat']}>
          <p className={styles['feat-stat-val']}>{f.value}</p>
          <p className={styles['feat-stat-sub']}>{f.change}</p>
        </div>
      </div>

      <h3 className={styles['feat-title']}>{f.title}</h3>
      <p className={styles['feat-desc']}>{f.desc}</p>

      <div className={styles['feat-tag']}>{f.tag}</div>

      {/* hover fill layer */}
      <div className={styles['feat-hover-fill']} />
    </div>
  );
}

export default function Features() {
  return (
    <>


      <section id="features">
        <div className={styles['feat-inner']}>
          {/* HEADER */}
          <div className={styles['feat-header']}>
            <div className={styles['feat-eyebrow']}>◆ Features</div>
            <h2 className={styles['feat-headline']}>
              Powered by{" "}
              <span className={styles['feat-headline-accent']}>
                Financial Intelligence
              </span>
            </h2>
            <p className={styles['feat-sub']}>
              AI-powered transaction analysis, intelligent categorization,
              financial insights, and secure money management — all in one
              platform.
            </p>
          </div>

          {/* GRID */}
          <div className={styles['feat-grid']}>
            {features.map((f, i) => (
              <FeatureCard key={i} f={f} i={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
