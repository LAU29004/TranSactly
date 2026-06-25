import { Fragment } from "react";
import styles from "../../components/styles/CTA.module.css";

export default function CTA() {
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

            {/* Buttons */}
            <div className={styles.ctaBtns}>
              <a href="#" className={styles.ctaBtnSolid}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.26c1.4-.06 2.37.71 3.17.75.96-.19 1.87-.98 3.3-.83 1.72.22 3 .98 3.79 2.54-3.47 1.88-2.9 6.16.48 7.62-.41 1.19-.89 2.28-1.74 3.94M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" />
                </svg>
                Scan QR to Download for Android
              </a>
            </div>

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
