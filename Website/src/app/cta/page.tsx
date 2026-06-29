import { Fragment } from "react";
import styles from "../../components/styles/CTA.module.css";
import QRCode from "react-qr-code";
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
