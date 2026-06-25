"use client";
import styles from "../components/styles/Footer.module.css";
import Image from "next/image";
const links: Record<string, { label: string; href: string }[]> = {
  // Product: [
  //   { label: "Features", href: "/features" },
  //   { label: "Dashboard", href: "/dashboard" },
  //   { label: "Download App", href: "#" },
  // ],
  // Company: [
  //   { label: 'Blog', href: '/blog' },
  //   { label: 'Contact', href: '/contact' },
  //   { label: 'Careers', href: '#' },
  //   { label: 'Press', href: '#' },
  // ],
  // Legal: [
  //   { label: 'Privacy Policy', href: '#' },
  //   { label: 'Terms of Service', href: '#' },
  //   { label: 'Cookie Policy', href: '#' },
  //   { label: 'GDPR', href: '#' },
  // ],
};

export default function Footer() {
  return (
    <footer className={styles["footer"]}>
      <div className={styles["footer-dot-field"]} />

      <div className={styles["footer-inner"]}>
        <div className={styles["footer-grid"]}>
          {/* ── Brand ── */}
          <div className={styles["footer-brand"]}>
            <a href="#" className={styles["footer-logo"]}>
              <div className={styles["footer-logo-icon"]}>
                <Image
                  src="/screenLogo.png"
                  alt="Footer Logo"
                  width={36}
                  height={36}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span className={styles["footer-logo-name"]}>
                cent<span className={styles["footer-logo-dot"]}>fluence</span>
              </span>
            </a>

            <p className={styles["footer-tagline"]}>
              Download our finance app and track your finances effortlessly.
              Smart, secure, and beautifully designed.
            </p>

            <div className={styles["footer-dl-row"]}>
              <a href="#" className={styles["footer-dl-btn"]}>
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
              <h4 className={styles["footer-col-title"]}>{section}</h4>
              <ul className={styles["footer-link-list"]}>
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className={styles["footer-link"]}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className={styles["footer-bottom"]}>
          <p className={styles["footer-copy"]}>
            {new Date().getFullYear()} <strong>Cenfluence</strong>
          </p>

          <div className={styles["footer-socials"]}>
            {/* Twitter / X */}
            <a
              href="#"
              className={styles["footer-social-btn"]}
              aria-label="Twitter"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="#"
              className={styles["footer-social-btn"]}
              aria-label="LinkedIn"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="#"
              className={styles["footer-social-btn"]}
              aria-label="Instagram"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
