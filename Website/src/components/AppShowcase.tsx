"use client";
import { useRef, useEffect, useState } from "react";
import styles from "./styles/AppShowcase.module.css";

/* ─────────────────────────────────────────────
   MOCKUP 1 — Dashboard Overview
───────────────────────────────────────────── */
const DashboardMockup = () => (
  <div className={styles.mockupShell}>
    <div className={styles.mockupBar}>
      <span className={`${styles.dot} ${styles.dotR}`} />
      <span className={`${styles.dot} ${styles.dotY}`} />
      <span className={`${styles.dot} ${styles.dotG}`} />
      <div className={styles.mockupUrl}>app.centfluence.com · Dashboard</div>
    </div>

    <div className={styles.mockupBody}>
      {/* greeting row */}
      <div className={styles.dbGreeting}>
        <div>
          <p className={styles.dbGreetingSub}>Good evening 👋</p>
          <p className={styles.dbGreetingTitle}>Financial Summary</p>
        </div>
        <div className={styles.dbAvatar}>💳</div>
      </div>

      {/* balance card */}
      <div className={styles.dbBalanceCard}>
        <p className={styles.dbBalanceLabel}>Total Savings</p>
        <p className={styles.dbBalanceVal}>
          ₹12,480<span className={styles.dbBalanceDec}>.50</span>
        </p>
        <div className={styles.dbBalanceRow}>
          <span className={styles.dbMeta}>
            Income <strong className={styles.dbPos}>₹42,000</strong>
          </span>
          <span className={styles.dbMeta}>
            Spent <strong className={styles.dbNeg}>₹29,520</strong>
          </span>
          <span className={`${styles.dbMeta} ${styles.dbChange}`}>↑ +12.4%</span>
        </div>
      </div>

      {/* transactions */}
      <p className={styles.dbSectionTitle}>Recent Transactions</p>
      {[
        { icon: "🛒", name: "Swiggy",        date: "Today",     amt: "-₹67.40",  pos: false },
        { icon: "☕", name: "Airtel",         date: "Yesterday", amt: "-₹500.80", pos: false },
        { icon: "💼", name: "Salary Credit",  date: "Dec 1",     amt: "+44,200",  pos: true  },
      ].map((t, i) => (
        <div key={i} className={styles.dbTx}>
          <div className={styles.dbTxLeft}>
            <div className={styles.dbTxIcon}>{t.icon}</div>
            <div>
              <p className={styles.dbTxName}>{t.name}</p>
              <p className={styles.dbTxDate}>{t.date}</p>
            </div>
          </div>
          <span className={t.pos ? `${styles.dbTxAmt} ${styles.dbTxAmtPos}` : styles.dbTxAmt}>
            {t.amt}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   MOCKUP 2 — Spending Statistics
───────────────────────────────────────────── */
const StatsMockup = () => (
  <div className={styles.mockupShell}>
    <div className={styles.mockupBar}>
      <span className={`${styles.dot} ${styles.dotR}`} />
      <span className={`${styles.dot} ${styles.dotY}`} />
      <span className={`${styles.dot} ${styles.dotG}`} />
      <div className={styles.mockupUrl}>app.centfluence.com · Analytics</div>
    </div>

    <div className={styles.mockupBody}>
      <div className={styles.stHeader}>
        <p className={styles.dbGreetingTitle}>Spending Breakdown</p>
        <span className={styles.stPill}>This Month</span>
      </div>

      {/* donut + legend */}
      <div className={styles.stChartRow}>
        <div className={styles.stDonutWrap}>
          <svg viewBox="0 0 100 100" className={styles.stDonut}>
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(26,16,51,0.25)" strokeWidth="13" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F5A800" strokeWidth="13"
              strokeDasharray="90 150" strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#FFD166" strokeWidth="13"
              strokeDasharray="45 195" strokeDashoffset="-90" strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(245,168,0,0.35)" strokeWidth="13"
              strokeDasharray="30 210" strokeDashoffset="-135" strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className={styles.stDonutcenter}>
            <p className={styles.stDonutVal}>₹18.4K</p>
            <p className={styles.stDonutSub}>Total</p>
          </div>
        </div>

        <div className={styles.stLegend}>
          {[
            { color: "#F5A800",              cat: "Food",      pct: "38%", amt: "₹1,178" },
            { color: "#FFD166",              cat: "Shopping",  pct: "30%", amt: "₹930"   },
            { color: "rgba(245,168,0,.4)",   cat: "Utilities", pct: "20%", amt: "₹620"   },
            { color: "rgba(245,168,0,.2)",   cat: "Travel",    pct: "12%", amt: "₹372"   },
          ].map((c, i) => (
            <div key={i} className={styles.stLegendRow}>
              <div className={styles.stLegendLeft}>
                <span className={styles.stLegendDot} style={{ background: c.color }} />
                <span className={styles.stLegendCat}>{c.cat}</span>
              </div>
              <div className={styles.stLegendRight}>
                <span className={styles.stLegendPct}>{c.pct}</span>
                <span className={styles.stLegendAmt}>{c.amt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* trend line */}
      <p className={`${styles.dbSectionTitle} ${styles.stSectionTitle}`}>
        Monthly Trend
      </p>
      <svg viewBox="0 0 280 56" className={styles.stTrend}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F5A800" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[14, 28, 42].map((y) => (
          <line key={y} x1="0" y1={y} x2="280" y2={y}
            stroke="rgba(26,16,51,0.18)" strokeWidth="0.6" strokeDasharray="4"
          />
        ))}
        <path d="M0,45 C30,35 60,50 90,30 C120,10 150,40 180,20 C210,0 240,35 280,15"
          fill="none" stroke="#F5A800" strokeWidth="2" strokeLinecap="round"
        />
        <path d="M0,45 C30,35 60,50 90,30 C120,10 150,40 180,20 C210,0 240,35 280,15 L280,56 L0,56 Z"
          fill="url(#tg)"
        />
        <circle cx="280" cy="15" r="3.5" fill="#F5A800" stroke="#1A1033" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const tabs = [
  {
    id: "dashboard",
    eyebrow: "AI Dashboard",
    title: "Understand your finances instantly",
    desc: "Monitor income, expenses, savings, top merchants, category breakdowns, and monthly trends from a single intelligent dashboard.",
    mockup: <DashboardMockup />,
  },
  {
    id: "stats",
    eyebrow: "AI Insights",
    title: "Discover spending patterns automatically",
    desc: "AI analyzes your transactions, identifies spending habits, highlights opportunities to save, and surfaces meaningful financial insights.",
    mockup: <StatsMockup />,
  },
];

/* ─────────────────────────────────────────────
   REVEAL HOOK
───────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis] as const;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AppShowcase() {
  const [headerRef, headerVis] = useReveal();

  return (
    <section id="showcase" className={styles.showcase}>
      <div className={styles.scInner}>

        {/* HEADER */}
        <div
          className={styles.scHeader}
          ref={headerRef}
          style={{
            opacity: headerVis ? 1 : 0,
            transform: headerVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}
        >
          <div className={styles.scEyebrow}>◆ App Experience</div>
          <h2 className={styles.scHeadline}>
            A powerful AI financial{" "}
            <span className={styles.scHeadlineAccent}>intelligence platform</span>
          </h2>
          <p className={styles.scSub}>
            Transform bank SMS into actionable financial insights, track
            spending automatically, and understand your money with AI-powered
            analytics.
          </p>
        </div>

        {/* ROWS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
          {tabs.map((tab, i) => {
            const [rowRef, rowVis] = useReveal(0.1);
            const isEven = i % 2 === 1;

            return (
              <div
                key={tab.id}
                ref={rowRef}
                className={`${styles.scGrid} ${isEven ? styles.scRowEven : ""}`}
                style={{
                  opacity: rowVis ? 1 : 0,
                  transform: rowVis ? "translateY(0)" : "translateY(32px)",
                  transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
              >
                {/* TEXT */}
                <div className={styles.scText}>
                  <div className={styles.scTabBadge}>◆ {tab.eyebrow}</div>
                  <h3 className={styles.scTitle}>{tab.title}</h3>
                  <p className={styles.scDesc}>{tab.desc}</p>
                  {/* <a href="/features" className={styles.scLink}>
                    View Full Analytics
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </a> */}
                </div>

                {/* MOCKUP */}
                <div className={styles.scFrame}>{tab.mockup}</div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}