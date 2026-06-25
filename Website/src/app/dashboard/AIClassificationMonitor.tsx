'use client'
import styles from './Dashboard.module.css'
import { useApi } from '../../hooks/useApi'
import { analyticsService } from '../../services/analyticsService'
import { TrendDirection, ClassificationSourceMetric } from '../../types/Api.types'
import { LoadingState, ErrorState } from '../../components/LoadingState'
import { Period } from '../../types/Api.types'
const SOURCE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'Keyword Rule':     { color: '#FFD166', bg: 'rgba(255,209,102,0.10)', border: 'rgba(255,209,102,0.25)' },
  'Merchant Prior':   { color: '#F5A800', bg: 'rgba(245,168,0,0.12)',   border: 'rgba(245,168,0,0.28)' },
  'Database Memory':  { color: '#8B6CD6', bg: 'rgba(139,108,214,0.12)', border: 'rgba(139,108,214,0.28)' },
  'Semantic AI':       { color: '#6EE7A0', bg: 'rgba(110,231,160,0.10)', border: 'rgba(110,231,160,0.25)' },
}
const FALLBACK_COLOR = { color: '#F5A800', bg: 'rgba(245,168,0,0.12)', border: 'rgba(245,168,0,0.28)' }

function TrendIndicator({ direction, value }: { direction: TrendDirection; value: string }) {
  const color = direction === 'up' ? '#6EE7A0' : direction === 'down' ? '#F87171' : 'rgba(255,252,240,0.35)'
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10.5, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
      color,
    }}>
      {arrow} {value}
    </span>
  )
}

function MetricRow({ metric }: { metric: ClassificationSourceMetric }) {
  const meta = SOURCE_COLORS[metric.label] ?? FALLBACK_COLOR
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0,
          }} />
          <span style={{ fontSize: 12.5, color: 'rgba(255,252,240,0.55)', fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>
            {metric.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TrendIndicator direction={metric.trend.direction} value={metric.trend.value} />
          <span style={{
            fontFamily: "'Syne',sans-serif", fontSize: 13.5, fontWeight: 800,
            color: 'var(--white)', minWidth: 38, textAlign: 'right',
          }}>
            {metric.pct}%
          </span>
        </div>
      </div>

      <div style={{
        height: 8, borderRadius: 5, background: 'rgba(245,168,0,0.07)',
        border: `1px solid ${meta.border}`, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${metric.pct}%`, borderRadius: 5,
          background: meta.color, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

export default function AIClassificationMonitor(period:Period) {
  const { data, loading, error, refetch } = useApi(
    () => analyticsService.getAIClassification(period),
    [],
  )

  const headerBlock = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div className={styles['chart-title']} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        AI Classification Monitor
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#1A1033', background: '#F5A800', borderRadius: 20,
          padding: '2px 8px',
        }}>
          Live
        </span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className={styles['chart-card']}>
        {headerBlock}
        <LoadingState rows={5} label="Loading classification metrics…" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={styles['chart-card']}>
        {headerBlock}
        <ErrorState error={error ?? { message: 'No data returned.', status: 0 }} onRetry={refetch} label="Failed to load classification metrics" />
      </div>
    )
  }

  return (
    <div className={styles['chart-card']}>
      {headerBlock}

      {/* Transactions Processed — headline metric */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(245,168,0,0.05)', border: '1.5px solid rgba(245,168,0,0.18)',
        borderRadius: 10, padding: '14px 16px', marginBottom: 20,
      }}>
        <div>
          <div style={{
            fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(245,168,0,0.45)', fontWeight: 700, marginBottom: 6,
          }}>
            Transactions Processed
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800,
            color: 'var(--white)', letterSpacing: '-0.03em',
          }}>
            {data.transactionsProcessed.count.toLocaleString()}
          </div>
        </div>
        <TrendIndicator
          direction={data.transactionsProcessed.trend.direction}
          value={data.transactionsProcessed.trend.value}
        />
      </div>

      {/* Per-source breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.sources.map((metric, i) => (
          <MetricRow key={i} metric={metric} />
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(245,168,0,0.08)',
        fontSize: 11, color: 'rgba(245,168,0,0.35)', lineHeight: 1.5,
      }}>
        Classification sources are ranked by usage share across all processed transactions this period.
      </div>
    </div>
  )
}