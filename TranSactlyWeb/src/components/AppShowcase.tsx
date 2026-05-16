'use client'
import { useRef, useEffect, useState } from 'react'

/* ─────────────────────────────────────────────
   MOCKUP 1 — Dashboard Overview
───────────────────────────────────────────── */
const DashboardMockup = () => (
  <div className="mockup-shell">
    {/* window chrome */}
    <div className="mockup-bar">
      <span className="dot r" /><span className="dot y" /><span className="dot g" />
      <div className="mockup-url">app.finorio.com · Dashboard</div>
    </div>

    <div className="mockup-body">
      {/* greeting row */}
      <div className="db-greeting">
        <div>
          <p className="db-greeting-sub">Good morning, Alex 👋</p>
          <p className="db-greeting-title">Here's your overview</p>
        </div>
        <div className="db-avatar">💳</div>
      </div>

      {/* balance card */}
      <div className="db-balance-card">
        <p className="db-balance-label">Net Balance</p>
        <p className="db-balance-val">$24,891<span className="db-balance-dec">.50</span></p>
        <div className="db-balance-row">
          <span className="db-meta">Income <strong className="db-pos">$8,240</strong></span>
          <span className="db-meta">Spent <strong className="db-neg">$3,120</strong></span>
          <span className="db-meta db-change">↑ +12.4%</span>
        </div>
      </div>

      {/* transactions */}
      <p className="db-section-title">Recent Transactions</p>
      {[
        { icon: '🛒', name: 'Whole Foods',   date: 'Today',     amt: '-$67.40',  pos: false },
        { icon: '☕', name: 'Blue Bottle',   date: 'Yesterday', amt: '-$5.80',   pos: false },
        { icon: '💼', name: 'Salary',        date: 'Dec 1',     amt: '+$4,200',  pos: true  },
      ].map((t, i) => (
        <div key={i} className="db-tx">
          <div className="db-tx-left">
            <div className="db-tx-icon">{t.icon}</div>
            <div>
              <p className="db-tx-name">{t.name}</p>
              <p className="db-tx-date">{t.date}</p>
            </div>
          </div>
          <span className={t.pos ? 'db-tx-amt pos' : 'db-tx-amt'}>{t.amt}</span>
        </div>
      ))}
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   MOCKUP 2 — Spending Statistics
───────────────────────────────────────────── */
const StatsMockup = () => (
  <div className="mockup-shell">
    <div className="mockup-bar">
      <span className="dot r" /><span className="dot y" /><span className="dot g" />
      <div className="mockup-url">app.finorio.com · Analytics</div>
    </div>

    <div className="mockup-body">
      <div className="st-header">
        <p className="db-greeting-title">Spending Breakdown</p>
        <span className="st-pill">December 2024</span>
      </div>

      {/* donut + legend */}
      <div className="st-chart-row">
        <div className="st-donut-wrap">
          <svg viewBox="0 0 100 100" className="st-donut">
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(26,16,51,0.25)" strokeWidth="13"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F5A800"   strokeWidth="13" strokeDasharray="90 150"  strokeLinecap="round" style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#FFD166"   strokeWidth="13" strokeDasharray="45 195"  strokeDashoffset="-90" strokeLinecap="round" style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(245,168,0,0.35)" strokeWidth="13" strokeDasharray="30 210" strokeDashoffset="-135" strokeLinecap="round" style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}/>
          </svg>
          <div className="st-donut-center">
            <p className="st-donut-val">$3.1K</p>
            <p className="st-donut-sub">Total</p>
          </div>
        </div>

        <div className="st-legend">
          {[
            { color: '#F5A800',           cat: 'Food',      pct: '38%', amt: '$1,178' },
            { color: '#FFD166',           cat: 'Transport', pct: '30%', amt: '$930'   },
            { color: 'rgba(245,168,0,.4)',cat: 'Shopping',  pct: '20%', amt: '$620'   },
            { color: 'rgba(245,168,0,.2)',cat: 'Other',     pct: '12%', amt: '$372'   },
          ].map((c, i) => (
            <div key={i} className="st-legend-row">
              <div className="st-legend-left">
                <span className="st-legend-dot" style={{ background: c.color }} />
                <span className="st-legend-cat">{c.cat}</span>
              </div>
              <div className="st-legend-right">
                <span className="st-legend-pct">{c.pct}</span>
                <span className="st-legend-amt">{c.amt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* trend line */}
      <p className="db-section-title" style={{ marginTop: '14px' }}>Monthly Trend</p>
      <svg viewBox="0 0 280 56" className="st-trend">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A800" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#F5A800" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[14, 28, 42].map(y => (
          <line key={y} x1="0" y1={y} x2="280" y2={y}
            stroke="rgba(26,16,51,0.18)" strokeWidth="0.6" strokeDasharray="4"/>
        ))}
        <path d="M0,45 C30,35 60,50 90,30 C120,10 150,40 180,20 C210,0 240,35 280,15"
          fill="none" stroke="#F5A800" strokeWidth="2" strokeLinecap="round"/>
        <path d="M0,45 C30,35 60,50 90,30 C120,10 150,40 180,20 C210,0 240,35 280,15 L280,56 L0,56 Z"
          fill="url(#tg)"/>
        <circle cx="280" cy="15" r="3.5" fill="#F5A800" stroke="#1A1033" strokeWidth="2"/>
      </svg>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const tabs = [
  {
    id: 'dashboard',
    eyebrow: 'Dashboard',
    title: 'Stay in control with total clarity',
    desc: 'A clean dashboard showing your balance, budgets, upcoming bills, and recent transactions — everything you need at a glance.',
    mockup: <DashboardMockup />,
  },
  {
    id: 'stats',
    eyebrow: 'Analytics',
    title: 'Deep insights, beautifully visualized',
    desc: 'Dive deeper into your finances with detailed category analytics and monthly trend charts that tell your financial story.',
    mockup: <StatsMockup />,
  },
]

/* ─────────────────────────────────────────────
   REVEAL HOOK
───────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
 const ref = useRef<HTMLDivElement | null>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, vis] as const
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AppShowcase() {
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
        #showcase {
          background: var(--amber);
          padding: 96px 64px;
          position: relative; overflow: hidden;
        }
        #showcase::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(26,16,51,0.18) 1.2px, transparent 1.2px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 90% 60% at 50% 100%, black 0%, transparent 100%);
        }
        /* top amber rule */
        #showcase::after {
          content: '';
          position: absolute; top: 0; left: 64px; right: 64px;
          height: 3px; background: var(--navy); border-radius: 0 0 3px 3px;
        }

        .sc-inner { max-width: 1200px; margin: 0 auto; }

        /* ── HEADER ── */
        .sc-header { text-align: center; margin-bottom: 72px; }
        .sc-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy); color: var(--amber3);
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 4px; margin-bottom: 24px;
        }
        .sc-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.04; letter-spacing: -0.03em;
          color: var(--navy); margin-bottom: 14px;
        }
        .sc-headline-accent {
          color: var(--ink); display: inline-block; position: relative;
        }
        .sc-headline-accent::after {
          content: '';
          position: absolute; left: 0; bottom: -4px; right: 0;
          height: 4px; background: var(--navy); border-radius: 2px;
        }
        .sc-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 16px; font-weight: 300; line-height: 1.7;
          color: rgba(26,16,51,0.65);
          max-width: 500px; margin: 0 auto;
        }

        /* ── GRID ── */
        .sc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 860px) {
          .sc-grid { grid-template-columns: 1fr; gap: 48px; }
          #showcase { padding: 80px 28px; }
          #showcase::after { left: 28px; right: 28px; }
        }

        /* odd row: text left, mockup right */
        /* even row: mockup left, text right — handled via order */
        .sc-row-even .sc-text  { order: 2; text-align: right; }
        .sc-row-even .sc-frame { order: 1; }

        /* ── TEXT BLOCK ── */
        .sc-text { display: flex; flex-direction: column; }
        .sc-tab-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--navy); color: var(--amber);
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 4px;
          margin-bottom: 18px; width: fit-content;
        }
        .sc-row-even .sc-tab-badge { align-self: flex-end; }

        .sc-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 2.8vw, 34px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.025em;
          color: var(--navy); margin-bottom: 14px;
        }
        .sc-desc {
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 300; line-height: 1.72;
          color: rgba(26,16,51,0.65);
          margin-bottom: 24px;
        }
        .sc-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          color: var(--navy);
          text-decoration: none;
          border-bottom: 2px solid var(--navy);
          padding-bottom: 2px;
          width: fit-content;
          transition: gap .2s, opacity .2s;
        }
        .sc-link:hover { gap: 12px; opacity: 0.7; }
        .sc-row-even .sc-link { align-self: flex-end; }

        /* ── MOCKUP FRAME ── */
        .sc-frame {
          position: relative;
        }
        /* hard navy offset shadow — matches illustration style */
        .sc-frame::before {
          content: '';
          position: absolute;
          top: 10px; right: -10px; bottom: -10px; left: 10px;
          background: var(--navy);
          border-radius: 16px; z-index: 0;
        }
        .sc-row-even .sc-frame::before {
          right: 10px; left: -10px;
        }

        /* ── MOCKUP SHELL ── */
        .mockup-shell {
          position: relative; z-index: 1;
          background: var(--navy);
          border: 2.5px solid var(--navy);
          border-radius: 14px;
          overflow: hidden;
        }

        .mockup-bar {
          background: var(--ink);
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          border-bottom: 1.5px solid rgba(245,168,0,0.12);
        }
        .dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
        }
        .dot.r { background: #FF5F57; }
        .dot.y { background: #FEBC2E; }
        .dot.g { background: #28C840; }
        .mockup-url {
          flex: 1; text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 10px; font-weight: 500;
          color: rgba(245,168,0,0.35);
          letter-spacing: 0.04em;
        }

        .mockup-body { padding: 18px; }

        /* ── DASHBOARD MOCKUP ── */
        .db-greeting {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 16px;
        }
        .db-greeting-sub  { font-family: 'Outfit', sans-serif; font-size: 10px; color: rgba(245,168,0,0.40); margin-bottom: 2px; }
        .db-greeting-title{ font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; color: #fff; }
        .db-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(245,168,0,0.15);
          border: 1.5px solid rgba(245,168,0,0.25);
          display: flex; align-items: center; justify-content: center; font-size: 14px;
        }

        .db-balance-card {
          background: rgba(245,168,0,0.10);
          border: 1.5px solid rgba(245,168,0,0.22);
          border-radius: 10px; padding: 14px; margin-bottom: 16px;
        }
        .db-balance-label {
          font-family: 'Outfit', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--amber); margin-bottom: 4px;
        }
        .db-balance-val {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; color: #fff; line-height: 1;
        }
        .db-balance-dec { font-size: 14px; color: rgba(245,168,0,0.55); }
        .db-balance-row {
          display: flex; align-items: center; gap: 16px; margin-top: 8px;
        }
        .db-meta { font-family: 'Outfit', sans-serif; font-size: 9px; color: rgba(245,168,0,0.40); }
        .db-pos   { color: var(--amber3); font-weight: 700; }
        .db-neg   { color: #ff6b6b; font-weight: 700; }
        .db-change{ margin-left: auto; color: var(--amber) !important; font-weight: 700 !important; font-size: 10px !important; }

        .db-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.10em;
          color: rgba(245,168,0,0.50); margin-bottom: 8px;
        }

        .db-tx {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid rgba(245,168,0,0.08);
        }
        .db-tx:last-child { border-bottom: none; }
        .db-tx-left { display: flex; align-items: center; gap: 9px; }
        .db-tx-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(245,168,0,0.12);
          border: 1px solid rgba(245,168,0,0.18);
          display: flex; align-items: center; justify-content: center; font-size: 11px;
        }
        .db-tx-name { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 500; color: #fff; }
        .db-tx-date { font-family: 'Outfit', sans-serif; font-size: 9px; color: rgba(245,168,0,0.35); }
        .db-tx-amt  { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; color: rgba(245,168,0,0.60); }
        .db-tx-amt.pos { color: var(--amber3); }

        /* ── STATS MOCKUP ── */
        .st-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .st-pill {
          font-family: 'Outfit', sans-serif;
          font-size: 9px; font-weight: 600; letter-spacing: 0.06em;
          color: rgba(245,168,0,0.50);
          background: rgba(245,168,0,0.08);
          border: 1px solid rgba(245,168,0,0.18);
          padding: 3px 9px; border-radius: 4px;
        }

        .st-chart-row { display: flex; align-items: center; gap: 18px; }
        .st-donut-wrap { position: relative; width: 88px; height: 88px; flex-shrink: 0; }
        .st-donut { width: 100%; height: 100%; }
        .st-donut-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .st-donut-val  { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: var(--amber); line-height:1; }
        .st-donut-sub  { font-family: 'Outfit', sans-serif; font-size: 8px; color: rgba(245,168,0,0.40); margin-top: 2px; }

        .st-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .st-legend-row { display: flex; align-items: center; justify-content: space-between; }
        .st-legend-left  { display: flex; align-items: center; gap: 6px; }
        .st-legend-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink:0; }
        .st-legend-cat   { font-family: 'Outfit', sans-serif; font-size: 10px; color: rgba(245,168,0,0.65); }
        .st-legend-right { display: flex; align-items: center; gap: 10px; }
        .st-legend-pct   { font-family: 'Outfit', sans-serif; font-size: 9px; color: rgba(245,168,0,0.35); }
        .st-legend-amt   { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; color: #fff; }

        .st-trend { width: 100%; margin-top: 4px; }
      `}</style>

      <section id="showcase">
        <div className="sc-inner">

          {/* HEADER */}
          <div
            className="sc-header"
            ref={headerRef}
            style={{
              opacity: headerVis ? 1 : 0,
              transform: headerVis ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.65s ease, transform 0.65s ease',
            }}
          >
            <div className="sc-eyebrow">◆ App Experience</div>
            <h2 className="sc-headline">
              A beautifully crafted{' '}
              <span className="sc-headline-accent">finance experience</span>
            </h2>
            <p className="sc-sub">
              Everything you need — simplified into a clean and seamless interface with high
              security. Your financial information stays private.
            </p>
          </div>

          {/* ROWS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
            {tabs.map((tab, i) => {
              const [rowRef, rowVis] = useReveal(0.1)
              const isEven = i % 2 === 1

              return (
                <div
                  key={tab.id}
                  ref={rowRef}
                  className={`sc-grid ${isEven ? 'sc-row-even' : ''}`}
                  style={{
                    opacity: rowVis ? 1 : 0,
                    transform: rowVis ? 'translateY(0)' : 'translateY(32px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                  }}
                >
                  {/* TEXT */}
                  <div className="sc-text">
                    <div className="sc-tab-badge">◆ {tab.eyebrow}</div>
                    <h3 className="sc-title">{tab.title}</h3>
                    <p className="sc-desc">{tab.desc}</p>
                    <a href="/features" className="sc-link">
                      Explore More Features
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>

                  {/* MOCKUP */}
                  <div className="sc-frame">
                    {tab.mockup}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>
    </>
  )
}