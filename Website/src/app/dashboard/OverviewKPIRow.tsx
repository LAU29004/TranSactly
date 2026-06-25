'use client'
import styles from '../dashboard/Dashboard.module.css'
import { useOverviewKPI } from '../../hooks/useServices'
import { LoadingState, ErrorState } from '../../components/LoadingState'
import { Period } from '../../types/Api.types'

// Fallback static data while the API is not yet wired (remove once live)
const FALLBACK_KPI = [
  { label: 'Transactions Processed', value: '1,284', sub: '↑ 8.2% vs last month', subType: 'up'  as const, icon: '⚡' },
  { label: 'Savings Rate',           value: '41%',   sub: '↑ 3.5pts this month',  subType: 'up'  as const, icon: '◉' },
  { label: 'AI Accuracy',            value: '94.6%', sub: '↑ 1.2% improvement',   subType: 'up'  as const, icon: '✦' },
  { label: 'Active Subscriptions',   value: '4',     sub: '$63.96/mo total',       subType: 'gold'as const, icon: '◈' },
]

interface OverviewKPIRowProps {
  period: Period
}

export default function OverviewKPIRow({
  period,
}: OverviewKPIRowProps) {
  const { data, loading, error, refetch } = useOverviewKPI(period)

  if (loading) {
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles['stat-card']} style={{ minHeight: 90 }}>
              <div style={{
                height: 10, borderRadius: 5, width: '55%',
                background: 'rgba(245,168,0,0.1)',
                marginBottom: 14,
                animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
              }} />
              <div style={{
                height: 24, borderRadius: 6, width: '70%',
                background: 'rgba(245,168,0,0.08)',
              }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ marginBottom: 24 }}>
        <ErrorState error={error} onRetry={refetch} label="Could not load KPI data" />
      </div>
    )
  }

  const kpis = data?.kpis ?? FALLBACK_KPI

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 24 }}>
      {kpis.map((card, i) => (
        <div key={i} className={styles['stat-card']}>
          <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, opacity: 0.15, color: 'var(--amber)' }}>
            {card.icon}
          </div>
          <div style={{
            fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(245,168,0,0.45)', fontWeight: 700, marginBottom: 10,
          }}>
            {card.label}
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800,
            color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-0.03em',
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,252,240,0.35)', marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {card.subType === 'up'   && <span className={styles['pill-up']}>  {card.sub.split(' ')[0]}</span>}
            {card.subType === 'down' && <span className={styles['pill-down']}>{card.sub.split(' ')[0]}</span>}
            <span style={{ color: card.subType === 'gold' ? 'var(--amber3)' : undefined, fontSize: 10.5 }}>
              {card.subType === 'up' || card.subType === 'down'
                ? card.sub.slice(card.sub.indexOf(' ') + 1)
                : card.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}