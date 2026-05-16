import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,160,0.06) 0%, transparent 80%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0,229,160,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)' }} />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-16 group">
        <div className="w-8 h-8 rounded-lg bg-[#00E5A0] flex items-center justify-center shadow-lg shadow-[#00E5A0]/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0A0F0D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-lg font-display">Finorio</span>
      </Link>

      {/* 404 display */}
      <div className="relative mb-6">
        <p className="font-display text-[120px] md:text-[180px] text-[#1E2B24] leading-none select-none font-bold" style={{ WebkitTextStroke: '1px #1E2B24' }}>
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#00E5A0]/10 border border-[#00E5A0]/20 flex items-center justify-center text-3xl animate-float">
            🔍
          </div>
        </div>
      </div>

      <h1 className="font-display text-3xl md:text-4xl text-white mb-3">
        Page not{' '}
        <span className="text-[#00E5A0] italic">found</span>
      </h1>
      <p className="text-[#B8CEC4] max-w-sm leading-relaxed mb-8">
        The page you are looking for does not exist or has been moved. Let us get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/" className="flex items-center gap-2 bg-[#00E5A0] text-[#0A0F0D] font-semibold px-6 py-3 rounded-full hover:bg-[#00ffc0] transition-all shadow-lg shadow-[#00E5A0]/25">
          ← Back to Home
        </Link>
        <Link href="/contact" className="flex items-center gap-2 border border-[#1E2B24] text-white font-semibold px-6 py-3 rounded-full hover:border-[#00E5A0]/40 transition-all">
          Contact Support
        </Link>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
        {[
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Blog', href: '/blog' },
          { label: 'Dashboard', href: '/dashboard' },
        ].map((l) => (
          <Link key={l.label} href={l.href} className="text-sm text-[#4A5E54] hover:text-[#00E5A0] transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
