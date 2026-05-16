const stats = [
  { value: '500K+', label: 'Downloads on App Store' },
  { value: '4.8★', label: 'Rating out of 5' },
  { value: '$2B+', label: 'Transactions Processed' },
  { value: '150+', label: 'Countries Supported' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7', label: 'Customer Support' },
]

export default function StatsBar() {
  const doubled = [...stats, ...stats]

  return (
    <section className="py-12 border-y border-[#1E2B24] overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0F0D] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0F0D] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((stat, i) => (
          <div key={i} className="inline-flex items-center gap-8 mx-12 flex-shrink-0">
            <div className="text-center">
              <p className="font-display text-3xl text-white">{stat.value}</p>
              <p className="text-xs text-[#4A5E54] mt-1 uppercase tracking-widest">{stat.label}</p>
            </div>
            <div className="w-px h-10 bg-[#1E2B24]" />
          </div>
        ))}
      </div>
    </section>
  )
}
