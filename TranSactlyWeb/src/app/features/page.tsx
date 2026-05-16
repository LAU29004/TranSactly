'use client'
import { useRef, useEffect, useState } from 'react'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="3" stroke="#1A1033" strokeWidth="1.8"/>
        <path d="M8 21h8M12 17v4" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M6 8h2m0 0v5m0-5h4" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Real-Time Balance Overview',
    desc: 'Get a clean dashboard showing your balance, recent activity, and spending progress at a glance — beautifully visualized.',
    tag: 'Balance',
    value: '$24,891',
    change: '+12.4%',
    positive: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M3 17l4-8 4 5 3-3 4 6" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 21H3" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Smart Statistics & Insights',
    desc: 'Visual charts reveal where your money goes — categories, trends, and monthly comparisons with AI-powered analysis.',
    tag: 'Analytics',
    value: '↑ 34%',
    change: 'savings rate',
    positive: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M7 16.5A9.5 9.5 0 1 1 20.5 9" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 14l2 2 4-4" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8v4l2 2" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Smooth Transfers & Payments',
    desc: 'Send money instantly or scan a QR code to receive payments without hassle. Supports all major payment networks.',
    tag: 'Transfer',
    value: '< 3s',
    change: 'instant',
    positive: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#1A1033" strokeWidth="1.8"/>
        <path d="M2 10h20" stroke="#1A1033" strokeWidth="1.8"/>
        <path d="M6 15h4" stroke="#1A1033" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Secure Wallet for Cards',
    desc: 'Manage multiple cards safely with encrypted storage and real-time sync across all your devices.',
    tag: 'Security',
    value: '256-bit',
    change: 'encrypted',
    positive: true,
  },
]
type Feature = {
  icon: JSX.Element
  title: string
  desc: string
  tag: string
  value: string
  change: string
  positive: boolean
}

function FeatureCard({ f, i }: { f: Feature; i: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`,
      }}
      className="feat-card"
    >
      {/* top row */}
      <div className="feat-top">
        <div className="feat-icon-wrap">
          {f.icon}
        </div>
        <div className="feat-stat">
          <p className="feat-stat-val">{f.value}</p>
          <p className="feat-stat-sub">{f.change}</p>
        </div>
      </div>

      <h3 className="feat-title">{f.title}</h3>
      <p className="feat-desc">{f.desc}</p>

      <div className="feat-tag">{f.tag}</div>

      {/* hover fill layer */}
      <div className="feat-hover-fill" />
    </div>
  )
}

export default function Features() {
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
        #features {
          background: var(--amber);
          padding: 96px 64px;
          position: relative;
          overflow: hidden;
        }

        /* halftone dots matching the illustration */
        #features::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(26,16,51,0.16) 1.2px, transparent 1.2px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 100%);
        }

        .feat-inner { max-width: 1200px; margin: 0 auto; }

        /* ── HEADER ── */
        .feat-header { text-align: center; margin-bottom: 64px; }

        .feat-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy);
          color: var(--amber3);
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 4px;
          margin-bottom: 24px;
        }

        .feat-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1.04;
          color: var(--navy);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .feat-headline-accent {
          color: var(--ink);
          display: inline-block;
          position: relative;
        }
        .feat-headline-accent::after {
          content: '';
          position: absolute; left: 0; bottom: -4px; right: 0;
          height: 4px; background: var(--navy); border-radius: 2px;
        }

        .feat-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 16px; font-weight: 300; line-height: 1.7;
          color: rgba(26,16,51,0.65);
          max-width: 480px; margin: 0 auto;
        }

        /* ── GRID ── */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 720px) { .feat-grid { grid-template-columns: 1fr; } }

        /* ── CARD ── */
        .feat-card {
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.12);
          border-radius: 16px;
          padding: 28px;
          cursor: default;
          position: relative;
          overflow: hidden;
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .feat-card:hover {
          border-color: rgba(245,168,0,0.50);
          transform: translateY(-4px);
          box-shadow: 6px 6px 0 rgba(14,9,32,0.45);
        }

        /* amber corner fill on hover */
        .feat-hover-fill {
          position: absolute; top: 0; right: 0;
          width: 120px; height: 120px;
          background: radial-gradient(circle at top right, rgba(245,168,0,0.10), transparent 70%);
          border-radius: 0 16px 0 100%;
          opacity: 0;
          transition: opacity .35s;
          pointer-events: none;
        }
        .feat-card:hover .feat-hover-fill { opacity: 1; }

        .feat-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 20px;
        }

        .feat-icon-wrap {
          width: 48px; height: 48px; border-radius: 10px;
          background: var(--amber);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          border: 2px solid rgba(245,168,0,0.0);
          transition: transform .2s;
        }
        .feat-card:hover .feat-icon-wrap { transform: rotate(-6deg) scale(1.08); }

        .feat-stat { text-align: right; }
        .feat-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 24px; font-weight: 800;
          color: var(--amber); line-height: 1;
        }
        .feat-stat-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 600;
          color: rgba(245,168,0,0.55);
          margin-top: 3px; letter-spacing: 0.04em;
        }

        .feat-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #fff; margin-bottom: 10px;
          transition: color .2s;
        }
        .feat-card:hover .feat-title { color: var(--amber); }

        .feat-desc {
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 300; line-height: 1.7;
          color: rgba(245,168,0,0.50);
          margin-bottom: 20px;
        }

        .feat-tag {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.10em; text-transform: uppercase;
          color: var(--amber);
          border: 1.5px solid rgba(245,168,0,0.25);
          padding: 4px 12px; border-radius: 4px;
          transition: border-color .2s, background .2s;
        }
        .feat-card:hover .feat-tag {
          border-color: rgba(245,168,0,0.60);
          background: rgba(245,168,0,0.08);
        }

        /* divider between sections */
        .feat-divider {
          width: 48px; height: 4px;
          background: var(--navy);
          border-radius: 2px;
          margin: 0 auto 0;
        }
      `}</style>

      <section id="features">
        <div className="feat-inner">

          {/* HEADER */}
          <div className="feat-header">
            <div className="feat-eyebrow">◆ Features</div>
            <h2 className="feat-headline">
              Take full control of your{' '}
              <span className="feat-headline-accent">financial life</span>
            </h2>
            <p className="feat-sub">
              A powerful money-management experience with real-time data, easy payment tools,
              and visual insights that help you act smarter.
            </p>
          </div>

          {/* GRID */}
          <div className="feat-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} f={f} i={i} />
            ))}
          </div>

        </div>
      </section>
    </>
  )
}