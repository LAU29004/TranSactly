'use client'
import { useRouter } from 'next/navigation'

interface Props {
  prompt?: string
}

export default function AIAssistantTrigger({
  prompt,
}: Props) {

  const router = useRouter()

  const handleClick = () => {

    if (prompt) {

      router.push(
        `/dashboard/assistant?prompt=${encodeURIComponent(prompt)}`
      )

      return
    }

    router.push('/dashboard/assistant')
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'rgba(245,168,0,0.08)',
        border: '1.5px solid rgba(245,168,0,0.22)',
        borderRadius: 8,
        color: '#1A1033',
        fontSize: 12.5,
        fontFamily: "'Outfit',sans-serif",
        fontWeight: 600,
        padding: '8px 14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background =
          'rgba(245,168,0,0.16)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background =
          'rgba(245,168,0,0.08)'
      }}
    >
      <span style={{ fontSize: 13 }}>✦</span>
      AI Assistant
    </button>
  )
}