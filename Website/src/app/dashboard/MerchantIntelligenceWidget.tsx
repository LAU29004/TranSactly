'use client'
import { useState, useMemo } from 'react'
import styles from './Dashboard.module.css'
import { useApi } from '../../hooks/useApi'
import { analyticsService } from '../../services/analyticsService'
import { MerchantClassificationSource } from '../../types/Api.types'
import { LoadingState, ErrorState } from '../../components/LoadingState'
import { Period } from '../../types/Api.types'
const SOURCE_META: Record<MerchantClassificationSource, { label: string; fg: string; bg: string; border: string }> = {
  merchant_prior:   { label: 'Merchant Prior',   fg: '#F5A800', bg: 'rgba(245,168,0,0.12)',   border: 'rgba(245,168,0,0.28)' },
  keyword_rule:     { label: 'Keyword Rule',     fg: '#FFD166', bg: 'rgba(255,209,102,0.10)', border: 'rgba(255,209,102,0.25)' },
  database_memory:  { label: 'Database Memory',  fg: '#8B6CD6', bg: 'rgba(139,108,214,0.12)', border: 'rgba(139,108,214,0.28)' },
  semantic_ai:      { label: 'Semantic AI',      fg: '#6EE7A0', bg: 'rgba(110,231,160,0.10)', border: 'rgba(110,231,160,0.25)' },
}

function SourceBadge({ source }: { source: MerchantClassificationSource }) {
  const meta = SOURCE_META[source]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10.5, fontWeight: 600, fontFamily: "'Outfit',sans-serif",
      color: meta.fg, background: meta.bg,
      border: `1px solid ${meta.border}`, borderRadius: 6,
      padding: '3px 9px', whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85 ? '#6EE7A0' : value >= 65 ? '#F5A800' : '#F87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'rgba(245,168,0,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, borderRadius: 4,
          background: color, transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color, fontFamily: "'Outfit',sans-serif", minWidth: 30 }}>
        {value}%
      </span>
    </div>
  )
}

export default function MerchantIntelligenceWidget(period:Period) {
  const [query, setQuery] = useState('')

  const { data, loading, error, refetch } = useApi(
    () => analyticsService.getMerchantIntelligence(period),
    [],
  )

  const merchants = data?.merchants ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return merchants
    return merchants.filter(row =>
      row.merchant.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q) ||
      SOURCE_META[row.source].label.toLowerCase().includes(q)
    )
  }, [query, merchants])

  if (loading) {
    return (
      <div className={styles['chart-card']}>
        <div className={styles['chart-title']} style={{ marginBottom: 16 }}>
          Merchant Intelligence
        </div>
        <LoadingState rows={5} label="Loading merchant intelligence…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles['chart-card']}>
        <div className={styles['chart-title']} style={{ marginBottom: 16 }}>
          Merchant Intelligence
        </div>
        <ErrorState error={error} onRetry={refetch} label="Failed to load merchant intelligence" />
      </div>
    )
  }

  return (
    <div className={styles['chart-card']}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <div className={styles['chart-title']} style={{ margin: 0 }}>
          Merchant Intelligence
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', minWidth: 220 }}>
          <svg
            width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(245,168,0,0.4)" strokeWidth="1.6"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search merchant, category, source…"
            style={{
              width: '100%',
              background: 'rgba(245,168,0,0.06)',
              border: '1.5px solid rgba(245,168,0,0.22)',
              borderRadius: 8, color: '#FFFCF0', fontSize: 12,
              fontFamily: "'Outfit',sans-serif", padding: '8px 12px 8px 32px',
              outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(245,168,0,0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(245,168,0,0.22)' }}
          />
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(245,168,0,0.4)', marginBottom: 12 }}>
        {filtered.length} of {merchants.length} merchants
      </div>

      {filtered.length === 0 ? (
        <div className={styles['empty-state']}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(245,168,0,0.25)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <div style={{ fontSize: 13, color: 'rgba(255,252,240,0.25)', marginTop: 12, fontFamily: "'Outfit',sans-serif" }}>
            No merchants match "{query}"
          </div>
          <button
            onClick={() => setQuery('')}
            style={{
              marginTop: 12, fontSize: 12, color: 'var(--amber)', background: 'none',
              border: '1px solid rgba(245,168,0,0.3)', borderRadius: 7,
              padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
            }}>
            Clear search
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles['tx-table']}>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Confidence</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className={styles['tx-row']}>
                  <td>
                    <span style={{ color: 'var(--white)', fontSize: 13 }}>{row.merchant}</span>
                  </td>
                  <td>
                    <span className={styles['tx-cat']}>{row.category}</span>
                  </td>
                  <td>
                    <ConfidenceBar value={row.confidence} />
                  </td>
                  <td>
                    <SourceBadge source={row.source} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}