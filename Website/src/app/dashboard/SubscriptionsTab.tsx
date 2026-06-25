'use client'
import styles from '../dashboard/Dashboard.module.css'
import { useSubscriptions } from '../../hooks/useServices'
import { LoadingState, ErrorState } from '../../components/LoadingState'
import { SubStatus , Subscription } from '../../types/Api.types'


// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_META: Record<SubStatus, { label: string; fg: string; bg: string; border: string }> = {
  active:   { label: 'Active',   fg: '#6EE7A0', bg: 'rgba(110,231,160,0.10)', border: 'rgba(110,231,160,0.25)' },
  due_soon: { label: 'Due Soon', fg: '#FFD166', bg: 'rgba(255,209,102,0.10)', border: 'rgba(255,209,102,0.25)' },
  overdue:  { label: 'Overdue',  fg: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)' },
}

function StatusBadge({ status }: { status: SubStatus }) {
  const meta = STATUS_META[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
      color: meta.fg, background: meta.bg,
      border: `1px solid ${meta.border}`, borderRadius: 20,
      padding: '3px 10px', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.fg }} />
      {meta.label}
    </span>
  )
}

// ─── SUBSCRIPTION CARD ────────────────────────────────────────────────────────

function SubscriptionCard({ sub }: { sub: Subscription }) {
  
  return (
    <div className={styles['stat-card']}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: sub.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
            border: '2px solid #0E0920',
          }}>
            {sub.icon}
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800,
            color: 'var(--white)', letterSpacing: '-0.01em',
          }}>
            {sub.name}
          </div>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10.5, color: 'rgba(245,168,0,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            Amount
          </span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--amber3)' }}>
            ${sub.monthlyCost.toFixed(2)}<span style={{ fontSize: 11, color: 'rgba(255,252,240,0.3)', fontWeight: 500 }}>/mo</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10.5, color: 'rgba(245,168,0,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            Renewal Date
          </span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,252,240,0.6)', fontWeight: 600 }}>
            {sub.renewalDate}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── SUBSCRIPTIONS TAB ────────────────────────────────────────────────────────

export default function SubscriptionsTab() {
  const { data, loading, error, refetch } = useSubscriptions()
  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginBottom: 24 }}>
          {[0, 1].map((i) => (
            <div key={i} className={styles['stat-card']} style={{ minHeight: 100 }}>
              <LoadingState rows={2} label="Loading subscriptions…" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} label="Could not load subscriptions" />
  }

  if (!data) return null

  const { subscriptions, monthlyTotal, yearlyTotal } = data
  if (subscriptions.length === 0) {
  return (
    <div
      className={styles['stat-card']}
      style={{
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 54, marginBottom: 16 }}>
        
      </div>

      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: 'var(--white)',
          marginBottom: 10,
        }}
      >
        No Subscriptions Detected
      </div>

      <div
        style={{
          maxWidth: 420,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'rgba(255,252,240,0.55)',
        }}
      >
        centfluence automatically detects recurring payments
        such as OTT Platforms and other subscriptions from your transaction history.
      </div>
    </div>
  )
}

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginBottom: 24 }}>
        <div className={styles['stat-card']}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,168,0,0.45)', fontWeight: 700, marginBottom: 10 }}>
            Monthly Cost
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em' }}>
            ${monthlyTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,252,240,0.35)', marginTop: 8 }}>
            Across {subscriptions.length} active subscriptions
          </div>
        </div>

        <div className={styles['stat-card']}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,168,0,0.45)', fontWeight: 700, marginBottom: 10 }}>
            Yearly Cost
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--amber3)', letterSpacing: '-0.03em' }}>
            ${yearlyTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,252,240,0.35)', marginTop: 8 }}>
            Projected annual spend
          </div>
        </div>
      </div>

      {/* Subscription cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
        {subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} sub={sub} />
        ))}
      </div>
    </div>
  )
}