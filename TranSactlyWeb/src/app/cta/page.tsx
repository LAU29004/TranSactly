import { Fragment } from 'react'

export default function CTA() {
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

        .cta-section {
          background: var(--amber);
          padding: 72px 24px 96px;
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
          position: relative;
        }

        /* Halftone dot field — matches Hero */
        .cta-dot-field {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(26,16,51,0.22) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        .cta-wrap {
          position: relative; z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ─── CARD ─── */
        .cta-card {
          position: relative;
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.25);
          border-radius: 24px;
          overflow: hidden;
          padding: 64px 40px;
          text-align: center;
          /* hard offset shadow — matches Hero/Testimonials card style */
          box-shadow: 8px 8px 0 var(--ink);
        }

        /* Amber glow blob */
        .cta-glow {
          position: absolute;
          top: -60px; left: 50%; transform: translateX(-50%);
          width: 520px; height: 320px;
          background: rgba(245,168,0,0.12);
          filter: blur(90px);
          border-radius: 50%;
          pointer-events: none;
        }

        /* Grid overlay */
        .cta-grid {
          position: absolute; inset: 0; pointer-events: none;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(245,168,0,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,168,0,1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Decorative circles */
        .cta-deco-a {
          position: absolute; left: 32px; top: 32px;
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 2px solid rgba(245,168,0,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .cta-deco-a-inner {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(245,168,0,0.3);
        }
        .cta-deco-b {
          position: absolute; right: 48px; bottom: 48px;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(245,168,0,0.1);
          border: 2px solid rgba(245,168,0,0.2);
        }
        .cta-deco-c {
          position: absolute; right: 96px; top: 40px;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: rgba(245,168,0,0.2);
        }
        @media (max-width: 768px) {
          .cta-deco-a, .cta-deco-b, .cta-deco-c { display: none; }
        }

        /* ─── CONTENT ─── */
        .cta-content { position: relative; z-index: 1; }

        .cta-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,168,0,0.12);
          border: 1.5px solid rgba(245,168,0,0.3);
          color: var(--amber3);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 7px 14px 7px 10px;
          border-radius: 4px;
          margin-bottom: 28px;
        }
        .cta-badge-pip {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--amber3);
          animation: ctablink 2s ease-in-out infinite;
        }
        @keyframes ctablink {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }

        .cta-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 3.6vw, 52px);
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: rgba(255,252,240,0.72);
          max-width: 640px;
          margin: 0 auto 16px;
        }
        .cta-heading-accent {
          position: relative;
          display: inline-block;
          padding-bottom: 8px;
        }
        .cta-heading-accent::after {
          content: '';
          position: absolute; left: 0; bottom: 0;
          width: 70%; height: 4px;
          background: var(--amber);
          border-radius: 3px;
        }

        .cta-sub {
          font-size: 15px; font-weight: 300; line-height: 1.75;
          color: rgba(255,252,240,0.5);
          max-width: 480px;
          margin: 0 auto 40px;
        }

        /* ─── BUTTONS ─── */
        .cta-btns {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .cta-btn-solid {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--amber);
          color: var(--navy);
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          border: 2px solid var(--amber);
          box-shadow: 4px 4px 0 var(--ink);
          transition: background 0.2s, transform 0.18s, box-shadow 0.18s;
        }
        .cta-btn-solid:hover {
          background: var(--amber3);
          border-color: var(--amber3);
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 var(--ink);
        }

        .cta-btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent;
          color: rgba(255,252,240,0.8);
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          border: 2px solid rgba(245,168,0,0.28);
          box-shadow: 4px 4px 0 var(--ink);
          transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.18s;
        }
        .cta-btn-outline:hover {
          border-color: rgba(245,168,0,0.6);
          background: rgba(245,168,0,0.07);
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 var(--ink);
        }

        /* ─── TRUST BADGES ─── */
        .cta-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .cta-trust span {
          font-size: 12px; font-weight: 500;
          color: rgba(245,168,0,0.5);
          letter-spacing: 0.03em;
        }
        .cta-trust-rule {
          width: 1px; height: 16px;
          background: rgba(245,168,0,0.18);
        }
      `}</style>

      <section className="cta-section" id="cta">
        <div className="cta-dot-field" />

        <div className="cta-wrap">
          <div className="cta-card">

            {/* Decorative elements */}
            <div className="cta-glow" />
            <div className="cta-grid" />
            <div className="cta-deco-a"><div className="cta-deco-a-inner" /></div>
            <div className="cta-deco-b" />
            <div className="cta-deco-c" />

            <div className="cta-content">

              {/* Badge */}
              <div className="cta-badge">
                <span className="cta-badge-pip" />
                Get Started Today
              </div>

              {/* Heading */}
              <h2 className="cta-heading">
                Start managing your money{' '}
                <span className="cta-heading-accent">the smart way</span>
              </h2>

              {/* Sub */}
              <p className="cta-sub">
                From tracking expenses to sending payments, everything is designed
                to be simple, fast, and secure.
              </p>

              {/* Buttons */}
              <div className="cta-btns">
                <a href="#" className="cta-btn-solid">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.26c1.4-.06 2.37.71 3.17.75.96-.19 1.87-.98 3.3-.83 1.72.22 3 .98 3.79 2.54-3.47 1.88-2.9 6.16.48 7.62-.41 1.19-.89 2.28-1.74 3.94M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
                  </svg>
                  Download on App Store
                </a>
                <a href="#" className="cta-btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.34.19.74.2 1.1.04l13.2-7.62-2.72-2.72-11.58 10.3zM.38 1.14C.14 1.5 0 1.96 0 2.53v18.94c0 .57.14 1.04.38 1.4l.07.07 10.6-10.6v-.25L.45 1.07l-.07.07zM21.12 9.76l-2.78-1.6-3.04 3.04 3.04 3.04 2.8-1.62c.8-.46.8-1.4 0-1.86zM4.28.18L17.5 7.8l-2.72 2.72L3.18.2 4.28.18z"/>
                  </svg>
                  Get on Google Play
                </a>
              </div>

              {/* Trust badges */}
              <div className="cta-trust">
                {['🔒 Bank-grade Security', '⚡ Instant Sync', '🌍 150+ Countries', '💬 24/7 Support'].map((b, i, arr) => (
                  <Fragment key={b}>
                    <span>{b}</span>
                    {i < arr.length - 1 && <div className="cta-trust-rule" />}
                  </Fragment>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}