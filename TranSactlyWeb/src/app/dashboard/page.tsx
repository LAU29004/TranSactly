'use client'
import { useState } from 'react'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { id: 1, icon: '🛒', name: 'Whole Foods Market',  category: 'Groceries',     date: 'Today, 2:14 PM',  amount: -67.40,  status: 'completed' },
  { id: 2, icon: '☕', name: 'Blue Bottle Coffee',  category: 'Food & Drink',  date: 'Today, 9:01 AM',  amount: -5.80,   status: 'completed' },
  { id: 3, icon: '💼', name: 'Acme Corp — Salary',  category: 'Income',        date: 'Yesterday',       amount: 4200.00, status: 'completed' },
  { id: 4, icon: '🏠', name: 'Rent — Apt 4B',       category: 'Housing',       date: 'Dec 1',           amount: -1800.00,status: 'completed' },
  { id: 5, icon: '📱', name: 'Netflix Premium',      category: 'Subscriptions', date: 'Nov 30',          amount: -22.99,  status: 'completed' },
  { id: 6, icon: '✈️', name: 'United Airlines',     category: 'Travel',        date: 'Nov 28',          amount: -340.00, status: 'pending'   },
  { id: 7, icon: '💊', name: 'CVS Pharmacy',         category: 'Health',        date: 'Nov 27',          amount: -18.50,  status: 'completed' },
  { id: 8, icon: '📚', name: 'Kindle Unlimited',    category: 'Subscriptions', date: 'Nov 26',          amount: -11.99,  status: 'completed' },
]

const CARDS = [
  { name: 'Finorio Platinum', last4: '4291', balance: 12450.00, limit: 20000, type: 'Visa' },
  { name: 'Business Card',    last4: '8834', balance: 4890.50,  limit: 10000, type: 'Mastercard' },
]

const BUDGETS = [
  { category: 'Food & Groceries', spent: 420, limit: 600,  icon: '🛒' },
  { category: 'Transport',        spent: 180, limit: 250,  icon: '🚗' },
  { category: 'Entertainment',    spent: 95,  limit: 100,  icon: '🎬' },
  { category: 'Subscriptions',    spent: 68,  limit: 80,   icon: '📱' },
]

const SUMMARY_CARDS = [
  { label: 'Total Balance',  value: '$24,891', sub: '↑ 12.4% vs last month', subType: 'up',   icon: '◈' },
  { label: 'Monthly Income', value: '$8,240',  sub: '↑ 8.2% this period',    subType: 'up',   icon: '↑' },
  { label: 'Monthly Spent',  value: '$3,120',  sub: '↑ 3.1% vs last month',  subType: 'down', icon: '↓' },
  { label: 'Net Savings',    value: '$5,120',  sub: 'On track · Dec goal',   subType: 'gold', icon: '◉' },
]

const DONUT_SEGMENTS = [
  { pct: 38, label: 'Food',      amount: '$1,178' },
  { pct: 30, label: 'Transport', amount: '$930'   },
  { pct: 20, label: 'Shopping',  amount: '$620'   },
  { pct: 12, label: 'Other',     amount: '$372'   },
]
// Amber palette for donut — no external colors
const DONUT_COLORS = ['#F5A800', '#FFD166', '#E09700', '#2C1D55']

const MONTHS = [
  { label: 'Jul', income: 72, spend: 28 },
  { label: 'Aug', income: 75, spend: 33 },
  { label: 'Sep', income: 75, spend: 30 },
  { label: 'Oct', income: 80, spend: 26 },
  { label: 'Nov', income: 78, spend: 29 },
  { label: 'Dec', income: 92, spend: 22 },
]

const INSIGHTS = [
  { text: 'Income rose <strong>12.4%</strong> this month — your best performance in 6 months.' },
  { text: 'Transport at <strong>$930</strong> is 30% of spending. Consider a monthly cap.' },
  { text: 'Entertainment budget is at <strong>95%</strong> with 18 days left — watch out.' },
  { text: 'Your <strong>net savings of $5,120</strong> is up 21% vs November. Keep it up.' },
  { text: 'Netflix + Kindle together are <strong>$34.98/mo</strong>. Review subscriptions quarterly.' },
]

type Tab = 'overview' | 'transactions' | 'cards' | 'budget'

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (t: Tab) => void }) {
  const groups = [
    {
      label: 'Overview',
      items: [
        { id: 'overview' as Tab,      label: 'Dashboard',     icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> },
        { id: 'transactions' as Tab,  label: 'Transactions',  icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h12M2 8h8M2 11h5"/></svg> },
      ],
    },
    {
      label: 'Finance',
      items: [
        { id: 'cards' as Tab,   label: 'Cards',  icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M2 8h12"/></svg> },
        { id: 'budget' as Tab,  label: 'Budget', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg> },
      ],
    },
  ]

  return (
    <aside style={{
      width: 224, minWidth: 224,
      background: 'var(--navy)',
      borderRight: '3px solid var(--ink)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
    }}>
      {/* Brand */}
      <div style={{ padding: '0 18px 20px', borderBottom: '2px solid rgba(245,168,0,0.12)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0 var(--ink)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="var(--navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--white)', letterSpacing: '-0.03em' }}>
              fin<span style={{ color: 'var(--amber)' }}>orio</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(245,168,0,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>
              Wealth Dashboard
            </div>
          </div>
        </div>
      </div>

      {groups.map((g, gi) => (
        <div key={gi}>
          {gi > 0 && <div style={{ height: 1, background: 'rgba(245,168,0,0.08)', margin: '6px 16px' }} />}
          <div style={{ padding: '0 8px', marginBottom: 4 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,168,0,0.35)', padding: '0 10px 6px', fontWeight: 700 }}>
              {g.label}
            </div>
            {g.items.map(item => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: active ? 700 : 400, marginBottom: 2,
                    color: active ? 'var(--amber)' : 'rgba(255,252,240,0.35)',
                    background: active ? 'rgba(245,168,0,0.12)' : 'transparent',
                    border: active ? '1.5px solid rgba(245,168,0,0.28)' : '1.5px solid transparent',
                    boxShadow: active ? '2px 2px 0 var(--ink)' : 'none',
                    transition: 'all 0.15s', textAlign: 'left',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onMouseEnter={e => { if (!active) { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--amber3)'; b.style.background = 'rgba(245,168,0,0.06)' }}}
                  onMouseLeave={e => { if (!active) { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'rgba(255,252,240,0.35)'; b.style.background = 'transparent' }}}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* User card */}
      <div style={{ marginTop: 'auto', padding: '14px 8px 0', borderTop: '2px solid rgba(245,168,0,0.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(245,168,0,0.06)',
          border: '1.5px solid rgba(245,168,0,0.18)',
          boxShadow: '2px 2px 0 var(--ink)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: 'var(--navy)',
            border: '2px solid var(--ink)',
          }}>AM</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)', fontFamily: "'Outfit', sans-serif" }}>Alex Morgan</div>
            <div style={{ fontSize: 10, color: 'var(--amber)', opacity: 0.55 }}>Premium Plan</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showBalance, setShowBalance] = useState(true)

  const R = 52
  let cumPct = 0

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

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          display: flex; height: 100vh; overflow: hidden;
          background: var(--amber);
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
          position: relative;
        }

        /* Halftone dot field — matches Hero (on amber bg) */
        .db-dot-field {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(26,16,51,0.18) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        /* Main area scrollbar */
        .db-main::-webkit-scrollbar { width: 4px; }
        .db-main::-webkit-scrollbar-thumb { background: rgba(245,168,0,0.25); border-radius: 3px; }

        /* ── STAT CARDS ── */
        .stat-card {
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.18);
          border-radius: 14px; padding: 20px 22px;
          position: relative; overflow: hidden;
          box-shadow: 4px 4px 0 var(--ink);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .stat-card:hover {
          border-color: rgba(245,168,0,0.4);
          transform: translate(-2px,-2px);
          box-shadow: 6px 6px 0 var(--ink);
        }

        /* ── CHART CARDS ── */
        .chart-card {
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.15);
          border-radius: 14px; padding: 22px 24px;
          box-shadow: 4px 4px 0 var(--ink);
        }
        .chart-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 800;
          color: var(--white); margin-bottom: 18px;
          letter-spacing: -0.02em;
        }

        /* ── STATUS PILLS ── */
        .pill-up   { background: rgba(245,168,0,0.15); color: var(--amber3); display:inline-flex; align-items:center; font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:20px; }
        .pill-down { background: rgba(248,113,113,0.12); color: #F87171; display:inline-flex; align-items:center; font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:20px; }

        /* ── TRANSACTION TABLE ── */
        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table th {
          font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(245,168,0,0.4); padding: 0 0 12px; text-align: left;
          font-weight: 700; border-bottom: 2px solid rgba(245,168,0,0.1);
        }
        .tx-table th:last-child { text-align: right; }
        .tx-table td {
          padding: 11px 8px 11px 0; font-size: 13px;
          border-bottom: 1px solid rgba(245,168,0,0.06); vertical-align: middle;
        }
        .tx-table td:last-child { text-align: right; }
        .tx-row:hover td { background: rgba(245,168,0,0.03); }

        .tx-cat {
          display:inline-flex; align-items:center; font-size:11px;
          color: rgba(245,168,0,0.5);
          background: rgba(245,168,0,0.08);
          border-radius:6px; padding:3px 9px;
          border:1px solid rgba(245,168,0,0.14);
          font-weight: 500;
        }

        /* ── BARS ── */
        .bar { flex:1; border-radius:4px 4px 0 0; min-height:4px; transition:opacity 0.2s; cursor:default; }
        .bar:hover { opacity: 0.75; }
        .bar-income { background: linear-gradient(to top, rgba(245,168,0,0.3), #F5A800); }
        .bar-spend  { background: linear-gradient(to top, rgba(44,29,85,0.5), rgba(44,29,85,0.9)); }

        /* ── ACTION BUTTONS ── */
        .action-btn {
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.15);
          border-radius: 12px; padding: 18px;
          text-align: left; cursor: pointer;
          box-shadow: 3px 3px 0 var(--ink);
          transition: border-color 0.2s, transform 0.18s, box-shadow 0.18s;
          width: 100%;
        }
        .action-btn:hover {
          border-color: rgba(245,168,0,0.4);
          transform: translate(-2px,-2px);
          box-shadow: 5px 5px 0 var(--ink);
        }

        /* ── PRIMARY BUTTON ── */
        .btn-primary {
          background: var(--amber);
          color: var(--navy);
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700;
          padding: 9px 20px;
          border-radius: 8px; border: 2px solid var(--ink);
          cursor: pointer;
          box-shadow: 3px 3px 0 var(--ink);
          transition: background 0.2s, transform 0.18s, box-shadow 0.18s;
        }
        .btn-primary:hover {
          background: var(--amber3);
          transform: translate(-1px,-1px);
          box-shadow: 4px 4px 0 var(--ink);
        }

        /* ── SECONDARY BUTTON ── */
        .btn-secondary {
          display: flex; align-items: center; gap: 8px;
          background: rgba(245,168,0,0.08);
          border: 1.5px solid rgba(245,168,0,0.22);
          border-radius: 8px; padding: 8px 14px; cursor: pointer;
          font-size: 16px; color: var(--amber3);
          font-family: 'Outfit', sans-serif; font-weight: 500;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(245,168,0,0.14);
          border-color: rgba(245,168,0,0.4);
        }
      `}</style>

      <div className="db-root">
        <div className="db-dot-field" />

        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="db-main" style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', position: 'relative', zIndex: 1 }}>

          {/* ── Page header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1, letterSpacing: '-0.035em', position: 'relative', display: 'inline-block', paddingBottom: 8 }}>
                {activeTab === 'overview'     && 'Financial Overview'}
                {activeTab === 'transactions' && 'Transactions'}
                {activeTab === 'cards'        && 'My Cards'}
                {activeTab === 'budget'       && 'Budget Goals'}
                <span style={{ position: 'absolute', left: 0, bottom: 0, width: '60%', height: 4, background: 'var(--ink)', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, color: 'rgb(14, 9, 32)', marginTop: 10, letterSpacing: '0.04em', fontWeight: 400 }}>
                {activeTab === 'overview'     && 'December 2024 · Good morning, Alex'}
                {activeTab === 'transactions' && 'All your recent financial activity'}
                {activeTab === 'cards'        && 'Manage your payment methods'}
                {activeTab === 'budget'       && 'December 2024 — 18 days remaining'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {activeTab === 'overview' && (
                <button className="btn-secondary" onClick={() => setShowBalance(!showBalance)}  style={{ color: 'rgba(0, 0, 0, 0.81)' }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="3"/><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                  </svg>
                  {showBalance ? 'Hide balances' : 'Show balances'}
                </button>
              )}
              {(activeTab === 'cards' || activeTab === 'budget') && (
                <button className="btn-primary">
                  {activeTab === 'cards' ? '+ Add Card' : '+ New Budget'}
                </button>
              )}
            </div>
          </div>

          {/* ════════════ OVERVIEW ════════════ */}
          {activeTab === 'overview' && (
            <div>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14, marginBottom: 24 }}>
                {SUMMARY_CARDS.map((card, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, opacity: 0.15, color: 'var(--amber)' }}>{card.icon}</div>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,168,0,0.45)', fontWeight: 700, marginBottom: 10 }}>{card.label}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                      {showBalance ? card.value : '••••••'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,252,240,0.35)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {card.subType === 'up'   && <span className="pill-up">{card.sub.split(' ')[0]}</span>}
                      {card.subType === 'down' && <span className="pill-down">{card.sub.split(' ')[0]}</span>}
                      <span style={{ color: card.subType === 'gold' ? 'var(--amber3)' : undefined, fontSize: 10.5 }}>
                        {card.subType === 'up' || card.subType === 'down' ? card.sub.slice(card.sub.indexOf(' ') + 1) : card.sub}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.9fr', gap: 18, marginBottom: 20 }}>
                {/* Donut */}
                <div className="chart-card">
                  <div className="chart-title">Category Breakdown</div>
                  <div style={{ position: 'relative', width: 136, height: 136, margin: '0 auto 18px' }}>
                    <svg width="136" height="136" viewBox="0 0 136 136" style={{ transform: 'rotate(-90deg)' }}>
                      {(() => {
                        cumPct = 0
                        const C = 2 * Math.PI * R
                        return DONUT_SEGMENTS.map((seg, i) => {
                          const dash = `${(seg.pct / 100) * C} ${C}`
                          const offset = -((cumPct / 100) * C)
                          cumPct += seg.pct
                          return (
                            <circle key={i} cx="68" cy="68" r={R} fill="none"
                              stroke={DONUT_COLORS[i]} strokeWidth="16"
                              strokeDasharray={dash} strokeDashoffset={offset}
                            />
                          )
                        })
                      })()}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em' }}>$3.1k</div>
                      <div style={{ fontSize: 9, color: 'rgba(245,168,0,0.4)', letterSpacing: '0.08em', marginTop: 3, textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
                    </div>
                  </div>
                  {DONUT_SEGMENTS.map((seg, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: i < DONUT_SEGMENTS.length - 1 ? '1px solid rgba(245,168,0,0.08)' : 'none',
                      fontSize: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,252,240,0.45)' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: DONUT_COLORS[i], marginRight: 8 }} />
                        {seg.label}
                      </div>
                      <div style={{ color: 'var(--white)', fontWeight: 600 }}>{showBalance ? seg.amount : '••••'}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="chart-card">
                  <div className="chart-title">Monthly Income vs Spending</div>
                  <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 14, paddingBottom: 28, borderBottom: '2px solid rgba(245,168,0,0.1)', position: 'relative' }}>
                    {MONTHS.map(m => (
                      <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', width: '100%', height: 150 }}>
                          <div className="bar bar-income" style={{ height: `${m.income}%` }} />
                          <div className="bar bar-spend"  style={{ height: `${m.spend}%` }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: 'rgba(245,168,0,0.4)', letterSpacing: '0.06em' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 11.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,252,240,0.35)' }}>
                      <div style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--amber)' }} /> Income
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,252,240,0.35)' }}>
                      <div style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--navy2)' }} /> Spending
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
                {/* Recent transactions */}
                <div className="chart-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div className="chart-title" style={{ margin: 0 }}>Recent Transactions</div>
                    <button onClick={() => setActiveTab('transactions')}
                      style={{ fontSize: 12, color: 'var(--amber3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                      View all →
                    </button>
                  </div>
                  <table className="tx-table">
                    <thead><tr>
                      <th>Merchant</th><th>Category</th><th>Date</th><th>Amount</th>
                    </tr></thead>
                    <tbody>
                      {TRANSACTIONS.slice(0, 6).map(tx => (
                        <tr key={tx.id} className="tx-row">
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(245,168,0,0.1)', border: '1.5px solid rgba(245,168,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{tx.icon}</div>
                              <span style={{ color: 'var(--white)', fontSize: 12.5 }}>{tx.name}</span>
                            </div>
                          </td>
                          <td><span className="tx-cat">{tx.category}</span></td>
                          <td style={{ fontSize: 11, color: 'rgba(245,168,0,0.38)' }}>{tx.date}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: tx.amount > 0 ? 'var(--amber3)' : 'rgba(255,252,240,0.6)' }}>
                              {showBalance ? `${tx.amount > 0 ? '+' : ''}$${Math.abs(tx.amount).toFixed(2)}` : '••••'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Smart insights */}
                <div className="chart-card">
                  <div className="chart-title">Smart Insights</div>
                  {INSIGHTS.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12,
                      padding: i < INSIGHTS.length - 1 ? '11px 0' : '11px 0 0',
                      borderBottom: i < INSIGHTS.length - 1 ? '1px solid rgba(245,168,0,0.07)' : 'none',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: i % 2 === 0 ? 'var(--amber)' : 'var(--amber3)', marginTop: 7, flexShrink: 0 }} />
                      <div
                        style={{ fontSize: 12, color: 'rgba(255,252,240,0.45)', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: item.text.replace(/<strong>/g, '<strong style="color:var(--amber3);font-weight:700">') }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ TRANSACTIONS ════════════ */}
          {activeTab === 'transactions' && (
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div className="chart-title" style={{ margin: 0 }}>All Transactions</div>
                <button className="btn-secondary">Export CSV</button>
              </div>
              <table className="tx-table">
                <thead><tr>
                  <th>Merchant</th><th>Category</th><th>Date</th><th>Status</th><th>Amount</th>
                </tr></thead>
                <tbody>
                  {TRANSACTIONS.map(tx => (
                    <tr key={tx.id} className="tx-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,168,0,0.1)', border: '1.5px solid rgba(245,168,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{tx.icon}</div>
                          <span style={{ color: 'var(--white)', fontSize: 13 }}>{tx.name}</span>
                        </div>
                      </td>
                      <td><span className="tx-cat">{tx.category}</span></td>
                      <td style={{ fontSize: 11, color: 'rgba(245,168,0,0.38)' }}>{tx.date}</td>
                      <td>
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                          background: tx.status === 'pending' ? 'rgba(245,168,0,0.12)' : 'rgba(245,168,0,0.07)',
                          color: tx.status === 'pending' ? 'var(--amber)' : 'var(--amber3)',
                          border: `1px solid ${tx.status === 'pending' ? 'rgba(245,168,0,0.3)' : 'rgba(245,168,0,0.14)'}`,
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, fontSize: 13.5, color: tx.amount > 0 ? 'var(--amber3)' : 'rgba(255,252,240,0.6)' }}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ════════════ CARDS ════════════ */}
          {activeTab === 'cards' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {CARDS.map((card, i) => (
                  <div key={i} style={{
                    borderRadius: 16, padding: 24,
                    background: 'var(--navy)',
                    border: '2px solid rgba(245,168,0,0.22)',
                    boxShadow: `6px 6px 0 var(--ink)`,
                    position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translate(-2px,-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='8px 8px 0 var(--ink)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow='6px 6px 0 var(--ink)' }}
                  >
                    {/* Glow blob */}
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'var(--amber)', opacity: i === 0 ? 0.08 : 0.04, filter: 'blur(25px)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 6, opacity: i === 0 ? 1 : 0.65 }}>{card.name}</div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--white)', letterSpacing: '0.08em' }}>•••• {card.last4}</div>
                      </div>
                      <div style={{ fontSize: 22 }}>💳</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'rgba(245,168,0,0.4)', marginBottom: 4 }}>Available Balance</div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--white)' }}>
                          {showBalance ? `$${card.balance.toLocaleString()}` : '••••••'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: 'rgba(245,168,0,0.4)', marginBottom: 4 }}>Limit</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,252,240,0.55)' }}>${card.limit.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ width: '100%', background: 'rgba(245,168,0,0.1)', borderRadius: 99, height: 5 }}>
                        <div style={{
                          height: 5, borderRadius: 99,
                          width: `${(card.balance / card.limit) * 100}%`,
                          background: 'var(--amber)',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(245,168,0,0.38)', marginTop: 6 }}>{Math.round((card.balance / card.limit) * 100)}% used</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Freeze Card',  icon: '❄️', desc: 'Temporarily lock'  },
                  { label: 'Change PIN',   icon: '🔑', desc: 'Update security'    },
                  { label: 'Card Limits',  icon: '📊', desc: 'Adjust spend limit' },
                  { label: 'Report Lost',  icon: '🚨', desc: 'Cancel & replace'   },
                ].map(a => (
                  <button key={a.label} className="action-btn">
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{a.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)', marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>{a.label}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(245,168,0,0.38)' }}>{a.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════════ BUDGET ════════════ */}
          {activeTab === 'budget' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {BUDGETS.map(b => {
                const pct = Math.round((b.spent / b.limit) * 100)
                const over = pct >= 90
                return (
                  <div key={b.category} className="chart-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,168,0,0.1)', border: '1.5px solid rgba(245,168,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{b.icon}</div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--white)', fontFamily: "'Outfit', sans-serif" }}>{b.category}</div>
                          <div style={{ fontSize: 11, color: 'rgba(245,168,0,0.4)', marginTop: 2 }}>${b.spent} of ${b.limit}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
                        background: over ? 'rgba(248,113,113,0.1)' : 'rgba(245,168,0,0.1)',
                        color: over ? '#F87171' : 'var(--amber3)',
                        border: `1px solid ${over ? 'rgba(248,113,113,0.25)' : 'rgba(245,168,0,0.25)'}`,
                      }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', background: 'rgba(245,168,0,0.1)', borderRadius: 99, height: 6 }}>
                      <div style={{
                        height: 6, borderRadius: 99,
                        width: `${Math.min(pct, 100)}%`,
                        background: over ? '#F87171' : 'var(--amber)',
                        transition: 'width 0.4s',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                      <span style={{ color: 'rgba(245,168,0,0.38)' }}>${b.limit - b.spent} remaining</span>
                      {over && <span style={{ color: '#F87171' }}>⚠ Near limit</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </>
  )
}