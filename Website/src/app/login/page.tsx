"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./login.module.css";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

export default function LoginPage() {
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      router.replace("/dashboard");
    }
  }, []);
  const router = useRouter();
  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("GOOGLE RESPONSE:", credentialResponse);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`,
        {
          id_token: credentialResponse.credential,
        },
      );
      console.log(response);

      localStorage.setItem("auth_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("user_id", String(response.data.user_id));
      localStorage.setItem("user_name", response.data.name);
      localStorage.setItem("user_email", response.data.email);

      setDone(true);

      if (response.data.is_new_user) {
        router.push("/dashboard?new=true");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err.response?.data);
    }
  };
  const [done, setDone] = useState(false);

  return (
    <>
      <div className={styles["login-root"]}>
        <div className={styles["login-dot-field"]} />

        {/* ── LEFT PANEL ── */}
        <div className={styles["login-left"]}>
          <div className={styles["login-left-glow"]} />

          {/* Logo */}
          <Link href="/" className={styles["login-logo"]}>
            <div className={styles["login-logo-icon"]}>
              <Image
                src="/screenLogo.png"
                alt="Centfluence Logo"
                width={36}
                height={36}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className={styles["login-logo-name"]}>
              cent<span className={styles["login-logo-dot"]}>Fluence</span>
            </span>
          </Link>

          {/* Dashboard preview card */}
          <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
            <div className={styles["login-card"]}>
              <div className={styles["lc-header"]}>
                <div>
                  <p className={styles["lc-greeting-sub"]}>Good morning</p>
                  <p className={styles["lc-greeting-name"]}>Welcome back</p>
                </div>
                <div className={styles["lc-avatar"]}>AM</div>
              </div>
              <div className={styles["lc-balance-box"]}>
                <p className={styles["lc-balance-label"]}>Balance</p>
                <p className={styles["lc-balance-amount"]}>Rs 24,891.50</p>
                <p className={styles["lc-balance-change"]}>
                  ↑ +12.4% this month
                </p>
              </div>
              /* Mini chart */
              <svg viewBox="0 0 280 55" className={styles["lc-chart"]}>
                <defs>
                  <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A800" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 C40,30 70,45 110,25 C140,10 170,38 210,18 C240,4 265,30 280,12"
                  fill="none"
                  stroke="#F5A800"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M0,40 C40,30 70,45 110,25 C140,10 170,38 210,18 C240,4 265,30 280,12 L280,55 L0,55Z"
                  fill="url(#lcg)"
                />
              </svg>
              /* Transactions */
              {[
                { icon: "🛒", n: "Groceries", a: "-Rs 42.00", pos: false },
                { icon: "💼", n: "Salary", a: "+Rs 4,200", pos: true },
                { icon: "☕", n: "Coffee", a: "-Rs 5.80", pos: false },
              ].map((t, i) => (
                <div key={i} className={styles["lc-tx"]}>
                  <div className={styles["lc-tx-left"]}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span className={styles["lc-tx-name"]}>{t.n}</span>
                  </div>
                  <span
                    className={
                      t.pos ? styles["lc-tx-pos"] : styles["lc-tx-neg"]
                    }
                  >
                    {t.a}
                  </span>
                </div>
              ))}
            </div>

            {/* Floating chip */}
            <div className={styles["lc-chip"]}>
              <span className={styles["lc-chip-pip"]} />
              <span className={styles["lc-chip-label"]}>Live sync active</span>
            </div>
          </div>

          <p className={styles["login-left-foot"]}>
            Join Us to track your expenses , income in AI-Optimized way.
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={styles["login-right"]}>
          {/* Mobile logo */}
          <Link href="/" className={styles["login-mobile-logo"]}>
            <div
              className={styles["login-logo-icon"]}
              style={{
                background: "var(--navy)",
                boxShadow: "3px 3px 0 var(--ink)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#F5A800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className={styles["login-logo-name"]}>
              fin<span className={styles["login-logo-dot"]}>orio</span>
            </span>
          </Link>

          <div className={styles["login-form-wrap"]}>
            {done ? (
              <div className={styles["login-success"]}>
                <div className={styles["login-success-icon"]}>✓</div>
                <h2>You&apos;re in!</h2>
                <p>Redirecting to your dashboard…</p>
                <Link
                  href="/dashboard"
                  className={styles["login-success-link"]}
                >
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <>
                <p className={styles["login-subhead"]}>
                  <span className={styles["highlight-big"]}>Join Us</span>
                  <br />
                  and start managing money smarter today.
                </p>
                {/* Social login */}
                <div className={styles["login-socials"]}>
                  {[
                    {
                      label: "Google",
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      ),
                    },
                  ].map((s) => (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        console.log("Google Login Failed");
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
