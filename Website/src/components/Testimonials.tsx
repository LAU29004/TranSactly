"use client";
import styles from "./styles/Testimonials.module.css";

const testimonials = [
  {
    quote: "AI Transaction Intelligence",
    body: "Automatically converts bank SMS into structured transactions with merchant detection, category prediction, and intelligent financial analysis.",
    name: "SMS Processing",
    role: "AI Engine",
    initials: "AI",
    color: "#F5A800",
  },
  {
    quote: "Smart Financial Analytics",
    body: "Track spending trends, monitor savings, identify top merchants, and understand where your money goes through real-time analytics.",
    name: "Analytics",
    role: "Financial Insights",
    initials: "AN",
    color: "#FFD166",
  },
  {
    quote: "AI Financial Assistant",
    body: 'Ask questions like "Where am I spending most?" or "How much did I save?" and receive personalized AI-powered financial insights.',
    name: "centfluence AI",
    role: "Financial Copilot",
    initials: "TX",
    color: "#F5A800",
  },
  {
    quote: "Secure by Design",
    body: "Built with AES-256 encryption, secure authentication, privacy-first architecture, and protected financial data handling.",
    name: "Security",
    role: "Enterprise Grade",
    initials: "SEC",
    color: "#FFD166",
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonialsSection} id="testimonials">
      <div className={styles.tDotField} />

      <div className={styles.testimonialsInner}>
        {/* Header */}
        <div className={styles.tHeader}>
          <div className={styles.tBadge}>
            <span className={styles.tBadgePip} />
            AI Capabilities
          </div>

          <h2 className={styles.tHeading}>
            What centfluence{" "}
            <span className={styles.tHeadingAccent}>can do for you</span>
          </h2>

          <div className={styles.tSectionRule} />

          <p className={styles.tSub}>
            Powered by AI transaction intelligence, smart analytics, financial
            insights, and secure money management.
          </p>
        </div>

        {/* Cards */}
        <div className={styles.tGrid}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.tCard}>
              <div
                className={styles.tQuoteMark}
                style={{ color: t.color, opacity: 0.45 }}
              >
                "
              </div>

              <p className={styles.tQuoteTitle}>{t.quote}</p>
              <p className={styles.tBody}>{t.body}</p>

              <div className={styles.tStars}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    className={styles.tStar}
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 1l1.4 2.8L10.5 4.3l-2.2 2.1.5 3-2.8-1.5L3.2 9.4l.5-3L1.5 4.3l3.1-.5z" />
                  </svg>
                ))}
              </div>

              <div className={styles.tAuthor}>
                <div className={styles.tAvatar} style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className={styles.tName}>{t.name}</p>
                  <p className={styles.tRole}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}