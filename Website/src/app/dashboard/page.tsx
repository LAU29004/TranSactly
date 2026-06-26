"use client";
import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/utils/auth";
import QRCode from "react-qr-code";
import Image from "next/image";
// ─── Services / Hooks ────────────────────────────────────────────────────────
import {
  useDashboard,
  useTransactions,
  useAnalytics,
  useMerchantIntelligence,
  useAIClassification,
} from "../../hooks/useServices";
import {
  LoadingState,
  ErrorState,
  LoadingDots,
} from "../../components/LoadingState";

// ─── Types ───────────────────────────────────────────────────────────────────
import {
  Period,
  Goal,
  InsightType,
  AIInsight,
  Transaction,
} from "../../types/Api.types";

// ─── Sub-components (API-driven versions) ────────────────────────────────────
import AIAssistantTrigger from "./assistant/AIAssistantTrigger";
import Sidebar, { type Tab } from "../../components/Sidebar";
import OverviewTab from "../dashboard/tabs/OverviewTab";
import TransactionsTab from "./tabs/TransactionsTab";
import SubscriptionsTab from "./SubscriptionsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import styles from "./Dashboard.module.css";

// ─── STATIC LOOKUP TABLES (non-data — styling only) ──────────────────────────
const PERIOD_LABELS: Record<Period, string> = {
  month: "This Month",
  "6months": "6 Months",
  "1year": "1 Year",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

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

// ─── INSIGHT COMPONENTS ──────────────────────────────────────────────────────

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

// ─── GOALS TAB ───────────────────────────────────────────────────────────────

const modalLabelStyle: React.CSSProperties = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(245,168,0,0.5)",
  fontWeight: 700,
  display: "block",
  marginBottom: 7,
};
const modalInputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(245,168,0,0.06)",
  border: "1.5px solid rgba(245,168,0,0.22)",
  borderRadius: 9,
  color: "#FFFCF0",
  fontSize: 13,
  fontFamily: "'Outfit',sans-serif",
  padding: "10px 13px",
  outline: "none",
  boxSizing: "border-box",
};

function GoalCard({
  goal,
  onDelete,
  onEdit,
}: {
  goal: Goal;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
}) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const remaining = Math.max(0, goal.target - goal.current);
  const complete = pct >= 100;
  return (
    <div
      className={styles["stat-card"]}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          display: "flex",
          gap: 6,
        }}
      >
        <button
          onClick={() => onEdit(goal)}
          title="Edit goal"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            cursor: "pointer",
            background: "rgba(245,168,0,0.08)",
            border: "1.5px solid rgba(245,168,0,0.2)",
            color: "rgba(245,168,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M11.5 2.5a1.41 1.41 0 012 2L5 13H2v-3L11.5 2.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          title="Delete goal"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            cursor: "pointer",
            background: "rgba(255,80,80,0.07)",
            border: "1.5px solid rgba(255,80,80,0.2)",
            color: "rgba(255,120,120,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" />
          </svg>
        </button>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "rgba(245,168,0,0.1)",
              border: "1.5px solid rgba(245,168,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {goal.icon}
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: "var(--white)",
              letterSpacing: "-0.02em",
              paddingRight: 64,
            }}
          >
            {goal.title}
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(245,168,0,0.45)",
            paddingLeft: 40,
          }}
        >
          {goal.deadline}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(245,168,0,0.45)",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Current
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: complete ? "var(--amber3)" : "var(--white)",
              letterSpacing: "-0.03em",
            }}
          >
            ${fmtMoney(goal.current)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(245,168,0,0.45)",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Target
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "rgba(255,252,240,0.55)",
              letterSpacing: "-0.02em",
            }}
          >
            ${fmtMoney(goal.target)}
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            height: 12,
            borderRadius: 7,
            background: "rgba(245,168,0,0.08)",
            border: "1px solid rgba(245,168,0,0.15)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 6,
              background: complete
                ? "linear-gradient(to right, #4CAF7D, #6EE7A0)"
                : "linear-gradient(to right, #E09700, #F5A800)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 9,
          }}
        >
          <span
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: complete ? "#6EE7A0" : "var(--amber3)",
              letterSpacing: "-0.01em",
            }}
          >
            {pct}% complete
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,252,240,0.35)" }}>
            {complete ? "Goal reached 🎉" : `$${fmtMoney(remaining)} to go`}
          </span>
        </div>
      </div>
      {goal.note && (
        <div
          style={{
            fontSize: 11.5,
            lineHeight: 1.6,
            color: "rgba(255,252,240,0.4)",
            paddingTop: 12,
            borderTop: "1px solid rgba(245,168,0,0.08)",
          }}
        >
          {goal.note}
        </div>
      )}
    </div>
  );
}

const ICON_OPTIONS = [
  "🎯", "💻", "✈️", "🏠", "🛟", "🚗", "📱", "💪", "🎓", "💍", "🌴", "🎸",
];

function GoalFormModal({
  initial,
  onClose,
  onSave,
  title: modalTitle,
}: {
  initial?: Goal;
  onClose: () => void;
  onSave: (g: Omit<Goal, "id"> & { id?: string }) => void;
  title: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "🎯");
  const [target, setTarget] = useState(String(initial?.target ?? ""));
  const [current, setCurrent] = useState(String(initial?.current ?? ""));
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const overlayRef = useRef<HTMLDivElement>(null);
  const canSave = title.trim() && target;
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...(initial ? { id: initial.id } : {}),
      title: title.trim(),
      icon,
      target: parseFloat(target),
      current: parseFloat(current) || 0,
      deadline: deadline.trim() || "No deadline set",
      note: note.trim(),
    });
    onClose();
  };
  const t = parseFloat(target) || 0,
    c = parseFloat(current) || 0;
  const pct = t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;
  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(14,9,32,0.72)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1A1033",
          border: "2px solid rgba(245,168,0,0.3)",
          borderRadius: 18,
          padding: "28px 30px",
          width: 480,
          boxShadow: "8px 8px 0 #0E0920",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "#FFFCF0",
              letterSpacing: "-0.03em",
            }}
          >
            {modalTitle}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(245,168,0,0.08)",
              border: "1.5px solid rgba(245,168,0,0.2)",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              color: "rgba(255,252,240,0.5)",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <div>
          <label style={modalLabelStyle}>Choose Icon</label>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}
          >
            {ICON_OPTIONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  fontSize: 18,
                  cursor: "pointer",
                  border:
                    icon === ic
                      ? "2px solid #F5A800"
                      : "1.5px solid rgba(245,168,0,0.18)",
                  background:
                    icon === ic
                      ? "rgba(245,168,0,0.18)"
                      : "rgba(245,168,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={modalLabelStyle}>Goal Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Laptop, Vacation Fund…"
            style={modalInputStyle}
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label style={modalLabelStyle}>Target Amount ($) *</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="5000"
              style={modalInputStyle}
            />
          </div>
          <div>
            <label style={modalLabelStyle}>Amount Saved ($)</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0"
              style={modalInputStyle}
            />
          </div>
        </div>
        <div>
          <label style={modalLabelStyle}>Deadline / Label</label>
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g. Target: Jun 2025"
            style={modalInputStyle}
          />
        </div>
        <div>
          <label style={modalLabelStyle}>Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's this goal for?"
            rows={2}
            style={{ ...modalInputStyle, resize: "none", lineHeight: 1.5 }}
          />
        </div>
        <div
          style={{
            background: "rgba(245,168,0,0.04)",
            border: "1px solid rgba(245,168,0,0.12)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(245,168,0,0.4)",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Progress Preview
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 5,
              background: "rgba(245,168,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 5,
                background:
                  pct >= 100
                    ? "linear-gradient(to right,#4CAF7D,#6EE7A0)"
                    : "linear-gradient(to right,#E09700,#F5A800)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div
            style={{ fontSize: 11, color: "rgba(245,168,0,0.5)", marginTop: 6 }}
          >
            {pct}% complete · ${fmtMoney(Math.max(0, t - c))} remaining
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            paddingTop: 4,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
              fontSize: 13,
              fontWeight: 600,
              background: "rgba(245,168,0,0.07)",
              border: "1.5px solid rgba(245,168,0,0.2)",
              color: "rgba(255,252,240,0.45)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: "10px 22px",
              borderRadius: 9,
              cursor: canSave ? "pointer" : "not-allowed",
              fontFamily: "'Outfit',sans-serif",
              fontSize: 13,
              fontWeight: 700,
              background: canSave ? "#F5A800" : "rgba(245,168,0,0.2)",
              border: "2px solid #0E0920",
              color: canSave ? "#1A1033" : "rgba(255,252,240,0.25)",
              boxShadow: canSave ? "3px 3px 0 #0E0920" : "none",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOGGED OUT SCREEN ────────────────────────────────────────────────────────

function LoggedOut({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5A800",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 22,
          fontWeight: 800,
          color: "#1A1033",
          letterSpacing: "-0.03em",
        }}
      >
        You've been logged out
      </div>
      <div style={{ fontSize: 13, color: "rgba(14,9,32,0.55)" }}>
        See you next time, Alex.
      </div>
      <button
        onClick={onBack}
        style={{
          marginTop: 8,
          background: "#1A1033",
          color: "#F5A800",
          fontFamily: "'Outfit',sans-serif",
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 24px",
          borderRadius: 8,
          border: "2px solid #0E0920",
          cursor: "pointer",
          boxShadow: "3px 3px 0 #0E0920",
        }}
      >
        ← Back to login
      </button>
    </div>
  );
}

// ─── MAIN DASHBOARD包装器 ───────────────────────────────────────────────────────

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tabParam = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = [
    "overview",
    "transactions",
    "analytics",
    "subscriptions",
  ];
  
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>("month");
  
  // New state container variable for handling the app download sync popup
  const [showSyncPopup, setShowSyncPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // Handle detection of new user query parameter parameter strings
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setShowSyncPopup(true);
      
      // Clear "?new=true" from route bar elegantly without causing reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      const currentTab = params.get("tab") || "overview";
      router.replace(`/dashboard?tab=${currentTab}`, { scroll: false });
    }
  }, [searchParams, router]);

  // ── API calls ───────────────────────────────────────────────────────────────
  const dashboard = useDashboard(activePeriod); // overview tab
  const transactions = useTransactions(); // transactions tab
  const analytics = useAnalytics(activePeriod); // analytics tab
  const merchantIntelligence = useMerchantIntelligence(activePeriod);
  const aiClassification = useAIClassification(activePeriod);
  
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab)
      setActiveTab(tabParam);
  }, [tabParam]);

  const handleNavigate = (tab: Tab) => {
    if (tab === "assistant") {
      router.push("/dashboard/assistant");
      return;
    }
    setActiveTab(tab);
    router.push(`/dashboard?tab=${tab}`, { scroll: false });
  };

  if (loggedOut) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#F5A800" }}>
        <LoggedOut onBack={() => setLoggedOut(false)} />
      </div>
    );
  }

  return (
    <div className={styles["db-root"]}>
      <div className={styles["db-dot-field"]} />
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogout={() => {
          auth.logout();
          router.push("/");
        }}
      />

      <main className={styles["db-main"]}>
        {/* ── Page header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "var(--navy)",
                lineHeight: 1.1,
                letterSpacing: "-0.035em",
                position: "relative",
                display: "inline-block",
                paddingBottom: 8,
              }}
            >
              {activeTab === "overview"
                ? "Welcome Back, Alex"
                : activeTab === "transactions"
                  ? "Transactions"
                  : activeTab === "analytics"
                    ? "Analytics"
                    : "Subscriptions"}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "60%",
                  height: 4,
                  background: "var(--ink)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgb(14,9,32)",
                marginTop: 10,
                letterSpacing: "0.04em",
              }}
            >
              {activeTab === "overview"
                ? "Your AI Financial Copilot"
                : activeTab === "transactions"
                  ? "All your recent financial activity"
                  : activeTab === "analytics"
                    ? "Trends, patterns, and deeper financial insights"
                    : "Track recurring payments and renewal schedules"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {(activeTab === "overview" || activeTab === "analytics") && (
              <>
                <AIAssistantTrigger />
                <div
                  style={{
                    width: 1,
                    height: 28,
                    background: "rgba(26,16,51,0.2)",
                  }}
                />
                <PeriodChips
                  activePeriod={activePeriod}
                  onChange={setActivePeriod}
                />
                <div
                  style={{
                    width: 1,
                    height: 28,
                    background: "rgba(26,16,51,0.2)",
                  }}
                />
                <button
                  className="btn-secondary"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="8" cy="8" r="3" />
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                  </svg>
                  {showBalance ? "Hide" : "Show"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ════════ OVERVIEW ════════ */}
        {activeTab === "overview" && (
          <OverviewTab
            dashboard={dashboard}
            activePeriod={activePeriod}
            showBalance={showBalance}
            onViewAllTransactions={() => handleNavigate("transactions")}
          />
        )}

        {/* ════════ TRANSACTIONS ════════ */}
        {activeTab === "transactions" && (
          <TransactionsTab transactions={transactions} />
        )}
        
        {/* ════════ ANALYTICS ════════ */}
        {activeTab === "analytics" && (
          <AnalyticsTab
            analytics={analytics}
            merchantIntelligence={merchantIntelligence}
            aiClassification={aiClassification}
            showBalance={showBalance}
          />
        )}
        
        {/* ════════ SUBSCRIPTIONS ════════ */}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
      </main>

      {/* ════════ AUTOMATED BANK LIVE SYNC POPUP MODAL ════════ */}
      {showSyncPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(14,9,32,0.72)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#1A1033", // Matching backend profile/modal setup container color
              border: "2px solid rgba(245,168,0,0.3)",
              borderRadius: 18,
              padding: "32px",
              width: "420px",
              maxWidth: "90%",
              boxShadow: "8px 8px 0 #0E0920",
              textAlign: "center",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* SVG Cross Dismiss Icon Button */}
            <button
              onClick={() => setShowSyncPopup(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(245,168,0,0.08)",
                border: "1.5px solid rgba(245,168,0,0.2)",
                borderRadius: 8,
                width: 30,
                height: 30,
                cursor: "pointer",
                color: "rgba(255,252,240,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#FFFCF0",
                letterSpacing: "-0.02em",
                marginTop: 8,
              }}
            >
              Sync Your Transactions
            </h2>
            
            <p
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontSize: 13,
                lineHeight: 1.5,
                color: "rgba(255,252,240,0.6)",
                padding: "0 8px",
              }}
            >
              Scan this QR code to download our mobile app and setup secure, live automatic synchronization for your bank statement lines.
            </p>

            <div
              style={{
                background: "rgba(245,168,0,0.05)",
                border: "1.5px solid rgba(245,168,0,0.2)",
                borderRadius: 12,
                padding: "16px",
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCode
                value="https://github.com/LAU29004/TranSactly/releases/download/v1.0.0/CentFluence-v1.0.0.apk"
                size={220}
              />
            </div>

            <button
              onClick={() => setShowSyncPopup(false)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "12px 24px",
                borderRadius: 9,
                fontFamily: "'Outfit',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                background: "#F5A800",
                border: "2px solid #0E0920",
                color: "#1A1033",
                cursor: "pointer",
                boxShadow: "3px 3px 0 #0E0920",
                transition: "transform 0.1s ease",
              }}
            >
              Got it, let's explore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

