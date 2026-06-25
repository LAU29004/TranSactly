'use client'
import { ApiError } from '../types/Api.types'

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

interface LoadingStateProps {
  /** Number of skeleton card rows to render. Defaults to 4. */
  rows?: number
  label?: string
}

export function LoadingState({ rows = 4, label = 'Loading…' }: LoadingStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 6,
      }}>
        {/* Animated spinner */}
        <svg
          width="16" height="16" viewBox="0 0 16 16"
          style={{ animation: 'ls-spin 0.8s linear infinite', flexShrink: 0 }}
        >
          <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,252,240,0.2)" strokeWidth="2" />
          <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="#FFFCF0" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{
          fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 600,
          color: 'rgba(245,168,0,0.45)', letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} opacity={1 - i * 0.15} />
      ))}
    </div>
  )
}

function SkeletonRow({ opacity = 1 }: { opacity?: number }) {
  return (
    <div style={{
      height: 60, borderRadius: 12,
      background: 'rgba(245,168,0,0.06)',
      border: '1.5px solid rgba(245,168,0,0.1)',
      overflow: 'hidden',
      opacity,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(245,168,0,0.06) 50%, transparent 100%)',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  error:    ApiError
  onRetry?: () => void
  label?:   string
}

export function ErrorState({ error, onRetry, label = 'Failed to load data' }: ErrorStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 14, padding: '48px 24px',
      border: '1.5px solid rgba(248,113,113,0.2)',
      borderRadius: 14,
      background: 'rgba(248,113,113,0.04)',
    }}>
      {/* Error icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(248,113,113,0.1)',
        border: '2px solid black',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round">
          <path d="M8 1.5l6.5 11.5h-13L8 1.5z" strokeLinejoin="round" />
          <path d="M8 6.5v3" />
          <circle cx="8" cy="11.5" r="0.6" fill="#F87171" stroke="none" />
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800,
          color: '#FFFCF0', letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 13, color: 'white', fontWeight: 'bolder',
          fontFamily: "'Outfit',sans-serif", lineHeight: 1.5,
        }}>
          {error.status > 0 ? `Error ${error.status} — ` : ''}{error.message}
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif", fontSize: 12.5, fontWeight: 700,
            background: 'rgba(248,113,113,0.1)',
            border: '1.5px solid black',
            color: 'white', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.18)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.1)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c2 0 3.7.9 4.8 2.3M14 2v4h-4" />
          </svg>
          Retry
        </button>
      )}
    </div>
  )
}

// ─── INLINE LOADING DOTS (for mutation feedback) ──────────────────────────────

export function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 4, height: 4, borderRadius: '50%',
            background: 'rgba(245,168,0,0.6)',
            display: 'inline-block',
            animation: `ld-bounce 0.9s ${i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ld-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  )
}