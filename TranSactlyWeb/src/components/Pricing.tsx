'use client'
import { useState, useRef, useEffect } from 'react'

const plans = [
  {
    name: 'Free',
    monthly: 0,
    annually: 0,
    desc: 'Simple features to begin.',
    features: ['Dashboard', 'Basic statistics', 'QR payments', 'Standard security', '1 card storage'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Professional',
    monthly: 5.59,
    annually: 4.49,
    desc: 'Smart tools, unlimited access.',
    features: ['Everything in Free', 'Unlimited cards', 'Advanced insights', 'Priority syncing', 'Scheduled transfers'],
    cta: 'Get Started',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    monthly: 9.59,
    annually: 7.69,
    desc: 'Maximum features, zero limits.',
    features: ['Everything in Pro', 'Family mode', 'Custom categories', 'Export reports', 'Smart budgeting'],
    cta: 'Get Started',
    highlight: false,
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return [ref, vis] as const
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [headerRef, headerVis] = useReveal()
  return (
    <>
      <style>{`
        :root {
          --amber : #F5A800;
          --amber2: #E09700;
          --amber3: #FFD166;
          --navy  : #1A1033;
          --navy2 : #2C1D55;
          --ink   : #0E0920;
        }

        /* ── SECTION ── */
        #pricing {
          background: var(--navy);
          padding: 96px 64px;
          position: relative;
          overflow: hidden;
        }

        /* subtle amber dot grid */
        #pricing::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(245,168,0,0.10) 1.2px, transparent 1.2px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        /* top border rule — amber line */
        #pricing::after {
          content: '';
          position: absolute; top: 0; left: 64px; right: 64px;
          height: 3px; background: var(--amber); border-radius: 0 0 3px 3px;
        }

        .price-inner { max-width: 1100px; margin: 0 auto; }

        /* ── HEADER ── */
        .price-header { text-align: center; margin-bottom: 52px; }

        .price-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--amber);
          color: var(--navy);
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 4px;
          margin-bottom: 24px;
        }

        .price-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 3.8vw, 50px);
          line-height: 1.04; letter-spacing: -0.03em;
          color: #fff; margin-bottom: 14px;
        }
        .price-headline-accent {
          color: var(--amber);
          display: inline-block; position: relative;
        }
        .price-headline-accent::after {
          content: '';
          position: absolute; left: 0; bottom: -4px; right: 0;
          height: 4px; background: var(--amber); border-radius: 2px;
        }

        .price-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 300; line-height: 1.7;
          color: rgba(245,168,0,0.50);
          max-width: 420px; margin: 0 auto 32px;
        }

        /* ── TOGGLE ── */
        .price-toggle {
          display: inline-flex; align-items: center;
          background: rgba(245,168,0,0.08);
          border: 2px solid rgba(245,168,0,0.20);
          border-radius: 8px; padding: 4px;
          gap: 4px;
        }
        .price-toggle-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 9px 20px; border-radius: 5px;
          border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: background .2s, color .2s;
        }
        .price-toggle-btn.active {
          background: var(--amber); color: var(--navy);
        }
        .price-toggle-btn.inactive {
          background: transparent; color: rgba(245,168,0,0.55);
        }
        .price-toggle-btn.inactive:hover { color: var(--amber); }
        .price-save-pill {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          padding: 2px 7px; border-radius: 3px;
        }
        .price-save-pill.active   { background: var(--navy);  color: var(--amber); }
        .price-save-pill.inactive { background: rgba(245,168,0,0.15); color: var(--amber3); }

        /* ── CARD GRID ── */
        .price-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 800px) {
          .price-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
          #pricing { padding: 80px 28px; }
          #pricing::after { left: 28px; right: 28px; }
        }

        /* ── PLAN CARD ── */
        .price-card {
          border-radius: 14px;
          padding: 28px;
          position: relative;
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .price-card.standard {
          background: rgba(245,168,0,0.05);
          border: 2px solid rgba(245,168,0,0.14);
        }
        .price-card.standard:hover {
          border-color: rgba(245,168,0,0.40);
          transform: translateY(-4px);
          box-shadow: 4px 4px 0 rgba(14,9,32,0.55);
        }
        .price-card.featured {
          background: var(--amber);
          border: 2px solid var(--amber);
          transform: translateY(-8px);
          box-shadow: 6px 6px 0 rgba(14,9,32,0.55);
        }
        .price-card.featured:hover {
          transform: translateY(-12px);
          box-shadow: 8px 8px 0 rgba(14,9,32,0.65);
        }

        /* popular badge */
        .price-badge {
          position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
          background: var(--navy); color: var(--amber);
          font-family: 'Outfit', sans-serif;
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 4px;
          white-space: nowrap;
          border: 2px solid rgba(245,168,0,0.30);
        }

        /* plan name */
        .price-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800; letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .price-card.standard  .price-name { color: #fff; }
        .price-card.featured  .price-name { color: var(--navy); }

        .price-desc {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 300;
          margin-bottom: 24px;
        }
        .price-card.standard .price-desc { color: rgba(245,168,0,0.45); }
        .price-card.featured .price-desc { color: rgba(26,16,51,0.60); }

        /* amount */
        .price-amount-row { display: flex; align-items: flex-end; gap: 4px; margin-bottom: 4px; }
        .price-amount {
          font-family: 'Syne', sans-serif;
          font-size: 42px; font-weight: 800; line-height: 1;
          letter-spacing: -0.03em;
        }
        .price-card.standard .price-amount { color: var(--amber); }
        .price-card.featured .price-amount { color: var(--navy); }

        .price-per {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 400;
          padding-bottom: 6px;
        }
        .price-card.standard .price-per { color: rgba(245,168,0,0.40); }
        .price-card.featured .price-per { color: rgba(26,16,51,0.50); }

        .price-annual-note {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 600;
          margin-bottom: 24px;
          height: 16px;
        }
        .price-card.standard .price-annual-note { color: var(--amber3); }
        .price-card.featured .price-annual-note { color: rgba(26,16,51,0.65); }

        /* rule line */
        .price-rule {
          height: 1.5px; margin-bottom: 20px;
        }
        .price-card.standard .price-rule { background: rgba(245,168,0,0.12); }
        .price-card.featured .price-rule { background: rgba(26,16,51,0.15); }

        /* features list */
        .price-features {
          list-style: none; padding: 0; margin: 0 0 28px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .price-feat-item {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 400;
        }
        .price-card.standard .price-feat-item { color: rgba(245,168,0,0.70); }
        .price-card.featured .price-feat-item { color: var(--navy); }

        .price-check {
          width: 18px; height: 18px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .price-card.standard .price-check {
          background: rgba(245,168,0,0.12);
          border: 1.5px solid rgba(245,168,0,0.30);
        }
        .price-card.featured .price-check {
          background: rgba(26,16,51,0.12);
          border: 1.5px solid rgba(26,16,51,0.25);
        }

        /* CTA button */
        .price-cta {
          width: 100%; padding: 13px;
          border-radius: 7px; border: 2px solid transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.01em;
          cursor: pointer;
          transition: background .2s, color .2s, transform .15s, border-color .2s;
        }
        .price-card.standard .price-cta {
          background: transparent;
          color: var(--amber);
          border-color: rgba(245,168,0,0.35);
        }
        .price-card.standard .price-cta:hover {
          background: var(--amber); color: var(--navy);
          border-color: var(--amber);
          transform: translateY(-1px);
        }
        .price-card.featured .price-cta {
          background: var(--navy); color: var(--amber);
          border-color: var(--navy);
        }
        .price-card.featured .price-cta:hover {
          background: var(--ink); border-color: var(--ink);
          transform: translateY(-1px);
        }
      `}</style>

      <section id="pricing">
        <div className="price-inner">

          {/* HEADER */}
          <div
            className="price-header"
            ref={headerRef}
            style={{
              opacity: headerVis ? 1 : 0,
              transform: headerVis ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.65s ease, transform 0.65s ease',
            }}
          >
            <div className="price-eyebrow">◆ Pricing</div>
            <h2 className="price-headline">
              Flexible{' '}
              <span className="price-headline-accent">pricing plan</span>
            </h2>
            <p className="price-sub">
              Choose a plan that fits your needs, with flexible options and transparent pricing.
            </p>

            {/* TOGGLE */}
            <div className="price-toggle">
              <button
                className={`price-toggle-btn ${!annual ? 'active' : 'inactive'}`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`price-toggle-btn ${annual ? 'active' : 'inactive'}`}
                onClick={() => setAnnual(true)}
              >
                Annually
                <span className={`price-save-pill ${annual ? 'active' : 'inactive'}`}>-20%</span>
              </button>
            </div>
          </div>

          {/* CARDS */}
          <div className="price-grid">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`price-card ${plan.highlight ? 'featured' : 'standard'}`}
                style={{
                  opacity: headerVis ? 1 : 0,
                  transform: headerVis
                    ? `translateY(${plan.highlight ? '-8px' : '0'})`
                    : 'translateY(32px)',
                  transition: `opacity 0.65s ease ${150 + i * 100}ms, transform 0.65s ease ${150 + i * 100}ms, box-shadow 0.25s, border-color 0.25s`,
                }}
              >
                {plan.badge && <div className="price-badge">★ {plan.badge}</div>}

                <p className="price-name">{plan.name}</p>
                <p className="price-desc">{plan.desc}</p>

                <div className="price-amount-row">
                  <span className="price-amount">
                    ${annual ? plan.annually.toFixed(2) : plan.monthly.toFixed(2)}
                  </span>
                  <span className="price-per">/mo</span>
                </div>

                <p className="price-annual-note">
                  {annual && plan.annually > 0 ? 'Billed annually — save 20%' : '\u00A0'}
                </p>

                <div className="price-rule" />

                <ul className="price-features">
                  {plan.features.map(f => (
                    <li key={f} className="price-feat-item">
                      <span className="price-check">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4l2.5 2.5L9 1"
                            stroke={plan.highlight ? '#1A1033' : '#F5A800'}
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button className="price-cta">{plan.cta} →</button>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}