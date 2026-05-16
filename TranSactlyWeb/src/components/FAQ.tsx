'use client'
import { useState } from 'react'

const faqs = [
  {
    q: 'What is Finorio?',
    a: 'Finorio is a powerful personal finance app that helps you track spending, manage cards, send payments, and gain insights into your financial habits — all in one beautifully designed interface.',
  },
  {
    q: 'Do I need to code to use it?',
    a: "Not at all. Finorio is built for everyone. The interface is intuitive and requires zero technical knowledge to get started. Simply download, connect your accounts, and you're ready to go.",
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes! Enterprise plan users can white-label the app and connect custom domains for their teams or organizations.',
  },
  {
    q: 'How secure is Finorio?',
    a: 'Security is our top priority. We use 256-bit AES encryption, two-factor authentication, and bank-grade security protocols to ensure your financial data is always protected.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Absolutely. Our Free plan includes a dashboard, basic statistics, QR payments, and 1 card storage — with no credit card required to get started.',
  },
  {
    q: 'Can I export my financial data?',
    a: 'Yes, Enterprise plan users can export reports in CSV, PDF, and Excel formats for full financial transparency and integration with accounting tools.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <style>{`
        /* ─── TOKENS (mirrored from Hero) ─── */
        :root {
          --amber  : #F5A800;
          --amber2 : #E09700;
          --amber3 : #FFD166;
          --navy   : #1A1033;
          --navy2  : #2C1D55;
          --ink    : #0E0920;
          --white  : #FFFCF0;
        }

        .faq-section {
          background: var(--amber);
          position: relative;
          overflow: hidden;
          padding: 96px 24px 120px;
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Halftone dot field — matches Hero */
        .faq-dot-field {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(26,16,51,0.22) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        .faq-inner {
          position: relative; z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }

        /* ─── HEADER ─── */
        .faq-header {
          text-align: center;
          margin-bottom: 52px;
        }

        .faq-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--navy);
          color: var(--amber3);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 7px 14px 7px 10px;
          border-radius: 4px;
          margin-bottom: 28px;
        }
        .faq-badge-pip {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--amber3);
          animation: faqblink 2s ease-in-out infinite;
        }
        @keyframes faqblink {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }

        .faq-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 3.8vw, 52px);
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: rgba(255,255,255,0.68);
          margin-bottom: 16px;
        }
        .faq-heading-accent {
          position: relative;
          display: inline-block;
          padding-bottom: 8px;
        }
        .faq-heading-accent::after {
          content: '';
          position: absolute; left: 0; bottom: 0;
          width: 70%; height: 4px;
          background: var(--ink);
          border-radius: 3px;
        }

        .faq-sub {
          font-size: 15px; font-weight: 300; line-height: 1.7;
          color: rgba(255,255,255,0.62);
        }

        .faq-rule {
          width: 72px; height: 5px;
          background: var(--ink);
          border-radius: 3px;
          margin: 0 auto 52px;
        }

        /* ─── ACCORDION ─── */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: var(--navy);
          border: 2px solid rgba(245,168,0,0.18);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 4px 4px 0 var(--ink);
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .faq-item.is-open {
          border-color: rgba(245,168,0,0.45);
          box-shadow: 6px 6px 0 var(--ink);
        }
        .faq-item:hover:not(.is-open) {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 var(--ink);
        }

        .faq-trigger {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          text-align: left;
        }

        .faq-question {
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          color: rgba(255,252,240,0.75);
          transition: color 0.2s;
          line-height: 1.4;
        }
        .faq-item.is-open .faq-question,
        .faq-trigger:hover .faq-question {
          color: var(--amber);
        }

        .faq-icon {
          width: 28px; height: 28px; flex-shrink: 0;
          border-radius: 50%;
          border: 2px solid rgba(245,168,0,0.2);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, border-color 0.2s, transform 0.3s ease;
        }
        .faq-item.is-open .faq-icon {
          background: rgba(245,168,0,0.15);
          border-color: rgba(245,168,0,0.5);
          transform: rotate(45deg);
        }
        .faq-trigger:hover .faq-icon {
          border-color: rgba(245,168,0,0.4);
        }

        .faq-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.32s ease;
        }
        .faq-item.is-open .faq-body {
          max-height: 200px;
        }

        .faq-answer {
          padding: 0 22px 20px;
          font-size: 13px; font-weight: 300; line-height: 1.8;
          color: rgba(255,252,240,0.55);
        }
      `}</style>

      <section id="faq" className="faq-section">
        <div className="faq-dot-field" />

        <div className="faq-inner">

          {/* Header */}
          <div className="faq-header">
            <div className="faq-badge">
              <span className="faq-badge-pip" />
              FAQ
            </div>

            <h2 className="faq-heading">
              Frequently asked{' '}
              <span className="faq-heading-accent">questions</span>
            </h2>

            <div className="faq-rule" />

            <p className="faq-sub">Everything you need to know about Finorio.</p>
          </div>

          {/* Accordion */}
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item${open === i ? ' is-open' : ''}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="faq-question">{faq.q}</span>
                  <div className="faq-icon">
                    <svg viewBox="0 0 12 12" fill="none" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 2v8M2 6h8"
                        stroke={open === i ? '#F5A800' : 'rgba(245,168,0,0.45)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>

                <div className="faq-body">
                  <p className="faq-answer">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}