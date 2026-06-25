'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './styles/Navbar.module.css'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Platform Workflow', href: '#workflow' },
  { label: 'Contact Us', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Helper to determine accurate path based on current location route
  const getCorrectLink = (href: string) => {
    if (href.startsWith('#') && pathname === '/contact') {
      return `/${href}` // Transforms '#features' to '/#features' when on contact page
    }
    return href
  }

  const navState = scrolled ? styles.fnavScrolled : styles.fnavDefault

  return (
    <>
      <header className={`${styles.fnav} ${navState}`}>
        <div className={styles.fnavInner}>

          {/* LOGO */}
          <Link href="/" className={styles.fnavLogo}>
            <Image
              src="/screenLogo.png"
              alt="Centfluence Logo"
              width={36}
              height={36}
              style={{ objectFit: "contain" }}
            />
            <span className={styles.fnavLogoText}>
              cent<span className={styles.footerLogoDot}>fluence</span>
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <ul className={styles.fnavLinks}>
            {navLinks.map(link => {
              const targetPath = getCorrectLink(link.href);
              const isContact = link.href.includes('/contact');
              
              return (
                <li key={link.label}>
                  {isContact ? (
                    <Link href="/contact" replace>{link.label}</Link>
                  ) : targetPath.startsWith('/') ? (
                    <Link href={targetPath}>{link.label}</Link>
                  ) : (
                    <a href={targetPath}>{link.label}</a>
                  )}
                </li>
              );
            })}
            <li>
              <a href={getCorrectLink('#cta')} className={styles.underlineHover}>Download our app</a>
            </li>
          </ul>

          {/* DESKTOP CTA */}
          <div className={styles.fnavCta}>
            <Link href="/login" className={styles.navBtn}>Login</Link>
          </div>

          {/* HAMBURGER */}
          <button
            className={styles.fnavHam}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.fnavHamBar} ${mobileOpen ? styles.open1 : ''}`} />
            <span className={`${styles.fnavHamBar} ${mobileOpen ? styles.open2 : ''}`} />
            <span className={`${styles.fnavHamBar} ${mobileOpen ? styles.open3 : ''}`} />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className={styles.fnavDrawer}>
          {navLinks.map(link => {
            const targetPath = getCorrectLink(link.href);
            const isContact = link.href.includes('/contact');

            return isContact ? (
              <Link 
                key={link.label} 
                href="/contact" 
                replace 
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : targetPath.startsWith('/') ? (
              <Link 
                key={link.label} 
                href={targetPath} 
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a 
                key={link.label} 
                href={targetPath} 
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            );
          })}
          <a href={getCorrectLink('#cta')} onClick={() => setMobileOpen(false)}>Download our app</a>
          <div className={styles.fnavDrawerCta}>
            <Link href="/login" className={styles.fnavDrawerLogin} onClick={() => setMobileOpen(false)}>Login</Link>
          </div>
        </div>
      )}
    </>
  )
}

