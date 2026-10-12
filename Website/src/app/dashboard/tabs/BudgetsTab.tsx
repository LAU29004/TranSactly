"use client";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { budgetService } from "../../../services/budgetService";
import {
  Budget,
  BudgetCategoryLimit,
  BudgetSummary,
  CategoryPieItem,
} from "../../../types/Api.types";
import styles from "../Dashboard.module.css";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const labelStyle: React.CSSProperties = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(245,168,0,0.5)",
  fontWeight: 700,
  display: "block",
  marginBottom: 7,
};
const inputStyle: React.CSSProperties = {
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
  colorScheme: "dark",
};
const primaryBtn: React.CSSProperties = {
  padding: "10px 22px",
  borderRadius: 9,
  cursor: "pointer",
  fontFamily: "'Outfit',sans-serif",
  fontSize: 13,
  fontWeight: 700,
  background: "#F5A800",
  border: "2px solid #0E0920",
  color: "#1A1033",
  boxShadow: "3px 3px 0 #0E0920",
};
const ghostBtn: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 9,
  cursor: "pointer",
  fontFamily: "'Outfit',sans-serif",
  fontSize: 13,
  fontWeight: 600,
  background: "rgba(245,168,0,0.07)",
  border: "1.5px solid rgba(245,168,0,0.2)",
  color: "rgba(255,252,240,0.6)",
};

const barColor = (pct: number) =>
  pct >= 100 ? "#F87171" : pct >= 80 ? "#F5A800" : "#6EE7A0";

// ─── Create modal ────────────────────────────────────────────────────────────

function BudgetFormModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rows, setRows] = useState<BudgetCategoryLimit[]>([
    { category: categories[0] ?? "", limit: 0 },
  ]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const total = rows.reduce((s, r) => s + (Number(r.limit) || 0), 0);

  const setRow = (i: number, patch: Partial<BudgetCategoryLimit>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  async function save() {
    if (!name.trim() || !start || !end)
      return setError("Fill in name and dates.");
    if (new Date(end) <= new Date(start))
      return setError("End date must be after start date.");
    if (total <= 0) return setError("Add at least one category limit.");
    const cats = rows.map((r) => r.category);
    if (new Set(cats).size !== cats.length)
      return setError("Each category can only be added once.");
    setError("");
    setSaving(true);
    try {
      await budgetService.createBudget({
        name: name.trim(),
        startDate: start,
        endDate: end,
        totalAmount: total,
        categories: rows,
        alertThresholds: [80, 100],
        emailAlerts: false,
      });
      onCreated();
      onClose();
    } catch {
      setError("Could not save the budget. Try again.");
      setSaving(false);
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
          width: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "8px 8px 0 #0E0920",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: "#FFFCF0",
          }}
        >
          New Budget
        </div>

        <div>
          <label style={labelStyle}>Budget Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. October Budget"
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label style={labelStyle}>Start Date *</label>
            <input
              type="date"
              style={inputStyle}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>End Date *</label>
            <input
              type="date"
              style={inputStyle}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Category Limits (Rs.)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <select
                  style={{ ...inputStyle, flex: 1, colorScheme: "dark" }}
                  value={r.category}
                  onChange={(e) => setRow(i, { category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option
                      key={c}
                      value={c}
                      style={{ background: "#1A1033", color: "#FFFCF0" }}
                    >
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  style={{ ...inputStyle, width: 120 }}
                  value={r.limit || ""}
                  placeholder="0"
                  onChange={(e) => setRow(i, { limit: Number(e.target.value) })}
                />
                {rows.length > 1 && (
                  <button
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                    style={{ ...ghostBtn, padding: "0 12px" }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setRows([
                ...rows,
                {
                  category:
                    categories.find(
                      (c) => !rows.some((r) => r.category === c),
                    ) ?? categories[0],
                  limit: 0,
                },
              ])
            }
            style={{
              ...ghostBtn,
              marginTop: 10,
              padding: "7px 14px",
              fontSize: 12,
            }}
          >
            + Add category
          </button>
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "#F5A800",
              fontWeight: 700,
            }}
          >
            Total budget: Rs.{fmt(total)}
          </div>
        </div>

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: 13,
            color: "rgba(255,252,240,0.7)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
          />
          Show alerts at 80% and 100% of a limit
        </label>

        {error && <div style={{ color: "#F87171", fontSize: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pie ─────────────────────────────────────────────────────────────────────

function PieCard({ title, data }: { title: string; data: CategoryPieItem[] }) {
  return (
    <div
      className={styles["stat-card"]}
      style={{ flex: 1, minWidth: 280, height: 340 }}
    >
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 14,
          fontWeight: 800,
          color: "var(--white)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={55}
            outerRadius={95}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `Rs.${fmt(Number(v ?? 0))}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Detail ──────────────────────────────────────────────────────────────────

function BudgetDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [s, setS] = useState<BudgetSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    budgetService
      .getBudgetSummary(id)
      .then(setS)
      .catch(() => setFailed(true));
  }, [id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        onClick={onBack}
        style={{ ...ghostBtn, alignSelf: "flex-start", color: "#1A1033" }}
      >
        ← Back to budgets
      </button>

      {s && (
        <button
          onClick={async () => {
            if (confirm("Delete this budget?")) {
              await budgetService.deleteBudget(id);
              onBack();
            }
          }}
          style={{ ...ghostBtn, alignSelf: "flex-start", color: "#B91C1C" }}
        >
          Delete budget
        </button>
      )}

      {failed && (
        <div style={{ color: "#B91C1C" }}>Could not load this budget.</div>
      )}
      {!s && !failed && <div style={{ color: "#1A1033" }}>Loading…</div>}

      {s && (
        <>
          <div className={styles["stat-card"]}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: "var(--white)",
              }}
            >
              {s.budget.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(245,168,0,0.5)",
                margin: "4px 0 14px",
              }}
            >
              {s.budget.startDate} → {s.budget.endDate} · {s.daysLeft} days left
            </div>

              {s.categories
                .filter((c) => c.percentUsed >= 80)
                .map((c) => (
                  <div
                    key={c.category}
                    style={{
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.percentUsed >= 100 ? "#F87171" : "#F5A800",
                    }}
                  >
                    {c.percentUsed >= 100
                      ? `⚠ ${c.category} is over its limit by Rs.${fmt(c.spent - c.limit)}`
                      : `⚠ ${c.category} is at ${c.percentUsed}% of its limit`}
                  </div>
                ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "rgba(255,252,240,0.7)",
                  marginBottom: 6,
                }}
              >
                <span>
                  Rs.{fmt(s.totalSpent)} spent of Rs.{fmt(s.budget.totalAmount)}
                </span>
                <span
                  style={{ color: barColor(s.percentUsed), fontWeight: 700 }}
                >
                  {s.percentUsed}%
                </span>
              </div>
            <div
              style={{
                height: 12,
                borderRadius: 7,
                background: "rgba(245,168,0,0.08)",
                border: "1px solid rgba(245,168,0,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(s.percentUsed, 100)}%`,
                  background: barColor(s.percentUsed),
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          <div
            className={styles["stat-card"]}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {s.categories.map((c) => (
              <div key={c.category}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    color: "rgba(255,252,240,0.7)",
                    marginBottom: 5,
                  }}
                >
                  <span>{c.category}</span>
                  <span>
                    Rs.{fmt(c.spent)} / Rs.{fmt(c.limit)}
                  </span>
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
                      width: `${Math.min(c.percentUsed, 100)}%`,
                      background: barColor(c.percentUsed),
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <PieCard title="Planned (limits)" data={s.plannedPie} />
            <PieCard title="Actual (spent)" data={s.actualPie} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export default function BudgetsTab() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    budgetService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);
  const load = () =>
    budgetService
      .getBudgets()
      .then((r) => {
        setBudgets(r.budgets);
        setLoadError("");
      })
      .catch(() =>
        setLoadError("Couldn't refresh budgets. Reload to try again."),
      )
      .finally(() => setLoading(false));

      useEffect(() => {
  console.log("TOKEN:", localStorage.getItem("auth_token"));
}, []);
  useEffect(() => {
    load();
  }, []);

  if (selectedId)
    return <BudgetDetail id={selectedId} onBack={() => setSelectedId(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <button
          onClick={() => setShowForm(true)}
          disabled={categories.length === 0}
          style={{ ...primaryBtn, opacity: categories.length === 0 ? 0.5 : 1 }}
        >
          + New budget
        </button>
        <button
  onClick={() => {
    navigator.clipboard.writeText(localStorage.getItem("auth_token") ?? "");
    alert("Token copied");
  }}
  style={{ ...ghostBtn, marginLeft: 8, color: "#1A1033" }}
>
  Copy token
</button>
        {loadError && (
          <div style={{ color: "#B91C1C", fontSize: 12, marginTop: 8 }}>
            {loadError}
          </div>
        )}
      </div>

      {loading && <div style={{ color: "#1A1033" }}>Loading…</div>}
      {!loading && budgets.length === 0 && (
        <div style={{ color: "#1A1033" }}>
          No budgets yet. Create one to start tracking.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {budgets.map((b) => (
          <div
            key={b.id}
            className={styles["stat-card"]}
            onClick={() => setSelectedId(b.id)}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: "var(--white)",
              }}
            >
              {b.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(245,168,0,0.5)",
                margin: "4px 0 12px",
              }}
            >
              {b.startDate} → {b.endDate}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--white)",
                }}
              >
                Rs.{fmt(b.totalAmount)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color:
                    b.status === "exceeded"
                      ? "#F87171"
                      : b.status === "completed"
                        ? "#6EE7A0"
                        : "#F5A800",
                }}
              >
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <BudgetFormModal
          categories={categories}
          onClose={() => setShowForm(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
