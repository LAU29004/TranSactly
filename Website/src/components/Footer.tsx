const links: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Download App', href: '#' },
  ],
  Company: [
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
}

export default function Footer() {
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

        .footer {
          background: var(--navy);
          border-top: 3px solid var(--ink);
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
          position: relative;
          overflow: hidden;
        }

        /* Subtle halftone on dark — navy-on-navy tint */
        .footer-dot-field {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(245,168,0,0.06) 1.3px, transparent 1.3px);
          background-size: 20px 20px;
        }

        .footer-inner {
          position: relative; z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 24px 36px;
        }

        /* ─── MAIN GRID ─── */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        @media (max-width: 860px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-brand { grid-column: auto; }
        }

        /* ─── BRAND ─── */
        .footer-brand {}

        .footer-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          margin-bottom: 16px;
        }
        .footer-logo-icon {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: var(--amber);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 3px 3px 0 var(--ink);
          flex-shrink: 0;
        }
        .footer-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px;
          color: var(--white);
          letter-spacing: -0.04em;
        }
        .footer-logo-dot { color: var(--amber); }

        .footer-tagline {
          font-size: 13px; font-weight: 300; line-height: 1.75;
          color: rgba(255,252,240,0.38);
          max-width: 280px;
          margin-bottom: 24px;
        }

        /* Download buttons */
        .footer-dl-row { display: flex; gap: 10px; flex-wrap: wrap; }

        .footer-dl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,168,0,0.08);
          border: 1.5px solid rgba(245,168,0,0.22);
          color: rgba(255,252,240,0.75);
          font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 600;
          padding: 9px 16px;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 3px 3px 0 var(--ink);
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.18s;
        }
        .footer-dl-btn:hover {
          border-color: rgba(245,168,0,0.55);
          color: var(--amber);
          background: rgba(245,168,0,0.12);
          transform: translate(-2px,-2px);
          box-shadow: 5px 5px 0 var(--ink);
        }

        /* ─── LINK COLUMNS ─── */
        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 18px;
        }

        .footer-link-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 12px;
        }

        .footer-link {
          font-size: 13px; font-weight: 400;
          color: rgba(255,252,240,0.4);
          text-decoration: none;
          transition: color 0.18s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .footer-link::before {
          content: '';
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(245,168,0,0.3);
          flex-shrink: 0;
          transition: background 0.18s;
        }
        .footer-link:hover { color: var(--amber3); }
        .footer-link:hover::before { background: var(--amber3); }

        /* ─── BOTTOM BAR ─── */
        .footer-bottom {
          border-top: 1.5px solid rgba(245,168,0,0.12);
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-copy {
          font-size: 12px; font-weight: 400;
          color: rgba(255,252,240,0.28);
          letter-spacing: 0.02em;
        }
        .footer-copy strong {
          color: rgba(245,168,0,0.5);
          font-weight: 600;
        }

        .footer-socials {
          display: flex; gap: 10px;
        }
        .footer-social-btn {
          width: 32px; height: 32px;
          border-radius: 6px;
          border: 1.5px solid rgba(245,168,0,0.18);
          background: rgba(245,168,0,0.06);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none;
          color: rgba(255,252,240,0.4);
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.18s;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .footer-social-btn:hover {
          border-color: rgba(245,168,0,0.5);
          color: var(--amber);
          background: rgba(245,168,0,0.12);
          transform: translate(-1px,-1px);
        }
      `}</style>

      <footer className="footer">
        <div className="footer-dot-field" />

        <div className="footer-inner">
          <div className="footer-grid">

            {/* ── Brand ── */}
            <div className="footer-brand">
              <a href="#" className="footer-logo">
                <div className="footer-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="#1A1033" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="footer-logo-name">
                  fin<span className="footer-logo-dot">orio</span>
                </span>
              </a>

              <p className="footer-tagline">
                Download our finance app and track your finances effortlessly.
                Smart, secure, and beautifully designed.
              </p>

              <div className="footer-dl-row">
<a href="#" className="footer-dl-btn">
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 3h2v2h-2v-2zm-6-3h2v5h-2v-5z" />
  </svg>

  Go To QR
</a>
              </div>
            </div>

            {/* ── Link columns ── */}
            {Object.entries(links).map(([section, items]) => (
              <div key={section}>
                <h4 className="footer-col-title">{section}</h4>
                <ul className="footer-link-list">
                  {items.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="footer-link">{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          {/* ── Bottom bar ── */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} <strong>Finorio</strong>. All rights reserved.
            </p>

            <div className="footer-socials">
              {/* Twitter / X */}
              <a href="#" className="footer-social-btn" aria-label="Twitter">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="footer-social-btn" aria-label="LinkedIn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="footer-social-btn" aria-label="Instagram">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}