"use client";

import React from "react";
import {
  useAnalytics,
  useMerchantIntelligence,
  useAIClassification,
} from "../../../hooks/useServices";
import { LoadingState, ErrorState } from "../../../components/LoadingState";
import { AIInsight, InsightType } from "../../../types/Api.types";
import styles from "../Dashboard.module.css";
import { useState } from "react";
// ─── ANALYTICS CHART COLOURS (static — returned by API for labels/colours) ───
// These are kept here only as a fallback; the API response's `color` field is used.

const CATEGORY_PIE_COLORS = [
  "#F5A800",
  "#FFD166",
  "#E09700",
  "#8B6CD6",
  "#2C1D55",
];

// ─── INSIGHT COMPONENTS HELPER MAPS ──────────────────────────────────────────
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

// ─── CHART & INSIGHT COMPONENTS ─────────────────────────────────────────────

function CategoryPieChart({
  data,
  showBalance,
}: {
  data: { label: string; value: number; color: string }[];
  showBalance: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={styles["chart-card"]}>
        <div className={styles["chart-title"]}>Spending by Category</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            color: "white",
            fontSize: 15,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          No Category data available
        </div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 90,
    cy = 90,
    r = 78;
  let cumAngle = -90;

  const slices = data.map((seg, i) => {
    const angle = (seg.value / total) * 360,
      startAngle = cumAngle,
      endAngle = cumAngle + angle;
    cumAngle = endAngle;
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle)),
      y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle)),
      y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...seg,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className={styles["chart-card"]}>
      <div className={styles["chart-title"]}>Spending by Category</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            style={{ overflow: "visible" }}
          >
            {slices.map((seg, i) => {
              const isSelected = selectedIndex === i;
              const isHovered = hoveredIndex === i;

              return (
                <path
                  key={i}
                  d={seg.path}
                  fill={seg.color}
                  stroke="#1A1033"
                  strokeWidth="1.5"
                  cursor="pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                  style={{
                    transform: isSelected || isHovered ? "scale(1.04)" : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: "all 0.18s ease",
                    opacity: selectedIndex !== null && !isSelected ? 0.4 : 1,
                  }}
                />
              );
            })}
            <circle cx={cx} cy={cy} r={42} fill="#1A1033" />
          </svg>

          {/* ─── DYNAMIC centRAL HTML LABEL ─── */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              width: 76,
            }}
          >
            {(() => {
              const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;

              if (activeIndex !== null && data[activeIndex]) {
                const activeSeg = data[activeIndex];
                return (
                  <>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 13,
                        fontWeight: 800,
                        color: activeSeg.color,
                        letterSpacing: "-0.02em",
                        textAlign: "center",
                      }}
                    >
                      {showBalance ? `₹${activeSeg.value.toLocaleString()}` : "••••"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "white",
                        letterSpacing: "0.04em",
                        marginTop: 2,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        textAlign: "center",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {activeSeg.label}
                    </div>
                  </>
                );
              }

              return (
                <>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#FFFCF0",
                      letterSpacing: "-0.03em",
                      textAlign: "center",
                    }}
                  >
                    {showBalance ? `₹${total.toLocaleString()}` : "••••"}
                  </div>
                  <div
                    style={{
                      fontSize: 8,
                      color: "rgba(245,168,0,0.45)",
                      letterSpacing: "0.08em",
                      marginTop: 3,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    TOTAL
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* ─── RIGHT LEGEND LIST ─── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 140,
            flex: 1,
          }}
        >
          {data.map((seg, i) => {
            const isSelected = selectedIndex === i;
            const isAnySelected = selectedIndex !== null;

            return (
              <div
                key={i}
                onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  fontSize: 12,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isSelected ? "rgba(245,168,0,0.08)" : "transparent",
                  border: isSelected ? "1px solid rgba(245,168,0,0.25)" : "1px solid transparent",
                  opacity: isAnySelected && !isSelected ? 0.35 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: isSelected ? "var(--white)" : "rgba(255,252,240,0.5)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: seg.color,
                      flexShrink: 0,
                    }}
                  />
                  {seg.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10.5, color: "rgba(245,168,0,0.4)" }}>
                    {((seg.value / total) * 100).toFixed(0)}%
                  </span>
                  <span style={{ color: "var(--white)", fontWeight: 600 }}>
                    {showBalance ? `₹${seg.value.toLocaleString()}` : "••••"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthlyTrendLineChart({
  data,
  showBalance,
}: {
  data: { label: string; value: number }[];
  showBalance: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 560,
    height = 200,
    padX = 28,
    padTop = 24,
    padBottom = 32;
  const innerW = width - padX * 2,
    innerH = height - padTop - padBottom;
  const max = Math.max(...data.map((d) => d.value)),
    min = Math.min(...data.map((d) => d.value)),
    range = max - min || 1;

  if (data.length < 2) {
    return (
      <div className={styles["chart-card"]}>
        <div className={styles["chart-title"]}>Monthly Expense Trend</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            color: "white",
            fontSize: 15,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          No trend data available
        </div>
      </div>
    );
  }

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padTop + innerH - ((d.value - min) / range) * innerH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`;

  return (
    <div className={styles["chart-card"]}>
      <div className={styles["chart-title"]}>Monthly Expense Trend</div>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ minWidth: 320 }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A800" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line
              key={i}
              x1={padX}
              y1={padTop + innerH * t}
              x2={width - padX}
              y2={padTop + innerH * t}
              stroke="rgba(245,168,0,0.08)"
              strokeWidth="1"
            />
          ))}
          <path d={areaPath} fill="url(#trendFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#F5A800"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g 
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Invisible larger target for easier hover interactions */}
                <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6" : "4"}
                  fill={isHovered ? "#F5A800" : "#1A1033"}
                  stroke="#F5A800"
                  strokeWidth="2.5"
                  style={{ transition: "all 0.12s ease" }}
                />
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fontFamily="'Outfit',sans-serif"
                  fontSize={isHovered ? "11" : "10"}
                  fontWeight="700"
                  fill={isHovered ? "#F5A800" : "#FFD166"}
                  style={{ 
                    transition: "all 0.12s ease",
                    opacity: isHovered ? 1 : 0.75 
                  }}
                >
                  {showBalance ? `₹${(p.value / 1000).toFixed(1)}k` : "••••"}
                </text>
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontFamily="'Outfit',sans-serif"
                  fontSize="10.5"
                  fill={isHovered ? "rgba(245,168,0,0.8)" : "rgba(245,168,0,0.4)"}
                  fontWeight={isHovered ? 600 : 400}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function IncomeExpenseBarChart({
  data,
  showBalance,
}: {
  data: { label: string; income: number; expense: number }[];
  showBalance: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <div className={styles["chart-card"]}>
        <div className={styles["chart-title"]}>Spending by Category</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            color: "white",
            fontSize: 15,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          No Income Or Expense data available
        </div>
      </div>
    );
  }
  const max = Math.max(...data.map((d) => Math.max(d.income, d.expense)));
  return (
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
          Income vs Expense
        </div>
      </div>
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "flex-end",
          gap: 18,
          paddingBottom: 28,
          borderBottom: "2px solid rgba(245,168,0,0.1)",
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            className={styles["bar-column"]}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
              justifyContent: "flex-end",
              position: "relative",
              cursor: "pointer",
            }}
          >
            {/* ─── HOVER TOOLTIP ELEMENT ─── */}
            <div className={styles["chart-tooltip"]}>
              <div className={styles["tooltip-title"]}>{d.label}</div>
              <div className={styles["tooltip-row"]}>
                <span style={{ color: "rgba(255,252,240,0.6)" }}>Income:</span>
                <span style={{ color: "var(--amber)", fontWeight: 700 }}>
                  {showBalance ? `₹${d.income.toLocaleString()}` : "••••"}
                </span>
              </div>
              <div className={styles["tooltip-row"]}>
                <span style={{ color: "rgba(255,252,240,0.6)" }}>Expense:</span>
                <span style={{ color: "var(--white)", fontWeight: 700 }}>
                  {showBalance ? `₹${d.expense.toLocaleString()}` : "••••"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 5,
                alignItems: "flex-end",
                width: "100%",
                height: 160,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: `${showBalance ? (d.income / max) * 100 : 20}%`,
                  borderRadius: "4px 4px 0 0",
                  minHeight: 4,
                  background:
                    "linear-gradient(to top, rgba(245,168,0,0.3), #F5A800)",
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: `${(d.expense / max) * 100}%`,
                  borderRadius: "4px 4px 0 0",
                  minHeight: 4,
                  background:
                    "linear-gradient(to top, rgba(44,29,85,0.5), rgba(44,29,85,0.95))",
                  border: "1px solid rgba(245,168,0,0.15)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "rgba(245,168,0,0.4)",
                letterSpacing: "0.06em",
              }}
            >
              {d.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: 11.5 }}>
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
          Expense
        </div>
      </div>
    </div>
  );
}
function TopMerchantsBarChart({
  data,
  showBalance,
}: {
  data: { label: string; value: number }[];
  showBalance: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <div className={styles["chart-card"]}>
        <div className={styles["chart-title"]}>Spending by Category</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            color: "white",
            fontSize: 15,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          No Merchants data available
        </div>
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={styles["chart-card"]}>
      <div className={styles["chart-title"]}>Top Merchants</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "rgba(255,252,240,0.5)" }}>{d.label}</span>
              <span style={{ color: "var(--white)", fontWeight: 600 }}>
                {showBalance ? `₹${d.value.toFixed(2)}` : "••••"}
              </span>
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 6,
                background: "rgba(245,168,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${showBalance ? (d.value / max) * 100 : 15}%`,
                  borderRadius: 6,
                  background:
                    i === 0
                      ? "linear-gradient(to right, #E09700, #F5A800)"
                      : "linear-gradient(to right, rgba(245,168,0,0.35), rgba(245,168,0,0.6))",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function AIClassificationMonitor({ data }: { data: any }) {
  if (!data) return null;

  const trendIcon = (dir: string) => {
    if (dir === "up")
      return <span style={{ color: "#6EE7A0", fontSize: 11 }}>↑</span>;
    if (dir === "down")
      return (
        <span style={{ color: "rgba(255,100,100,0.8)", fontSize: 11 }}>↓</span>
      );
    return (
      <span style={{ color: "rgba(245,168,0,0.35)", fontSize: 11 }}>→</span>
    );
  };

  const trendColor = (dir: string) =>
    dir === "up"
      ? "#6EE7A0"
      : dir === "down"
        ? "rgba(255,100,100,0.8)"
        : "rgba(245,168,0,0.35)";

  // Color palette cycling for bars
  const barColors = [
    { fill: "var(--amber)", bg: "rgba(245,168,0,0.08)" },
    { fill: "rgba(110,231,160,0.85)", bg: "rgba(110,231,160,0.08)" },
    { fill: "rgba(148,130,255,0.85)", bg: "rgba(148,130,255,0.08)" },
    { fill: "rgba(96,200,255,0.85)", bg: "rgba(96,200,255,0.08)" },
    { fill: "rgba(255,168,96,0.85)", bg: "rgba(255,168,96,0.08)" },
  ];

  const { count, trend: hTrend } = data.transactionsProcessed;

  return (
    <div className={styles["chart-card"]}>
      {/* Header */}
      <div className={styles["chart-title"]} style={{ marginBottom: 18 }}>
        AI Classification Monitor
      </div>

      {/* Hero metric */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "var(--white)",
            lineHeight: 1,
          }}
        >
          {count}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 600,
            color: trendColor(hTrend.direction),
            marginBottom: 5,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {trendIcon(hTrend.direction)} {hTrend.value}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(245,168,0,0.45)",
          fontFamily: "'Outfit',sans-serif",
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        Transactions Processed
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(245,168,0,0.1)",
          marginBottom: 20,
        }}
      />

      {/* Source rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.sources.map((source: any, i: number) => {
          const { fill, bg } = barColors[i % barColors.length];
          return (
            <div key={source.label}>
              {/* Label row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Color dot */}
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: fill,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      fontFamily: "'Outfit',sans-serif",
                      color: "rgba(255,252,240,0.75)",
                      fontWeight: 500,
                    }}
                  >
                    {source.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'Outfit',sans-serif",
                      color: trendColor(source.trend.direction),
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {trendIcon(source.trend.direction)} {source.trend.value}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontFamily: "'Outfit',sans-serif",
                      fontWeight: 700,
                      color: "var(--white)",
                      minWidth: 38,
                      textAlign: "right",
                    }}
                  >
                    {source.pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: bg,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${source.pct}%`,
                    borderRadius: 999,
                    background: fill,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 14,
          borderTop: "1px solid rgba(245,168,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(245,168,0,0.35)",
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 700,
          }}
        >
          {data.sources.length} classification sources
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "'Outfit',sans-serif",
            color: "rgba(245,168,0,0.45)",
          }}
        >
          Top:{" "}
          <span style={{ color: "var(--amber)", fontWeight: 700 }}>
            {data.sources[0]?.label}
          </span>{" "}
          {data.sources[0]?.pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function MerchantIntelligenceTable({ data }: { data: any }) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (!data?.merchants) return null;

  const merchants: any[] = data.merchants;

  const allSources = Array.from(new Set(merchants.map((m: any) => m.source)));
  const allCategories = Array.from(
    new Set(merchants.map((m: any) => m.category)),
  );

  const sourceMeta: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    semantic_ai: {
      label: "Semantic AI",
      color: "#F5A800",
      bg: "rgba(245,168,0,0.12)",
    },
    person_rule: {
      label: "Person Rule",
      color: "#6EE7A0",
      bg: "rgba(110,231,160,0.12)",
    },
    credit_rule: {
      label: "Credit Rule",
      color: "rgba(148,130,255,1)",
      bg: "rgba(148,130,255,0.12)",
    },
    keyword_rule: {
      label: "Keyword Rule",
      color: "rgba(96,200,255,1)",
      bg: "rgba(96,200,255,0.12)",
    },
    merchant_prior: {
      label: "Merchant Prior",
      color: "rgba(255,168,96,1)",
      bg: "rgba(255,168,96,0.12)",
    },
  };
  const getSource = (s: string) =>
    sourceMeta[s] ?? {
      label: s,
      color: "rgba(255,252,240,0.4)",
      bg: "rgba(255,255,255,0.06)",
    };

  const confColor = (c: number) =>
    c >= 90 ? "#6EE7A0" : c >= 60 ? "#F5A800" : "rgba(255,100,100,0.8)";
  const confBarColor = (c: number) =>
    c >= 90
      ? "rgba(110,231,160,0.75)"
      : c >= 60
        ? "rgba(245,168,0,0.8)"
        : "rgba(255,100,100,0.7)";

  const handleFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const q = search.trim().toLowerCase();
  const filtered = merchants.filter((m: any) => {
    if (sourceFilter !== "all" && m.source !== sourceFilter) return false;
    if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
    if (
      q &&
      !m.merchant.toLowerCase().includes(q) &&
      !m.category.toLowerCase().includes(q) &&
      !m.source.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const avgConf = merchants.length
    ? Math.round(
        merchants.reduce((s: number, m: any) => s + m.confidence, 0) /
          merchants.length,
      )
    : 0;
  const highConf = merchants.filter((m: any) => m.confidence >= 90).length;
  const lowConf = merchants.filter((m: any) => m.confidence < 60).length;

  const pillStyle = (
    active: boolean,
    color = "#F5A800",
  ): React.CSSProperties => ({
    padding: "4px 11px",
    borderRadius: 20,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: 11,
    fontFamily: "'Outfit',sans-serif",
    fontWeight: active ? 700 : 400,
    border: `1.5px solid ${active ? color : "rgba(245,168,0,0.18)"}`,
    background: active ? `${color}22` : "rgba(245,168,0,0.04)",
    color: active ? color : "rgba(255,252,240,0.38)",
  });

  const colHdrStyle: React.CSSProperties = {
    fontSize: 9.5,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(245,168,0,0.4)",
    fontWeight: 700,
    fontFamily: "'Outfit',sans-serif",
  };

  return (
    <div className={styles["chart-card"]}>
      {/* ── Header + KPIs ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <div>
          <div
            className={styles["chart-title"]}
            style={{ margin: 0, marginBottom: 3 }}
          >
            Merchant Intelligence
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(245,168,0,0.38)",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {merchants.length} merchants classified
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {[
            {
              label: "Avg conf",
              value: `${avgConf}%`,
              color: confColor(avgConf),
            },
            { label: "High ≥90", value: highConf, color: "#6EE7A0" },
            {
              label: "Low <60",
              value: lowConf,
              color: "rgba(255,100,100,0.8)",
            },
          ].map((k) => (
            <div
              key={k.label}
              style={{
                textAlign: "center",
                background: "rgba(245,168,0,0.05)",
                border: "1px solid rgba(245,168,0,0.12)",
                borderRadius: 8,
                padding: "5px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: k.color,
                  lineHeight: 1.2,
                }}
              >
                {k.value}
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  color: "rgba(245,168,0,0.38)",
                  fontFamily: "'Outfit',sans-serif",
                  marginTop: 2,
                }}
              >
                {k.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="rgba(245,168,0,0.4)"
          strokeWidth="1.5"
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <input
          type="text"
          value={search}
          placeholder="Search merchant, category, source…"
          onChange={(e) => handleFilter(() => setSearch(e.target.value))}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "rgba(245,168,0,0.07)",
            border: `1.5px solid ${search ? "rgba(245,168,0,0.5)" : "rgba(245,168,0,0.2)"}`,
            borderRadius: 8,
            color: "#FFFCF0",
            fontSize: 12,
            fontFamily: "'Outfit',sans-serif",
            padding: "8px 30px 8px 32px",
            outline: "none",
          }}
        />
        {search && (
          <button
            onClick={() => handleFilter(() => setSearch(""))}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "rgba(245,168,0,0.5)",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Source pills ── */}
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}
      >
        <button
          style={pillStyle(sourceFilter === "all")}
          onClick={() => handleFilter(() => setSourceFilter("all"))}
        >
          All sources
        </button>
        {allSources.map((s) => {
          const meta = getSource(s);
          return (
            <button
              key={s}
              style={pillStyle(sourceFilter === s, meta.color)}
              onClick={() => handleFilter(() => setSourceFilter(s))}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: meta.color,
                  marginRight: 5,
                  verticalAlign: "middle",
                }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* ── Category pills ── */}
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}
      >
        <button
          style={pillStyle(categoryFilter === "all")}
          onClick={() => handleFilter(() => setCategoryFilter("all"))}
        >
          All categories
        </button>
        {allCategories.map((c) => (
          <button
            key={c}
            style={pillStyle(categoryFilter === c)}
            onClick={() => handleFilter(() => setCategoryFilter(c))}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Column headers ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 88px",
          gap: 10,
          padding: "0 8px 6px",
        }}
      >
        <div style={colHdrStyle}>Merchant</div>
        <div style={colHdrStyle}>Category</div>
        <div style={colHdrStyle}>Source</div>
        <div style={{ ...colHdrStyle, textAlign: "right" }}>Confidence</div>
      </div>

      {/* ── Rows ── */}
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {pageSlice.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "white",
              fontSize: 15,
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            No merchants match your filters
          </div>
        ) : (
          pageSlice.map((m: any, i: number) => {
            const src = getSource(m.source);
            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 88px",
                  gap: 10,
                  padding: "9px 8px",
                  borderRadius: 7,
                  alignItems: "center",
                  borderBottom: "1px solid rgba(245,168,0,0.07)",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(245,168,0,0.02)",
                }}
              >
                {/* Merchant */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: "rgba(245,168,0,0.1)",
                      border: "1px solid rgba(245,168,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#F5A800",
                    }}
                  >
                    {m.merchant.charAt(0).toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "rgba(255,252,240,0.8)",
                      fontFamily: "'Outfit',sans-serif",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.merchant}
                  </span>
                </div>

                {/* Category */}
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,252,240,0.5)",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  {m.category}
                </div>

                {/* Source badge */}
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "'Outfit',sans-serif",
                      fontWeight: 600,
                      color: src.color,
                      background: src.bg,
                      border: `1px solid ${src.color}30`,
                      borderRadius: 20,
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {src.label}
                  </span>
                </div>

                {/* Confidence */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: confColor(m.confidence),
                      fontFamily: "'Outfit',sans-serif",
                      marginBottom: 4,
                    }}
                  >
                    {m.confidence}%
                  </div>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 999,
                      background: "rgba(245,168,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${m.confidence}%`,
                        borderRadius: 999,
                        background: confBarColor(m.confidence),
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(245,168,0,0.1)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(245,168,0,0.38)",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {filtered.length} results · page{" "}
            <span style={{ color: "#F5A800", fontWeight: 700 }}>
              {safePage}
            </span>{" "}
            of {totalPages}
          </span>
          <div style={{ display: "flex", gap: 7 }}>
            {(
              [
                {
                  label: "← Prev",
                  disabled: safePage === 1,
                  fn: () => setPage((p) => p - 1),
                },
                {
                  label: "Next →",
                  disabled: safePage === totalPages,
                  fn: () => setPage((p) => p + 1),
                },
              ] as const
            ).map((btn) => (
              <button
                key={btn.label}
                onClick={btn.fn}
                disabled={btn.disabled}
                style={{
                  padding: "5px 13px",
                  borderRadius: 7,
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "rgba(245,168,0,0.07)",
                  border: "1.5px solid rgba(245,168,0,0.22)",
                  color: btn.disabled ? "rgba(245,168,0,0.2)" : "#F5A800",
                  opacity: btn.disabled ? 0.5 : 1,
                  cursor: btn.disabled ? "not-allowed" : "pointer",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
// ─── MAIN COMPONENT INTERFACE ───────────────────────────────────────────────
interface AnalyticsTabProps {
  analytics: ReturnType<typeof useAnalytics>;
  merchantIntelligence: ReturnType<typeof useMerchantIntelligence>;
  aiClassification: ReturnType<typeof useAIClassification>;
  showBalance: boolean;
}

export default function AnalyticsTab({
  analytics,
  merchantIntelligence,
  aiClassification,
  showBalance,
}: AnalyticsTabProps) {
  if (analytics.loading) {
    return <LoadingState rows={4} label="Loading analytics…" />;
  }

  if (analytics.error) {
    return (
      <ErrorState
        error={analytics.error}
        onRetry={analytics.refetch}
        label="Could not load analytics"
      />
    );
  }

  if (!analytics.data) {
    return null;
  }
  console.log("MERCHANTS", merchantIntelligence.data);

  console.log("AI CLASSIFICATION", aiClassification.data);
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Avg Daily Spend", value: analytics.data.kpi.avgDailySpend },
          { label: "Top Category", value: analytics.data.kpi.topCategory },
          { label: "Savings Rate", value: analytics.data.kpi.savingsRate },
        ].map((card, i) => (
          <div key={i} className={styles["stat-card"]}>
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
                fontSize: 20,
                fontWeight: 800,
                color: "var(--white)",
                letterSpacing: "-0.03em",
              }}
            >
              {showBalance ? card.value : "••••••"} {/* ← wrap */}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: 18,
          marginBottom: 18,
        }}
      >
        <CategoryPieChart
          data={analytics.data.categoryPie}
          showBalance={showBalance}
        />
        <MonthlyTrendLineChart
          data={analytics.data.monthlyTrend}
          showBalance={showBalance}
        />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}
      >
        <IncomeExpenseBarChart
          data={analytics.data.incomeExpense}
          showBalance={showBalance}
        />
        <TopMerchantsBarChart
          data={analytics.data.topMerchants}
          showBalance={showBalance}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 18,
        }}
      >
        <AIClassificationMonitor data={aiClassification.data} />

        <MerchantIntelligenceTable data={merchantIntelligence.data} />
      </div>
    </div>
  );
}
