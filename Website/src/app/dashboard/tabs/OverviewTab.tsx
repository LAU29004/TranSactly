"use client";

// ─── Services / Hooks ────────────────────────────────────────────────────────
import { useDashboard, useTransactions } from "../../../hooks/useServices";
import { LoadingState, ErrorState } from "../../../components/LoadingState";
import { useState } from "react";
// ─── Types ───────────────────────────────────────────────────────────────────
import { Period, InsightType, AIInsight } from "../../../types/Api.types";

// ─── Sub-components (API-driven versions) ────────────────────────────────────
import AIAssistantTrigger from "../assistant/AIAssistantTrigger";
import OverviewKPIRow from "../OverviewKPIRow";

import styles from "../Dashboard.module.css";
import { SuggestedQuestion } from "../../../types/Api.types";
// ─── STATIC LOOKUP TABLES (non-data — styling only) ──────────────────────────

const DONUT_COLORS = [
  "#F5A800", // Original Gold/Amber (Primary)
  "#4D2DB7", // Original Deep Purple (Primary)
  "#FFD166", // Original Light Pastel Yellow/Gold
  "#44317A", // New Medium Royal Purple
  "#E09700", // Original Dark Amber/Ochre
  "#1A1033", // New Ultra-Deep Shadow Purple
  "#FFE099", // New Soft Cream/Champagne Gold
  "#614A9F", // New Vibrant Amethyst Purple
  "#B87C00", // New Deep Bronze/Brown-Gold
  "#7D64C4"  // New Light Lavender/Pastel Purple
];

const PERIOD_LABELS: Record<Period, string> = {
  month: "This Month",
  "6months": "6 Months",
  "1year": "1 Year",
};

// ─── PERIOD CHIPS ─────────────────────────────────────────────────────────────

function PeriodChips({
  activePeriod,
  onChange,
}: {
  activePeriod: Period;
  onChange: (p: Period) => void;
}) {
  const periods: Period[] = ["month", "6months", "1year"];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {periods.map((p) => {
        const active = activePeriod === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
              fontSize: 12,
              fontWeight: 700,
              transition: "all 0.18s",
              border: active
                ? "4.5px solid rgba(245,168,0,0.7)"
                : "1.5px solid rgba(245,168,0,0.22)",
              background: active ? "#F5A800" : "rgba(245,168,0,0.07)",
              color: active ? "#1A1033" : "rgb(0,0,0)",
              boxShadow: active ? "2px 2px 0 #0E0920" : "none",
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}

// ─── INSIGHT COMPONENTS (unchanged) ──────────────────────────────────────────

const INSIGHT_ICON: Record<InsightType, React.ReactNode> = {
  spending: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M8 1v2M8 13v2M3 8H1M15 8h-2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4" />
      <circle cx="8" cy="8" r="3" />
    </svg>
  ),
  subscription: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <path d="M2 6h12M5 9.5h3" />
    </svg>
  ),
  savings: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2 9l3.5-3.5L8 8l5.5-5.5M10 2.5h3.5V6" />
    </svg>
  ),
  anomaly: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M8 1.5l6.5 11.5h-13L8 1.5z" strokeLinejoin="round" />
      <path d="M8 6.5v3" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const INSIGHT_ACcent: Record<
  InsightType,
  { fg: string; bg: string; border: string }
> = {
  spending: {
    fg: "#F5A800",
    bg: "rgba(245,168,0,0.12)",
    border: "rgba(245,168,0,0.28)",
  },
  subscription: {
    fg: "#FFD166",
    bg: "rgba(255,209,102,0.10)",
    border: "rgba(255,209,102,0.25)",
  },
  savings: {
    fg: "#6EE7A0",
    bg: "rgba(110,231,160,0.10)",
    border: "rgba(110,231,160,0.25)",
  },
  anomaly: {
    fg: "#F87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.25)",
  },
};

function ConfidenceBadge({ score, color }: { score: number; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10.5,
        fontFamily: "'Outfit',sans-serif",
        fontWeight: 700,
        color,
        background: "rgba(255,252,240,0.04)",
        border: `1px solid ${color}`,
        borderRadius: 20,
        padding: "3px 9px",
        whiteSpace: "nowrap",
        opacity: 0.9,
      }}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 8.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {score}% confidence
    </div>
  );
}

function AIInsightCard({ insight }: { insight: AIInsight }) {
  const accent = INSIGHT_ACcent[insight.type];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "rgba(245,168,0,0.03)",
        border: `1.5px solid ${accent.border}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              background: accent.bg,
              border: `1.5px solid ${accent.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent.fg,
            }}
          >
            {INSIGHT_ICON[insight.type]}
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: "var(--white)",
              letterSpacing: "-0.01em",
            }}
          >
            {insight.title}
          </div>
        </div>
        <ConfidenceBadge score={insight.confidence} color={accent.fg} />
      </div>
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.6,
          color: "rgba(255,252,240,0.45)",
          paddingLeft: 40,
        }}
      >
        {insight.description}
      </div>
    </div>
  );
}

function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <div className={styles["chart-card"]}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          className={styles["chart-title"]}
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
        >
          AI Insights
        </div>
        <span
          style={{
            fontSize: 11,
            color: "rgba(245,168,0,0.4)",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {insights.map((insight, i) => (
          <AIInsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  dashboard: ReturnType<typeof useDashboard>;
  activePeriod: Period;
  showBalance: boolean;
  onViewAllTransactions: () => void;
}

function SuggestedQuestionsCard({
  questions,
}: {
  questions: SuggestedQuestion[];
}) {
  if (!questions.length) return null;

  return (
    <div className={styles["chart-card"]}>
      <div
        className={styles["chart-title"]}
        style={{
          marginBottom: 16,
        }}
      >
        Suggested Questions
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {questions.map((q) => (
          <AIAssistantTrigger prompt={q.text} />
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab({
  dashboard,
  activePeriod,
  showBalance,
  onViewAllTransactions,
}: OverviewTabProps) {
  const transactions = useTransactions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // ── Derived period data ─────────────────────────────────────────────────────
  const SUMMARY_CARDS = dashboard.data?.data.summaryCards ?? [];
  const MONTHS = dashboard.data?.data.months ?? [];
  const DONUT_SEGMENTS = dashboard.data?.data.donut ?? [];
  const AI_INSIGHTS = dashboard.data?.data.insights ?? [];
  const SUGGESTED_QUESTIONS = dashboard.data?.data.suggestedQuestions ?? [];
  const allTransactions = transactions.data ?? [];

  let cumPct = 0;
  const C = 2 * Math.PI * 52;
  const maxBarValue = Math.max(...MONTHS.flatMap((m) => [m.income, m.spend]));
  const totalSpent = DONUT_SEGMENTS.reduce(
    (sum, item) => sum + Number(item.amount.replace(/[^0-9.]/g, "")),
    0,
  );
  return (
    <div>
      <OverviewKPIRow period={activePeriod} />

      {dashboard.loading ? (
        <LoadingState rows={4} label="Loading dashboard…" />
      ) : dashboard.error ? (
        <ErrorState
          error={dashboard.error}
          onRetry={dashboard.refetch}
          label="Could not load dashboard data"
        />
      ) : (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {SUMMARY_CARDS.map((card, i) => (
              <div key={i} className={styles["stat-card"]}>
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontSize: 18,
                    opacity: 0.15,
                    color: "var(--amber)",
                  }}
                >
                  {card.icon}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(245,168,0,0.45)",
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--white)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {showBalance ? card.value : "••••••"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,252,240,0.35)",
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {card.subType === "up" && (
                    <span className={styles["pill-up"]}>
                      {" "}
                      {card.sub.split(" ")[0]}
                    </span>
                  )}
                  {card.subType === "down" && (
                    <span className={styles["pill-down"]}>
                      {card.sub.split(" ")[0]}
                    </span>
                  )}
                  <span
                    style={{
                      color:
                        card.subType === "gold" ? "var(--amber3)" : undefined,
                      fontSize: 10.5,
                    }}
                  >
                    {card.subType === "up" || card.subType === "down"
                      ? card.sub.slice(card.sub.indexOf(" ") + 1)
                      : card.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.9fr",
              gap: 18,
              marginBottom: 20,
            }}
          >
            {/* Donut */}
            {/* State declarations needed in your parent component wrapper:
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
*/}
            <div className={styles["chart-card"]}>
              <div className={styles["chart-title"]}>Category Breakdown</div>

              <div className={styles["donut-wrapper"]}>
                <svg
                  width="136"
                  height="136"
                  viewBox="0 0 136 136"
                  style={{ transform: "rotate(-90deg)", overflow: "visible" }}
                >
                  {(() => {
                    let cumPct = 0;
                    return DONUT_SEGMENTS.map((seg, i) => {
                      const dash = `${(seg.pct / 100) * C} ${C}`;
                      const offset = -((cumPct / 100) * C);
                      cumPct += seg.pct;

                      const isSelected = selectedIndex === i;
                      const isHovered = hoveredIndex === i;

                      return (
                        <g
                          key={i}
                          className={styles["donut-group"]}
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() =>
                            setSelectedIndex(selectedIndex === i ? null : i)
                          }
                        >
                          <circle
                            cx="68"
                            cy="68"
                            r={52}
                            fill="none"
                            stroke={DONUT_COLORS[i]}
                            strokeWidth={
                              isSelected ? "22" : isHovered ? "19" : "16"
                            }
                            strokeDasharray={dash}
                            strokeDashoffset={offset}
                            style={{
                              transition: "all 0.18s ease",
                              opacity:
                                selectedIndex !== null && !isSelected ? 0.4 : 1,
                            }}
                          />
                        </g>
                      );
                    });
                  })()}
                </svg>

                {/* ─── DYNAMIC centRAL LABEL (Updates instantly on Hover or Click) ─── */}
                <div className={styles["central-label"]}>
                  {(() => {
                    // Prioritize hovered item text, then clicked item text, fallback to total
                    const activeIndex =
                      hoveredIndex !== null ? hoveredIndex : selectedIndex;

                    if (activeIndex !== null && DONUT_SEGMENTS[activeIndex]) {
                      const activeSeg = DONUT_SEGMENTS[activeIndex];
                      return (
                        <>
                          <div
                            style={{
                              fontFamily: "'Syne',sans-serif",
                              fontSize: 16,
                              fontWeight: 800,
                              color: 'white',
                              letterSpacing: "-0.02em",
                              textAlign: "center",
                            }}
                          >
                            {showBalance ? activeSeg.amount : "••••"}
                          </div>
                          <div
                            style={{
                              fontSize: 10.5,
                              color: "white",
                              letterSpacing: "0.06em",
                              marginTop: 2,
                              textTransform: "uppercase",
                              fontWeight: 700,
                              textAlign: "center",
                            }}
                          >
                            {activeSeg.label} ({activeSeg.pct}%)
                          </div>
                        </>
                      );
                    }

                    // Default layout state: Display complete dashboard total spent counter
                    return (
                      <>
                        <div
                          style={{
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 18,
                            fontWeight: 800,
                            color: "var(--white)",
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {showBalance ? `₹${totalSpent.toFixed(2)}` : "••••"}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "rgba(245,168,0,0.4)",
                            letterSpacing: "0.08em",
                            marginTop: 3,
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          Total
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* ─── BOTTOM LIST LEGEND (With custom highlight filters on selection) ─── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {DONUT_SEGMENTS.map((seg, i) => {
                  const isSelected = selectedIndex === i;
                  const isAnySelected = selectedIndex !== null;

                  return (
                    <div
                      key={i}
                      onClick={() =>
                        setSelectedIndex(selectedIndex === i ? null : i)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        fontSize: 12,
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        background: isSelected
                          ? "rgba(245,168,0,0.08)"
                          : "transparent",
                        border: isSelected
                          ? "1px solid rgba(245,168,0,0.25)"
                          : "1px solid transparent",
                        opacity: isAnySelected && !isSelected ? 0.35 : 1,
                      }}
                      className={styles["legend-row"]}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: isSelected
                            ? "var(--white)"
                            : "rgba(255,252,240,0.45)",
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: DONUT_COLORS[i],
                            marginRight: 8,
                          }}
                        />
                        {seg.label}
                      </div>
                      <div style={{ color: "var(--white)", fontWeight: 600 }}>
                        {showBalance ? seg.amount : "••••"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bar chart */}
            <div className={styles["chart-card"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <div className={styles["chart-title"]} style={{ margin: 0 }}>
                  {activePeriod === "month"
                    ? "Weekly Income vs Spending"
                    : "Monthly Income vs Spending"}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 600,
                    color: "rgba(245,168,0,0.5)",
                    background: "rgba(245,168,0,0.08)",
                    border: "1px solid rgba(245,168,0,0.18)",
                    borderRadius: 20,
                    padding: "3px 10px",
                    letterSpacing: "0.06em",
                  }}
                >
                  {PERIOD_LABELS[activePeriod]}
                </span>
              </div>
              {MONTHS.length === 0 ? (
                <div
                  style={{
                    height: 220, // Matches the approximate height of the chart + legend
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    border: "1px dashed rgba(245,168,0,0.15)",
                    borderRadius: 12,
                    background: "rgba(245,168,0,0.01)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(245,168,0,0.3)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <span
                    style={{
                      fontSize: 13,
                      color: "rgba(255,252,240,0.4)",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    No data available
                  </span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      height: 180,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 14,
                      paddingBottom: 28,
                      borderBottom: "2px solid rgba(245,168,0,0.1)",
                      position: "relative",
                    }}
                  >
                    {MONTHS.map((m) => (
                      <div
                        key={m.label}
                        className={styles["bar-column"]} // <-- Added CSS module class here
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          height: "100%",
                          justifyContent: "flex-end",
                          cursor: "pointer", // Gives a visual hint that it's hoverable
                        }}
                      >
                        {/* ─── HOVER TOOLTIP ELEMENT ─── */}
                        <div className={styles["chart-tooltip"]}>
                          <div className={styles["tooltip-title"]}>
                            {m.label}
                          </div>
                          <div className={styles["tooltip-row"]}>
                            <span style={{ color: "rgba(255,252,240,0.6)" }}>
                              Income:
                            </span>
                            <span
                              style={{ color: "var(--amber)", fontWeight: 700 }}
                            >
                              {showBalance ? `₹${m.income.toFixed(2)}` : "••••"}
                            </span>
                          </div>
                          <div className={styles["tooltip-row"]}>
                            <span style={{ color: "rgba(255,252,240,0.6)" }}>
                              Spent:
                            </span>
                            <span
                              style={{ color: "var(--white)", fontWeight: 700 }}
                            >
                              {showBalance ? `₹${m.spend.toFixed(2)}` : "••••"}
                            </span>
                          </div>
                        </div>

                        {/* ─── EXISTING BARS DRAWING ─── */}
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            alignItems: "flex-end",
                            width: "100%",
                            height: 150,
                          }}
                        >
                          <div
                            className={`${styles["bar"]} ${styles["bar-income"]}`}
                            style={{
                              height: `${(m.income / maxBarValue) * 100}%`,
                            }}
                          />
                          <div
                            className={`${styles["bar"]} ${styles["bar-spend"]}`}
                            style={{
                              height: `${(m.spend / maxBarValue) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Axis Label */}
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "rgba(245,168,0,0.4)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      marginTop: 14,
                      fontSize: 11.5,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "rgba(255,252,240,0.35)",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 3,
                          borderRadius: 2,
                          background: "var(--amber)",
                        }}
                      />{" "}
                      Income
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "rgba(255,252,240,0.35)",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 3,
                          borderRadius: 2,
                          background: "var(--navy2)",
                        }}
                      />{" "}
                      Spending
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: 18,
            }}
          >
            {/* Recent transactions */}
            <div className={styles["chart-card"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div className={styles["chart-title"]} style={{ margin: 0 }}>
                  Recent Transactions
                </div>
                <button
                  onClick={onViewAllTransactions}
                  style={{
                    fontSize: 12,
                    color: "var(--amber3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 600,
                  }}
                >
                  View all →
                </button>
              </div>
              {transactions.loading ? (
                <LoadingState rows={3} label="Loading transactions…" />
              ) : transactions.error ? (
                <ErrorState
                  error={transactions.error}
                  onRetry={transactions.refetch}
                />
              ) : (
                <table className={styles["tx-table"]}>
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.slice(0, 6).map((tx) => (
                      <tr key={tx.id} className={styles["tx-row"]}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: "rgba(245,168,0,0.1)",
                                border: "1.5px solid rgba(245,168,0,0.18)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                              }}
                            >
                              {tx.icon}
                            </div>
                            <span
                              style={{ color: "var(--white)", fontSize: 12.5 }}
                            >
                              {tx.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={styles["tx-cat"]}>
                            {tx.category}
                          </span>
                        </td>
                        <td
                          style={{
                            fontSize: 11,
                            color: "rgba(245,168,0,0.38)",
                          }}
                        >
                          {tx.date}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color:
                                tx.amount > 0
                                  ? "var(--amber3)"
                                  : "rgba(255,252,240,0.6)",
                            }}
                          >
                            {showBalance
                              ? `${tx.amount > 0 ? "+" : ""}₹ ${Math.abs(tx.amount).toFixed(2)}`
                              : "••••"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* AI Insights */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <AIInsightsPanel insights={AI_INSIGHTS} />

              <SuggestedQuestionsCard questions={SUGGESTED_QUESTIONS} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { PeriodChips };
