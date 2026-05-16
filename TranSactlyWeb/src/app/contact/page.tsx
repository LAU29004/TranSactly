'use client'
import { useState } from 'react'

const contactLinks = [
  { icon: '✉️', label: 'Email us', value: 'hello@finorio.app', sub: 'We reply within 24 hours' },
  { icon: '💬', label: 'Live chat', value: 'Start a conversation', sub: 'Available Mon–Fri, 9am–6pm' },
  { icon: '📖', label: 'Help center', value: 'docs.finorio.app', sub: 'Browse 200+ articles' },
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-[#0A0F0D]">

      <section className="pt-36 pb-24 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-new inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5">Contact</span>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            We&apos;d love to{' '}
            <span className="text-[#00E5A0] italic">hear from you</span>
          </h1>
          <p className="text-[#B8CEC4] max-w-md mx-auto leading-relaxed">
            Have a question, feature idea, or just want to say hello? Drop us a message.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          {/* Contact links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {contactLinks.map((c) => (
              <div key={c.label} className="feature-card bg-[#111713] rounded-2xl p-5 flex items-start gap-4">
                <div className="text-2xl mt-0.5">{c.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-[#00E5A0] uppercase tracking-widest mb-1">{c.label}</p>
                  <p className="text-white font-medium text-sm">{c.value}</p>
                  <p className="text-[#4A5E54] text-xs mt-1">{c.sub}</p>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-2xl overflow-hidden border border-[#1E2B24]" style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.08) 0%, rgba(0,229,160,0.02) 100%)' }}>
              <div className="p-6">
                <p className="text-white font-semibold mb-2">Response time</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse" />
                  <p className="text-[#B8CEC4] text-sm">Average: <span className="text-[#00E5A0] font-semibold">under 4 hours</span></p>
                </div>
                <p className="text-[#4A5E54] text-xs mt-2">Our team is distributed across timezones to serve you faster.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 feature-card bg-[#111713] rounded-2xl p-8">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="font-display text-2xl text-white mb-3">Message sent!</h2>
                <p className="text-[#B8CEC4] max-w-sm">
                  Thanks for reaching out. We will get back to you at <span className="text-[#00E5A0]">{form.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="mt-6 text-sm text-[#00E5A0] underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#111713] rounded-2xl p-8 border border-[#1E2B24] space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Your name', key: 'name', type: 'text', placeholder: 'Alex Morgan' },
                    { label: 'Email address', key: 'email', type: 'email', placeholder: 'alex@example.com' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-[#B8CEC4] mb-2 uppercase tracking-wide">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        required
                        className="w-full bg-[#0A0F0D] border border-[#1E2B24] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4A5E54] focus:outline-none focus:border-[#00E5A0]/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8CEC4] mb-2 uppercase tracking-wide">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full bg-[#0A0F0D] border border-[#1E2B24] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5A0]/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#0A0F0D]">Select a topic…</option>
                    <option value="general" className="bg-[#0A0F0D]">General enquiry</option>
                    <option value="billing" className="bg-[#0A0F0D]">Billing & subscriptions</option>
                    <option value="feature" className="bg-[#0A0F0D]">Feature request</option>
                    <option value="bug" className="bg-[#0A0F0D]">Bug report</option>
                    <option value="enterprise" className="bg-[#0A0F0D]">Enterprise sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8CEC4] mb-2 uppercase tracking-wide">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="w-full bg-[#0A0F0D] border border-[#1E2B24] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4A5E54] focus:outline-none focus:border-[#00E5A0]/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00E5A0] text-[#0A0F0D] font-semibold py-3.5 rounded-full hover:bg-[#00ffc0] transition-all shadow-lg shadow-[#00E5A0]/25 hover:shadow-[#00E5A0]/40"
                >
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
