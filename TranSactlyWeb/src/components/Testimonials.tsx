'use client'

const testimonials = [
  {
    quote: 'Saved more than $150 in a month.',
    body: 'Managing my income from multiple clients used to be chaotic. This app gives me a clean dashboard where I can see everything in one place — a total game changer.',
    name: 'Alex Morgan',
    role: 'Freelance Designer',
    initials: 'AM',
    color: '#F5A800',
  },
  {
    quote: 'Faster payments with QR.',
    body: 'The QR payment feature is a lifesaver. Instead of sending bank details every time, customers just scan and pay instantly. It reduced my payment delays by 80%.',
    name: 'Sofia Ramirez',
    role: 'Small Business Owner',
    initials: 'SR',
    color: '#FFD166',
  },
  {
    quote: 'Smooth card management.',
    body: "I've tried many budgeting apps, but most were either too complicated or ugly. This one is different. The card management system is super clean and intuitive.",
    name: 'Daniel Kim',
    role: 'Product Manager',
    initials: 'DK',
    color: '#F5A800',
  },
  {
    quote: 'Best finance app, period.',
    body: 'The spending insights changed how I think about money. I finally understand my habits and have started saving consistently for the first time in years.',
    name: 'Emma Wilson',
    role: 'Startup Founder',
    initials: 'EW',
    color: '#FFD166',
  },
]

export default function Testimonials() {
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

        .testimonials-section {
          background: var(--amber);
          position: relative;
          overflow: hidden;
          padding: 96px 24px 120px;
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Halftone dot field — matches Hero */
        .t-dot-field {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(26,16,51,0.22) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        .testimonials-inner {
          position: relative; z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ─── HEADER ─── */
        .t-header {
          text-align: center;
          margin-bottom: 56px;
        }

        .t-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy);
          color: var(--amber3);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 7px 14px 7px 10px;
          border-radius: 4px;
          margin-bottom: 28px;
        }
        .t-badge-pip {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--amber3);
          animation: tblink 2s ease-in-out infinite;
        }
        @keyframes tblink {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }

        .t-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(32px, 4vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: rgba(255,255,255,0.68);
          margin-bottom: 16px;
        }
        .t-heading-accent {
          position: relative;
          display: inline-block;
          padding-bottom: 8px;
        }
        .t-heading-accent::after {
          content: '';
          position: absolute; left: 0; bottom: 0;
          width: 70%; height: 4px;
          background: var(--ink);
          border-radius: 3px;
        }

        .t-sub {
          font-size: 15px; font-weight: 300; line-height: 1.7;
          color: rgba(255,255,255,0.62);
          max-width: 420px;
          margin: 0 auto;
        }

        /* ─── GRID ─── */
        .t-grid {
          columns: 1;
          gap: 20px;
        }
        @media (min-width: 640px)  { .t-grid { columns: 2; } }
        @media (min-width: 1024px) { .t-grid { columns: 4; } }

        /* ─── CARD ─── */
        .t-card {
          break-inside: avoid;
          margin-bottom: 20px;
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.18);
          border-radius: 16px;
          padding: 22px;
          /* hard offset shadow — matches Hero image shadow style */
          box-shadow: 5px 5px 0 var(--ink);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .t-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: 8px 8px 0 var(--ink);
        }

        /* Opening quote mark */
        .t-quote-mark {
          font-family: 'Syne', sans-serif;
          font-size: 48px;
          line-height: 1;
          margin-bottom: 10px;
        }

        .t-quote-title {
          color: var(--amber);
          font-size: 13px; font-weight: 700;
          margin-bottom: 8px;
        }

        .t-body {
          color: rgba(255,252,240,0.62);
          font-size: 12px; line-height: 1.75;
          font-weight: 300;
          margin-bottom: 18px;
        }

        /* Stars */
        .t-stars {
          display: flex; gap: 3px;
          margin-bottom: 16px;
        }
        .t-star {
          width: 12px; height: 12px;
          fill: var(--amber3);
        }

        /* Author row */
        .t-author {
          display: flex; align-items: center; gap: 10px;
          padding-top: 14px;
          border-top: 1.5px solid rgba(245,168,0,0.14);
        }
        .t-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800;
          color: var(--navy);
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.12);
        }
        .t-name {
          font-size: 12px; font-weight: 700;
          color: var(--white);
          letter-spacing: 0.01em;
        }
        .t-role {
          font-size: 10px; font-weight: 400;
          color: rgba(245,168,0,0.55);
          margin-top: 2px;
          letter-spacing: 0.03em;
        }

        /* ─── DIVIDER rule like Hero's headline underbar ─── */
        .t-section-rule {
          width: 72px; height: 5px;
          background: var(--ink);
          border-radius: 3px;
          margin: 0 auto 56px;
        }
      `}</style>

      <section className="testimonials-section" id="testimonials">
        <div className="t-dot-field" />

        <div className="testimonials-inner">

          {/* Header */}
          <div className="t-header">
            <div className="t-badge">
              <span className="t-badge-pip" />
              What Users Say
            </div>

            <h2 className="t-heading">
              User reviews &{' '}
              <span className="t-heading-accent">feedback</span>
            </h2>

            <div className="t-section-rule" />

            <p className="t-sub">
              See how the app helps people track spending, stay organized, and make
              smarter financial decisions every day.
            </p>
          </div>

          {/* Cards */}
          <div className="t-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="t-card">

                {/* Quote mark */}
                <div className="t-quote-mark" style={{ color: t.color, opacity: 0.45 }}>"</div>

                <p className="t-quote-title">{t.quote}</p>
                <p className="t-body">{t.body}</p>

                {/* Stars */}
                <div className="t-stars">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <svg key={si} className="t-star" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 1l1.4 2.8L10.5 4.3l-2.2 2.1.5 3-2.8-1.5L3.2 9.4l.5-3L1.5 4.3l3.1-.5z" />
                    </svg>
                  ))}
                </div>

                {/* Author */}
                <div className="t-author">
                  <div className="t-avatar" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="t-name">{t.name}</p>
                    <p className="t-role">{t.role}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}