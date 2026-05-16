'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const navLinks = [
  { label: 'Features',     href: '/features' },
  { label: 'Pricing',      href: '/pricing' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact',      href: '/contact' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        :root {
          --amber  : #F5A800;
          --amber2 : #E09700;
          --amber3 : #FFD166;
          --navy   : #1A1033;
          --ink    : #0E0920;
        }

        /* ── NAV BASE ── */
        .fnav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          font-family: 'Outfit', sans-serif;
          transition: all 0.4s ease;
        }

        /* default — sits on amber hero */
        .fnav-default {
          background: var(--amber);
          border-bottom: 2px solid rgba(26,16,51,0.14);
          padding: 0 64px; height: 68px;
        }

        /* scrolled — navy bar */
        .fnav-scrolled {
          background: var(--navy);
          border-bottom: 2px solid rgba(245,168,0,0.22);
          padding: 0 64px; height: 60px;
          box-shadow: 0 4px 24px rgba(14,9,32,0.35);
        }

        .fnav-inner {
          max-width: 1280px; margin: 0 auto;
          height: 100%;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* ── LOGO ── */
        .fnav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .fnav-logo-mark {
          width: 34px; height: 34px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          transition: transform .2s;
        }
        /* default: navy mark on amber bg */
        .fnav-default .fnav-logo-mark {
          background: var(--navy);
          border: 2px solid var(--navy);
        }
        /* scrolled: amber mark on navy bg */
        .fnav-scrolled .fnav-logo-mark {
          background: var(--amber);
          border: 2px solid var(--amber);
        }
        .fnav-logo:hover .fnav-logo-mark { transform: rotate(-6deg) scale(1.06); }

        .fnav-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px;
          letter-spacing: -0.04em;
          transition: color .3s;
        }
        .fnav-default  .fnav-logo-text { color: var(--navy); }
        .fnav-scrolled .fnav-logo-text { color: var(--amber); }

        /* ── DESKTOP LINKS ── */
        .fnav-links {
          display: flex; align-items: center; gap: 36px;
          list-style: none;
        }
        .fnav-links a {
          font-size: 14px; font-weight: 500;
          text-decoration: none;
          position: relative;
          transition: opacity .2s;
        }
        .fnav-default  .fnav-links a { color: var(--navy); opacity: 0.65; }
        .fnav-scrolled .fnav-links a { color: var(--amber); opacity: 0.70; }
        .fnav-links a:hover { opacity: 1 !important; }

        /* animated underline on hover */
        .fnav-links a::after {
          content: '';
          position: absolute; left: 0; bottom: -3px;
          width: 0; height: 2px; border-radius: 2px;
          transition: width .25s ease;
        }
        .fnav-default  .fnav-links a::after { background: var(--navy); }
        .fnav-scrolled .fnav-links a::after { background: var(--amber); }
        .fnav-links a:hover::after { width: 100%; }

        /* ── CTA GROUP ── */
        .fnav-cta { display: flex; align-items: center; gap: 8px; }

        .fnav-login {
          font-size: 13px; font-weight: 500;
          text-decoration: none;
          padding: 9px 16px; border-radius: 6px;
          transition: background .2s, color .2s;
        }
        .fnav-default  .fnav-login { color: var(--navy); }
        .fnav-scrolled .fnav-login { color: rgba(245,168,0,0.72); }
        .fnav-default  .fnav-login:hover { background: rgba(26,16,51,0.08); color: var(--navy); }
        .fnav-scrolled .fnav-login:hover { background: rgba(245,168,0,0.08); color: var(--amber); }

        .fnav-download {
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.01em;
          text-decoration: none;
          padding: 10px 22px; border-radius: 6px;
          transition: background .2s, color .2s, transform .15s;
          border: 2px solid transparent;
        }
        /* default: navy pill with amber text */
        .fnav-default .fnav-download {
          background: var(--navy); color: var(--amber);
          border-color: var(--navy);
        }
        .fnav-default .fnav-download:hover {
          background: var(--ink); border-color: var(--ink);
          transform: translateY(-1px);
        }
        /* scrolled: amber pill with navy text */
        .fnav-scrolled .fnav-download {
          background: var(--amber); color: var(--navy);
          border-color: var(--amber);
        }
        .fnav-scrolled .fnav-download:hover {
          background: var(--amber3); border-color: var(--amber3);
          transform: translateY(-1px);
        }

        /* ── HAMBURGER ── */
        .fnav-ham {
          display: none;
          flex-direction: column; justify-content: center; align-items: center;
          gap: 5px;
          background: none; border: none; cursor: pointer;
          width: 38px; height: 38px; padding: 4px;
        }
        .fnav-ham-bar {
          display: block; width: 22px; height: 2px; border-radius: 2px;
          transition: all .3s ease;
        }
        .fnav-default  .fnav-ham-bar { background: var(--navy); }
        .fnav-scrolled .fnav-ham-bar { background: var(--amber); }
        .fnav-ham-bar.open-1 { transform: rotate(45deg) translate(5px, 5px); }
        .fnav-ham-bar.open-2 { opacity: 0; transform: scaleX(0); }
        .fnav-ham-bar.open-3 { transform: rotate(-45deg) translate(5px, -5px); }

        /* ── MOBILE DRAWER ── */
        .fnav-drawer {
          position: fixed; top: 60px; left: 0; right: 0; z-index: 99;
          background: var(--navy);
          border-bottom: 2px solid rgba(245,168,0,0.20);
          padding: 20px 28px 28px;
          display: flex; flex-direction: column; gap: 0;
          transform-origin: top;
          animation: drawer-in .25s ease forwards;
        }
        @keyframes drawer-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fnav-drawer a {
          display: block;
          font-size: 15px; font-weight: 500;
          color: rgba(245,168,0,0.75);
          text-decoration: none;
          padding: 13px 0;
          border-bottom: 1px solid rgba(245,168,0,0.10);
          transition: color .2s;
        }
        .fnav-drawer a:hover { color: var(--amber); }
        .fnav-drawer a:last-child { border-bottom: none; }

        .fnav-drawer-cta {
          margin-top: 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .fnav-drawer-login {
          display: block; text-align: center;
          font-size: 14px; font-weight: 500;
          color: rgba(245,168,0,0.65);
          text-decoration: none;
          padding: 11px;
          border: 1.5px solid rgba(245,168,0,0.25);
          border-radius: 6px;
          transition: border-color .2s, color .2s;
        }
        .fnav-drawer-login:hover { border-color: var(--amber); color: var(--amber); }
        .fnav-drawer-dl {
          display: block; text-align: center;
          font-size: 14px; font-weight: 700;
          color: var(--navy); background: var(--amber);
          text-decoration: none;
          padding: 12px; border-radius: 6px;
          border: 2px solid var(--amber);
          transition: background .2s;
        }
        .fnav-drawer-dl:hover { background: var(--amber3); border-color: var(--amber3); }

        /* ── RESPONSIVE ── */
        @media (max-width: 860px) {
          .fnav-default, .fnav-scrolled { padding: 0 24px; }
          .fnav-links, .fnav-cta { display: none; }
          .fnav-ham { display: flex; }
        }
      `}</style>

      <header className={`fnav ${scrolled ? 'fnav-scrolled' : 'fnav-default'}`}>
        <div className="fnav-inner">

          {/* LOGO */}
          <a href="/" className="fnav-logo">
            <div className="fnav-logo-mark">
              {/* coin / chart icon — matches fintech illustration tone */}
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="#1A1033" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
            </div>
            <span className="fnav-logo-text">finorio</span>
          </a>

          {/* DESKTOP NAV LINKS */}
          <ul className="fnav-links">
            {navLinks.map(link => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>

          {/* DESKTOP CTA */}
          <div className="fnav-cta">
            <Link href="/login" className="fnav-login">Log in</Link>
            <Link href="/cta" className="fnav-download">Download Now ↗</Link>
          </div>

          {/* HAMBURGER */}
          <button
            className="fnav-ham"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`fnav-ham-bar ${mobileOpen ? 'open-1' : ''}`} />
            <span className={`fnav-ham-bar ${mobileOpen ? 'open-2' : ''}`} />
            <span className={`fnav-ham-bar ${mobileOpen ? 'open-3' : ''}`} />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fnav-drawer">
          {navLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="fnav-drawer-cta">
            <Link href="/login"     className="fnav-drawer-login" onClick={() => setMobileOpen(false)}>Log in</Link>
            <Link href="/dashboard" className="fnav-drawer-dl"    onClick={() => setMobileOpen(false)}>Download Now ↗</Link>
          </div>
        </div>
      )}
    </>
  )
}