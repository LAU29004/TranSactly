'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from "next/navigation";

// ─── TIME PERIOD DATA ─────────────────────────────────────────────────────────
type Period = 'month' | '6months' | '1year'

const PERIOD_DATA: Record<Period, {
  summaryCards: typeof SUMMARY_CARDS_BASE,
  months: typeof MONTHS_BASE,
  donut: typeof DONUT_SEGMENTS_BASE,
  insights: typeof INSIGHTS_BASE,
}> = {
  month: {
    summaryCards: [
      { label: 'Total Balance',  value: '$24,891', sub: '↑ 12.4% vs last month', subType: 'up',   icon: '◈' },
      { label: 'Monthly Income', value: '$8,240',  sub: '↑ 8.2% this period',    subType: 'up',   icon: '↑' },
      { label: 'Monthly Spent',  value: '$3,120',  sub: '↑ 3.1% vs last month',  subType: 'down', icon: '↓' },
      { label: 'Net Savings',    value: '$5,120',  sub: 'On track · Dec goal',   subType: 'gold', icon: '◉' },
    ],
    months: [
      { label: 'W1', income: 72, spend: 28 },
      { label: 'W2', income: 75, spend: 33 },
      { label: 'W3', income: 75, spend: 30 },
      { label: 'W4', income: 92, spend: 22 },
    ],
    donut: [
      { pct: 38, label: 'Food',      amount: '$1,178' },
      { pct: 30, label: 'Transport', amount: '$930'   },
      { pct: 20, label: 'Shopping',  amount: '$620'   },
      { pct: 12, label: 'Other',     amount: '$372'   },
    ],
    insights: [
      { text: 'Income rose <strong>12.4%</strong> this month — your best performance in 6 months.' },
      { text: 'Transport at <strong>$930</strong> is 30% of spending. Consider a monthly cap.' },
      { text: 'Entertainment budget is at <strong>95%</strong> with 18 days left — watch out.' },
      { text: 'Your <strong>net savings of $5,120</strong> is up 21% vs November. Keep it up.' },
      { text: 'Netflix + Kindle together are <strong>$34.98/mo</strong>. Review subscriptions quarterly.' },
    ],
  },
  '6months': {
    summaryCards: [
      { label: 'Total Balance',  value: '$24,891', sub: '↑ 18.6% vs 6mo ago',   subType: 'up',   icon: '◈' },
      { label: 'Avg Mo. Income', value: '$7,840',  sub: '↑ 5.1% trend',          subType: 'up',   icon: '↑' },
      { label: 'Avg Mo. Spent',  value: '$3,410',  sub: '↓ 2.8% improvement',    subType: 'up',   icon: '↓' },
      { label: 'Net Savings',    value: '$26,580', sub: '6-month total',         subType: 'gold', icon: '◉' },
    ],
    months: [
      { label: 'Jul', income: 72, spend: 28 },
      { label: 'Aug', income: 75, spend: 33 },
      { label: 'Sep', income: 75, spend: 30 },
      { label: 'Oct', income: 80, spend: 26 },
      { label: 'Nov', income: 78, spend: 29 },
      { label: 'Dec', income: 92, spend: 22 },
    ],
    donut: [
      { pct: 35, label: 'Food',      amount: '$7,140' },
      { pct: 28, label: 'Transport', amount: '$5,712' },
      { pct: 22, label: 'Shopping',  amount: '$4,488' },
      { pct: 15, label: 'Other',     amount: '$3,060' },
    ],
    insights: [
      { text: 'Your 6-month income trend is <strong>+5.1%</strong> — steady, healthy growth.' },
      { text: 'Average monthly spend dropped to <strong>$3,410</strong> — down from $3,507 last period.' },
      { text: 'Food costs have risen <strong>8% over 6 months</strong>. Consider meal prepping.' },
      { text: 'You saved <strong>$26,580</strong> across 6 months — ahead of your annual goal.' },
      { text: 'Transport is consistently high. A <strong>monthly transit pass</strong> could save ~$120/mo.' },
    ],
  },
  '1year': {
    summaryCards: [
      { label: 'Total Balance',  value: '$24,891', sub: '↑ 34.2% YoY',           subType: 'up',   icon: '◈' },
      { label: 'Annual Income',  value: '$94,880', sub: '↑ 11.3% vs prior year', subType: 'up',   icon: '↑' },
      { label: 'Annual Spent',   value: '$41,520', sub: '↓ 4.2% vs prior year',  subType: 'up',   icon: '↓' },
      { label: 'Net Savings',    value: '$53,360', sub: 'Annual total · 2024',   subType: 'gold', icon: '◉' },
    ],
    months: [
      { label: 'Jan', income: 68, spend: 35 },
      { label: 'Mar', income: 72, spend: 32 },
      { label: 'May', income: 74, spend: 31 },
      { label: 'Jul', income: 72, spend: 28 },
      { label: 'Sep', income: 75, spend: 30 },
      { label: 'Nov', income: 78, spend: 29 },
      { label: 'Dec', income: 92, spend: 22 },
    ],
    donut: [
      { pct: 33, label: 'Food',      amount: '$13,700' },
      { pct: 27, label: 'Transport', amount: '$11,210' },
      { pct: 24, label: 'Shopping',  amount: '$9,964'  },
      { pct: 16, label: 'Other',     amount: '$6,643'  },
    ],
    insights: [
      { text: 'Annual income grew <strong>11.3% YoY</strong> — outpacing inflation by 5 points.' },
      { text: 'You reduced annual spending by <strong>$1,820</strong> vs last year. Great discipline.' },
      { text: 'Housing is your largest fixed cost at <strong>$21,600/year</strong> — 23% of income.' },
      { text: 'Net savings of <strong>$53,360</strong> represents a 56% savings rate this year.' },
      { text: 'Subscriptions cost <strong>$418/year</strong>. An annual audit could free up ~$100+.' },
    ],
  },
}

// Placeholder types for base data (used in PERIOD_DATA typing above)
const SUMMARY_CARDS_BASE = PERIOD_DATA as any
const MONTHS_BASE = PERIOD_DATA as any
const DONUT_SEGMENTS_BASE = PERIOD_DATA as any
const INSIGHTS_BASE = PERIOD_DATA as any

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { id: 1, icon: '🛒', name: 'Whole Foods Market', category: 'Groceries',     date: 'Today, 2:14 PM', amount: -67.40,   dateVal: new Date(2024,11,6), type: 'debit'  },
  { id: 2, icon: '☕', name: 'Blue Bottle Coffee',  category: 'Food & Drink',  date: 'Today, 9:01 AM', amount: -5.80,    dateVal: new Date(2024,11,6), type: 'debit'  },
  { id: 3, icon: '💼', name: 'Acme Corp — Salary',  category: 'Income',        date: 'Yesterday',      amount: 4200.00,  dateVal: new Date(2024,11,5), type: 'credit' },
  { id: 4, icon: '🏠', name: 'Rent — Apt 4B',       category: 'Housing',       date: 'Dec 1',          amount: -1800.00, dateVal: new Date(2024,11,1), type: 'debit'  },
  { id: 5, icon: '📱', name: 'Netflix Premium',      category: 'Subscriptions', date: 'Nov 30',         amount: -22.99,   dateVal: new Date(2024,10,30), type: 'debit' },
  { id: 6, icon: '✈️', name: 'United Airlines',     category: 'Travel',        date: 'Nov 28',         amount: -340.00,  dateVal: new Date(2024,10,28), type: 'debit' },
  { id: 7, icon: '💊', name: 'CVS Pharmacy',         category: 'Health',        date: 'Nov 27',         amount: -18.50,   dateVal: new Date(2024,10,27), type: 'debit' },
  { id: 8, icon: '📚', name: 'Kindle Unlimited',    category: 'Subscriptions', date: 'Nov 26',         amount: -11.99,   dateVal: new Date(2024,10,26), type: 'debit' },
]

const ALL_CATEGORIES = ['All', ...Array.from(new Set(TRANSACTIONS.map(t => t.category)))]

const DONUT_COLORS = ['#F5A800', '#FFD166', '#E09700', '#2C1D55']

const PERIOD_LABELS: Record<Period, string> = {
  month: 'This Month',
  '6months': '6 Months',
  '1year': '1 Year',
}

type Tab = 'overview' | 'transactions'
type TxType = 'all' | 'credit' | 'debit'

interface FilterState {
  category: string
  txType: TxType
  dateFrom: Date | null
  dateTo: Date | null
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

const sameDay = (a: Date | null, b: Date | null) =>
  !!(a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate())

// ─── PERIOD CHIPS ─────────────────────────────────────────────────────────────
function PeriodChips({
  activePeriod,
  onChange,
}: {
  activePeriod: Period
  onChange: (p: Period) => void
}) {
  const periods: Period[] = ['month', '6months', '1year']
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {periods.map(p => {
        const active = activePeriod === p
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              cursor: 'pointer',
              fontFamily: "'Outfit',sans-serif",
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.18s',
              border: active
                ? '4.5px solid rgba(245,168,0,0.7)'
                : '1.5px solid rgba(245,168,0,0.22)',
              background: active
                ? '#F5A800'
                : 'rgba(245,168,0,0.07)',
              color: active ? '#1A1033' : 'rgb(0, 0, 0)',
              boxShadow: active ? '2px 2px 0 #0E0920' : 'none',
              letterSpacing: active ? '0.01em' : '0',
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        )
      })}
    </div>
  )
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function Calendar({
  dateFrom, dateTo,
  onPick,
  onPreset,
  onClear,
}: {
  dateFrom: Date | null
  dateTo: Date | null
  onPick: (d: Date) => void
  onPreset: (days: number) => void
  onClear: () => void
}) {
  const today = new Date(2024, 11, 6)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const first = new Date(calYear, calMonth, 1)
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const startDow = first.getDay()
  const monthName = first.toLocaleString('default', { month: 'long' })

  const nav = (dir: number) => {
    let m = calMonth + dir, y = calYear
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setCalMonth(m); setCalYear(y)
  }

  const days: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(calYear, calMonth, i + 1)),
  ]

  const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div style={{
      background: '#2C1D55', border: '2px solid rgba(245,168,0,0.3)',
      borderRadius: 12, padding: 16, boxShadow: '6px 6px 0 #0E0920',
      minWidth: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => nav(-1)} style={calNavStyle}>‹</button>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: '#FFFCF0' }}>
          {monthName} {calYear}
        </span>
        <button onClick={() => nav(1)} style={calNavStyle}>›</button>
      </div>
      <div style={{ fontSize: 10.5, color: 'rgba(245,168,0,0.4)', marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>
        {dateFrom && !dateTo ? 'Now pick end date' : 'Click to pick start date'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {WEEK.map(w => (
          <div key={w} style={{ fontSize: 9.5, textAlign: 'center', color: 'rgba(245,168,0,0.4)', fontWeight: 700, letterSpacing: '0.06em', padding: '4px 0' }}>{w}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />
          const isStart = sameDay(d, dateFrom)
          const isEnd   = sameDay(d, dateTo)
          const inRange = !!(dateFrom && dateTo && d > dateFrom && d < dateTo)
          let bg = 'none', color = 'rgba(255,252,240,0.55)', radius = '6px', fw: number | string = 400
          if (isStart || isEnd) { bg = '#F5A800'; color = '#1A1033'; fw = 700 }
          else if (inRange)     { bg = 'rgba(245,168,0,0.12)'; color = '#FFD166'; radius = '0' }
          if (isStart && isEnd) radius = '6px'
          else if (isStart)     radius = '6px 0 0 6px'
          else if (isEnd)       radius = '0 6px 6px 0'
          return (
            <button key={d.toISOString()} onClick={() => onPick(d)}
              style={{ height: 28, borderRadius: radius, border: 'none', background: bg, fontSize: 11.5,
                fontFamily: "'Outfit',sans-serif", cursor: 'pointer', color, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: fw, transition: 'all 0.12s' }}>
              {d.getDate()}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(245,168,0,0.12)', flexWrap: 'wrap' }}>
        {[7, 30, 90].map(n => (
          <button key={n} onClick={() => onPreset(n)}
            style={{ fontSize: 11, fontFamily: "'Outfit',sans-serif", background: 'rgba(245,168,0,0.08)',
              border: '1px solid rgba(245,168,0,0.2)', borderRadius: 6, color: 'rgba(255,252,240,0.5)',
              padding: '5px 10px', cursor: 'pointer' }}>
            Last {n}d
          </button>
        ))}
        {(dateFrom || dateTo) && (
          <button onClick={onClear}
            style={{ fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 600,
              color: 'rgba(255,100,100,0.7)', background: 'rgba(255,100,100,0.08)',
              border: '1px solid rgba(255,100,100,0.2)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

const calNavStyle: React.CSSProperties = {
  background: 'none', border: '1.5px solid rgba(245,168,0,0.25)', borderRadius: 6,
  color: '#F5A800', fontSize: 16, width: 28, height: 28, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ─── CALENDAR TRIGGER ─────────────────────────────────────────────────────────
function CalendarPicker({
  dateFrom, dateTo,
  onChange,
}: {
  dateFrom: Date | null
  dateTo: Date | null
  onChange: (from: Date | null, to: Date | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePick = (d: Date) => {
    if (!dateFrom || (!dateTo && d < dateFrom)) {
      onChange(d, null)
    } else if (dateFrom && !dateTo) {
      if (sameDay(d, dateFrom)) onChange(null, null)
      else if (d > dateFrom)    onChange(dateFrom, d)
      else                      onChange(d, dateFrom)
    } else {
      onChange(d, null)
    }
  }

  const handlePreset = (days: number) => {
    const to   = new Date(2024, 11, 6)
    const from = new Date(to)
    from.setDate(from.getDate() - days)
    onChange(from, to)
    setOpen(false)
  }

  const handleClear = () => { onChange(null, null) }

  const label = dateFrom && dateTo
    ? `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`
    : dateFrom
    ? `${fmtDate(dateFrom)} – ...`
    : 'Pick date range'

  const hasRange = !!(dateFrom || dateTo)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: hasRange ? 'rgba(245,168,0,0.14)' : 'rgba(245,168,0,0.08)',
        border: `1.5px solid ${hasRange ? 'rgba(245,168,0,0.55)' : 'rgba(245,168,0,0.28)'}`,
        borderRadius: 8, color: '#FFFCF0', fontSize: 12,
        fontFamily: "'Outfit',sans-serif", padding: '8px 12px', cursor: 'pointer',
        outline: 'none', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
      }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="11" rx="2"/><path d="M5 1v3M11 1v3M2 7h12"/>
        </svg>
        {label}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100 }}>
          <Calendar
            dateFrom={dateFrom} dateTo={dateTo}
            onPick={handlePick}
            onPreset={handlePreset}
            onClear={handleClear}
          />
        </div>
      )}
    </div>
  )
}

// ─── FILTER BAR ───────────────────────────────────────────────────────────────
function FilterBar({
  filters, setFilters, resultCount, totalCount,
}: {
  filters: FilterState
  setFilters: (f: FilterState) => void
  resultCount: number
  totalCount: number
}) {
  const set = (patch: Partial<FilterState>) => setFilters({ ...filters, ...patch })

  const hasActive =
    filters.category !== 'All' ||
    filters.txType !== 'all' ||
    !!filters.dateFrom ||
    !!filters.dateTo

  const typeOptions: { val: TxType; label: string }[] = [
    { val: 'all',    label: 'All'       },
    { val: 'credit', label: '↑ Credit'  },
    { val: 'debit',  label: '↓ Debit'   },
  ]

  return (
    <div style={{
      background: '#1A1033',
      border: '2px solid rgba(245,168,0,0.22)',
      borderRadius: 14, padding: '18px 20px', marginBottom: 18,
      boxShadow: '4px 4px 0 #0E0920',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>

        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={filterLabelStyle}>Category</label>
          <select
            value={filters.category}
            onChange={e => set({ category: e.target.value })}
            style={selectStyle}
          >
            {ALL_CATEGORIES.map(c => (
              <option key={c} value={c} style={{ background: '#1A1033', color: '#FFFCF0' }}>{c}</option>
            ))}
          </select>
        </div>

        <div style={dividerStyle} />

        {/* Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={filterLabelStyle}>Type</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {typeOptions.map(({ val, label }) => {
              const active = filters.txType === val
              return (
                <button key={val} onClick={() => set({ txType: val })}
                  style={{
                    padding: '8px 14px', borderRadius: 7, cursor: 'pointer',
                    fontFamily: "'Outfit',sans-serif", fontSize: 12, transition: 'all 0.15s',
                    fontWeight: active ? 700 : 400,
                    border: active ? '1.5px solid rgba(245,168,0,0.55)' : '1.5px solid rgba(245,168,0,0.18)',
                    background: active ? 'rgba(245,168,0,0.2)' : 'rgba(245,168,0,0.05)',
                    color: active ? '#F5A800' : 'rgba(255,252,240,0.4)',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={dividerStyle} />

        {/* Date range */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={filterLabelStyle}>Date range</label>
          <CalendarPicker
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChange={(from, to) => set({ dateFrom: from, dateTo: to })}
          />
        </div>

        {/* Results + clear */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, alignSelf: 'flex-end' }}>
          <span style={{ fontSize: 11, color: 'rgba(245,168,0,0.5)', whiteSpace: 'nowrap' }}>
            {resultCount} of {totalCount} transactions
          </span>
          {hasActive && (
            <button
              onClick={() => setFilters({ category: 'All', txType: 'all', dateFrom: null, dateTo: null })}
              style={{
                fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 600,
                color: 'rgba(255,100,100,0.7)', background: 'rgba(255,100,100,0.08)',
                border: '1px solid rgba(255,100,100,0.2)', borderRadius: 6,
                padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const filterLabelStyle: React.CSSProperties = {
  fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: 'rgba(245,168,0,0.5)', fontWeight: 700,
}
const selectStyle: React.CSSProperties = {
  background: 'rgba(245,168,0,0.08)', border: '1.5px solid rgba(245,168,0,0.28)',
  borderRadius: 8, color: '#FFFCF0', fontSize: 12,
  fontFamily: "'Outfit',sans-serif", padding: '8px 12px', cursor: 'pointer',
  outline: 'none', minWidth: 130,
}
const dividerStyle: React.CSSProperties = {
  width: 1, background: 'rgba(245,168,0,0.15)', alignSelf: 'stretch',
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({
  activeTab, setActiveTab, onLogout,
}: {
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  onLogout: () => void
}) {
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5"/>
        </svg>
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 5h12M2 8h8M2 11h5"/>
        </svg>
      ),
    },
  ]

  return (
    <aside style={{
      width: 224, minWidth: 224, background: '#1A1033',
      borderRight: '3px solid #0E0920', display: 'flex',
      flexDirection: 'column', padding: '20px 0',
    }}>
      {/* Brand */}
      <div style={{ padding: '0 18px 20px', borderBottom: '2px solid rgba(245,168,0,0.12)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: '#F5A800',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0 #0E0920',
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#1A1033" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: '#FFFCF0', letterSpacing: '-0.03em' }}>
              fin<span style={{ color: '#F5A800' }}>orio</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(245,168,0,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>
              Wealth Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 8px', marginBottom: 4 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,168,0,0.35)', padding: '0 10px 6px', fontWeight: 700 }}>
          Overview
        </div>
        {navItems.map(item => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                fontSize: 13, fontFamily: "'Outfit',sans-serif", textAlign: 'left',
                fontWeight: active ? 700 : 400,
                color: active ? '#F5A800' : 'rgba(255,252,240,0.35)',
                background: active ? 'rgba(245,168,0,0.12)' : 'transparent',
                border: active ? '1.5px solid rgba(245,168,0,0.28)' : '1.5px solid transparent',
                boxShadow: active ? '2px 2px 0 #0E0920' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>

      {/* User card + logout */}
      <div style={{ marginTop: 'auto', padding: '14px 8px 0', borderTop: '2px solid rgba(245,168,0,0.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(245,168,0,0.06)',
          border: '1.5px solid rgba(245,168,0,0.18)',
          boxShadow: '2px 2px 0 #0E0920',
          marginBottom: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#F5A800',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#1A1033', border: '2px solid #0E0920',
          }}>AM</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFCF0', fontFamily: "'Outfit',sans-serif" }}>Alex Morgan</div>
            <div style={{ fontSize: 10, color: '#F5A800', opacity: 0.55 }}>Premium Plan</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontFamily: "'Outfit',sans-serif", fontWeight: 600,
            background: 'rgba(255,80,80,0.07)',
            border: '1.5px solid rgba(255,80,80,0.2)',
            color: 'rgba(255,120,120,0.75)',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement
            b.style.background = 'rgba(255,80,80,0.15)'
            b.style.borderColor = 'rgba(255,80,80,0.45)'
            b.style.color = '#ff8888'
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement
            b.style.background = 'rgba(255,80,80,0.07)'
            b.style.borderColor = 'rgba(255,80,80,0.2)'
            b.style.color = 'rgba(255,120,120,0.75)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
          </svg>
          Log out
        </button>
      </div>
    </aside>
  )
}

// ─── LOGGED OUT SCREEN ────────────────────────────────────────────────────────
function LoggedOut({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F5A800', gap: 16,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: '#1A1033',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '4px 4px 0 #0E0920',
      }}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 26, height: 26 }}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="#F5A800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#1A1033', letterSpacing: '-0.03em' }}>
        You've been logged out
      </div>
      <div style={{ fontSize: 13, color: 'rgba(14,9,32,0.55)' }}>See you next time, Alex.</div>
      <button onClick={onBack}
        style={{
          marginTop: 8, background: '#1A1033', color: '#F5A800',
          fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700,
          padding: '10px 24px', borderRadius: 8, border: '2px solid #0E0920',
          cursor: 'pointer', boxShadow: '3px 3px 0 #0E0920',
        }}>
        ← Back to login
      </button>
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showBalance, setShowBalance] = useState(true)
  const [loggedOut, setLoggedOut] = useState(false)
  const [activePeriod, setActivePeriod] = useState<Period>('month')

  const defaultFilters: FilterState = { category: 'All', txType: 'all', dateFrom: null, dateTo: null }
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  // Derived period data
  const periodData = PERIOD_DATA[activePeriod]
  const SUMMARY_CARDS = periodData.summaryCards
  const MONTHS = periodData.months
  const DONUT_SEGMENTS = periodData.donut
  const INSIGHTS = periodData.insights

  const filteredTransactions = useMemo(() => {
    return TRANSACTIONS.filter(tx => {
      if (filters.category !== 'All' && tx.category !== filters.category) return false
      if (filters.txType === 'credit' && tx.type !== 'credit') return false
      if (filters.txType === 'debit'  && tx.type !== 'debit')  return false
      if (filters.dateFrom && tx.dateVal < filters.dateFrom) return false
      if (filters.dateTo) {
        const end = new Date(filters.dateTo); end.setHours(23, 59, 59)
        if (tx.dateVal > end) return false
      }
      return true
    })
  }, [filters])

  const hasActive =
    filters.category !== 'All' ||
    filters.txType !== 'all' ||
    !!filters.dateFrom ||
    !!filters.dateTo

  let cumPct = 0
  const C = 2 * Math.PI * 52
  const router = useRouter();

  if (loggedOut) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#F5A800' }}>
        <LoggedOut onBack={() => setLoggedOut(false)} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --amber:#F5A800;--amber2:#E09700;--amber3:#FFD166;
          --navy:#1A1033;--navy2:#2C1D55;--ink:#0E0920;--white:#FFFCF0;
        }
        .db-root {
          display:flex;height:100vh;overflow:hidden;background:var(--amber);
          font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;position:relative;
        }
        .db-dot-field {
          position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:radial-gradient(circle,rgba(26,16,51,0.18) 1.3px,transparent 1.3px);
          background-size:20px 20px;
        }
        .db-main{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:1;}
        .db-main::-webkit-scrollbar{width:4px;}
        .db-main::-webkit-scrollbar-thumb{background:rgba(245,168,0,0.25);border-radius:3px;}
        .stat-card{
          background:var(--navy);border:2px solid rgba(245,168,0,0.18);border-radius:14px;
          padding:20px 22px;position:relative;overflow:hidden;box-shadow:4px 4px 0 var(--ink);
          transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s;
        }
        .stat-card:hover{border-color:rgba(245,168,0,0.4);transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--ink);}
        .chart-card{
          background:var(--navy);border:2px solid rgba(245,168,0,0.15);
          border-radius:14px;padding:22px 24px;box-shadow:4px 4px 0 var(--ink);
        }
        .chart-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--white);margin-bottom:18px;letter-spacing:-0.02em;}
        .pill-up{background:rgba(245,168,0,0.15);color:var(--amber3);display:inline-flex;align-items:center;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:20px;}
        .pill-down{background:rgba(248,113,113,0.12);color:#F87171;display:inline-flex;align-items:center;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:20px;}
        .tx-table{width:100%;border-collapse:collapse;}
        .tx-table th{
          font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;
          color:rgba(245,168,0,0.4);padding:0 0 12px;text-align:left;
          font-weight:700;border-bottom:2px solid rgba(245,168,0,0.1);
        }
        .tx-table th:last-child{text-align:right;}
        .tx-table td{padding:11px 8px 11px 0;font-size:13px;border-bottom:1px solid rgba(245,168,0,0.06);vertical-align:middle;}
        .tx-table td:last-child{text-align:right;}
        .tx-row:hover td{background:rgba(245,168,0,0.03);}
        .tx-cat{
          display:inline-flex;align-items:center;font-size:11px;
          color:rgba(245,168,0,0.6);background:rgba(245,168,0,0.1);
          border-radius:6px;padding:3px 9px;border:1px solid rgba(245,168,0,0.2);font-weight:500;
        }
        .bar{flex:1;border-radius:4px 4px 0 0;min-height:4px;transition:all 0.35s ease;cursor:default;}
        .bar:hover{opacity:0.75;}
        .bar-income{background:linear-gradient(to top,rgba(245,168,0,0.3),#F5A800);}
        .bar-spend{background:linear-gradient(to top,rgba(44,29,85,0.5),rgba(44,29,85,0.9));}
        .btn-secondary{
          display:flex;align-items:center;gap:8px;background:rgba(245,168,0,0.08);
          border:1.5px solid rgba(245,168,0,0.22);border-radius:8px;padding:8px 14px;cursor:pointer;
          font-size:13px;color:rgba(255, 255, 255, 0.75);font-family:'Outfit',sans-serif;font-weight:500;
          transition:background 0.2s,border-color 0.2s;
        }
        .btn-secondary:hover{background:rgba(245,168,0,0.14);border-color:rgba(245,168,0,0.4);}
        .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;gap:10px;}
      `}</style>

      <div className="db-root">
        <div className="db-dot-field" />

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => router.push("/")}
        />

        <main className="db-main">

          {/* ── Page header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800,
                color: 'var(--navy)', lineHeight: 1.1, letterSpacing: '-0.035em',
                position: 'relative', display: 'inline-block', paddingBottom: 8,
              }}>
                {activeTab === 'overview' ? 'Financial Overview' : 'Transactions'}
                <span style={{ position: 'absolute', left: 0, bottom: 0, width: '60%', height: 4, background: 'var(--ink)', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, color: 'rgb(14,9,32)', marginTop: 10, letterSpacing: '0.04em' }}>
                {activeTab === 'overview' ? 'December 2024 · Good morning, Alex' : 'All your recent financial activity'}
              </div>
            </div>

            {/* Right side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {activeTab === 'overview' && (
                <>
                  <PeriodChips activePeriod={activePeriod} onChange={setActivePeriod} />
                  <div style={{ width: 1, height: 28, background: 'rgba(26,16,51,0.2)' }} />
                  <button className="btn-secondary" onClick={() => setShowBalance(!showBalance)}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="8" r="3"/><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                    </svg>
                    {showBalance ? 'Hide' : 'Show'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ════════ OVERVIEW ════════ */}
          {activeTab === 'overview' && (
            <div>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 24 }}>
                {SUMMARY_CARDS.map((card: typeof SUMMARY_CARDS[0], i: number) => (
                  <div key={i} className="stat-card">
                    <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, opacity: 0.15, color: 'var(--amber)' }}>{card.icon}</div>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,168,0,0.45)', fontWeight: 700, marginBottom: 10 }}>{card.label}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
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
                        return DONUT_SEGMENTS.map((seg: typeof DONUT_SEGMENTS[0], i: number) => {
                          const dash = `${(seg.pct / 100) * C} ${C}`
                          const offset = -((cumPct / 100) * C)
                          cumPct += seg.pct
                          return (
                            <circle key={i} cx="68" cy="68" r={52} fill="none"
                              stroke={DONUT_COLORS[i]} strokeWidth="16"
                              strokeDasharray={dash} strokeDashoffset={offset}
                            />
                          )
                        })
                      })()}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em' }}>
                        {showBalance
                          ? activePeriod === 'month' ? '$3.1k' : activePeriod === '6months' ? '$20.4k' : '$41.5k'
                          : '••••'}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(245,168,0,0.4)', letterSpacing: '0.08em', marginTop: 3, textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
                    </div>
                  </div>
                  {DONUT_SEGMENTS.map((seg: typeof DONUT_SEGMENTS[0], i: number) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 0', fontSize: 12,
                      borderBottom: i < DONUT_SEGMENTS.length - 1 ? '1px solid rgba(245,168,0,0.08)' : 'none',
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div className="chart-title" style={{ margin: 0 }}>
                      {activePeriod === 'month' ? 'Weekly Income vs Spending' : 'Monthly Income vs Spending'}
                    </div>
                    {/* mini period indicator */}
                    <span style={{
                      fontSize: 10, fontFamily: "'Outfit',sans-serif", fontWeight: 600,
                      color: 'rgba(245,168,0,0.5)', background: 'rgba(245,168,0,0.08)',
                      border: '1px solid rgba(245,168,0,0.18)', borderRadius: 20,
                      padding: '3px 10px', letterSpacing: '0.06em',
                    }}>
                      {PERIOD_LABELS[activePeriod]}
                    </span>
                  </div>
                  <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 14, paddingBottom: 28, borderBottom: '2px solid rgba(245,168,0,0.1)', position: 'relative' }}>
                    {MONTHS.map((m: typeof MONTHS[0]) => (
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
                      style={{ fontSize: 12, color: 'var(--amber3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>
                      View all →
                    </button>
                  </div>
                  <table className="tx-table">
                    <thead><tr><th>Merchant</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead>
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
                  {INSIGHTS.map((item: typeof INSIGHTS[0], i: number) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: i < INSIGHTS.length - 1 ? '11px 0' : '11px 0 0',
                      borderBottom: i < INSIGHTS.length - 1 ? '1px solid rgba(245,168,0,0.07)' : 'none',
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

          {/* ════════ TRANSACTIONS ════════ */}
          {activeTab === 'transactions' && (
            <div>
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                resultCount={filteredTransactions.length}
                totalCount={TRANSACTIONS.length}
              />

              <div className="chart-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div className="chart-title" style={{ margin: 0 }}>
                    All Transactions
                    {filteredTransactions.length !== TRANSACTIONS.length && (
                      <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(245,168,0,0.4)', marginLeft: 10, fontFamily: "'Outfit',sans-serif" }}>
                        — {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button className="btn-secondary">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 2v9M4 8l4 4 4-4M2 14h12"/>
                    </svg>
                    Export CSV
                  </button>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(245,168,0,0.25)" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <div style={{ fontSize: 14, color: 'rgba(255,252,240,0.25)', marginTop: 12, fontFamily: "'Outfit',sans-serif" }}>
                      No transactions match your filters
                    </div>
                    <button
                      onClick={() => setFilters(defaultFilters)}
                      style={{ marginTop: 12, fontSize: 12, color: 'var(--amber)', background: 'none', border: '1px solid rgba(245,168,0,0.3)', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <table className="tx-table">
                    <thead>
                      <tr><th>Merchant</th><th>Category</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(tx => (
                        <tr key={tx.id} className="tx-row">
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,168,0,0.1)', border: '1.5px solid rgba(245,168,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{tx.icon}</div>
                              <span style={{ color: 'var(--white)', fontSize: 13 }}>{tx.name}</span>
                            </div>
                          </td>
                          <td><span className="tx-cat">{tx.category}</span></td>
                          <td style={{ fontSize: 11, color: 'rgba(245,168,0,0.38)' }}>{tx.date}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600, fontSize: 13.5, color: tx.amount > 0 ? 'var(--amber3)' : 'rgba(255,252,240,0.6)' }}>
                              {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                            <span style={{
                              fontSize: 10, padding: '2px 8px', borderRadius: 20, marginLeft: 6, fontWeight: 600,
                              background: tx.type === 'credit' ? 'rgba(80,220,120,0.12)' : 'rgba(245,168,0,0.1)',
                              color: tx.type === 'credit' ? '#6EE7A0' : 'var(--amber3)',
                            }}>
                              {tx.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Summary footer */}
                {filteredTransactions.length > 0 && hasActive && (
                  <div style={{
                    marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(245,168,0,0.1)',
                    display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 12,
                  }}>
                    {(() => {
                      const net = filteredTransactions.reduce((s, t) => s + t.amount, 0)
                      const out = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0))
                      const ins = filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
                      return <>
                        <span style={{ color: 'rgba(245,168,0,0.4)' }}>Net: <span style={{ fontWeight: 700, color: net >= 0 ? 'var(--amber3)' : 'rgba(255,100,100,0.8)' }}>{net >= 0 ? '+' : ''}${Math.abs(net).toFixed(2)}</span></span>
                        <span style={{ color: 'rgba(245,168,0,0.4)' }}>Total out: <span style={{ fontWeight: 700, color: 'rgba(255,252,240,0.6)' }}>${out.toFixed(2)}</span></span>
                        <span style={{ color: 'rgba(245,168,0,0.4)' }}>Total in: <span style={{ fontWeight: 700, color: 'var(--amber3)' }}>+${ins.toFixed(2)}</span></span>
                      </>
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}