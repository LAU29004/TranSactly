"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTransactions } from "../../../hooks/useServices";
import { LoadingState, ErrorState } from "../../../components/LoadingState";
import { Transaction } from "../../../types/Api.types";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "../Dashboard.module.css";

// ─── STATIC LOOKUP TABLES & TYPES ──────────────────────────────────────────
const ALL_CATEGORY_FILTER = "All";
type TxType = "all" | "credit" | "debit";
const PAGE_SIZE = 10;

interface FilterState {
  search: string;
  category: string;
  txType: TxType;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface TransactionsTabProps {
  transactions: ReturnType<typeof useTransactions>;
}

// ─── PRESENTATIONAL HELPERS ──────────────────────────────────────────────────
const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

const sameDay = (a: Date | null, b: Date | null) =>
  !!(
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────
const calNavStyle: React.CSSProperties = {
  background: "none",
  border: "1.5px solid rgba(245,168,0,0.25)",
  borderRadius: 6,
  color: "#F5A800",
  fontSize: 16,
  width: 28,
  height: 28,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ─── CALENDAR SUB-COMPONENTS ─────────────────────────────────────────────────
function YearSelector({
  year,
  onSelect,
  onClose,
}: {
  year: number;
  onSelect: (y: number) => void;
  onClose: () => void;
}) {
  const currentYear = new Date().getFullYear();
  // Show a range: 10 years back, 3 years forward
  const years = Array.from({ length: 14 }, (_, i) => currentYear + 3 - i);
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#2C1D55",
        border: "1.5px solid rgba(245,168,0,0.35)",
        borderRadius: 10,
        boxShadow: "6px 6px 0 #0E0920",
        zIndex: 200,
        padding: 8,
        minWidth: 120,
      }}
    >
      <div
        style={{
          maxHeight: 180,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {years.map((y) => (
          <button
            key={y}
            onClick={() => {
              onSelect(y);
              onClose();
            }}
            style={{
              background: y === year ? "rgba(245,168,0,0.2)" : "none",
              border:
                y === year
                  ? "1px solid rgba(245,168,0,0.5)"
                  : "1px solid transparent",
              borderRadius: 6,
              color: y === year ? "#F5A800" : "rgba(255,252,240,0.7)",
              fontSize: 12,
              fontFamily: "'Outfit',sans-serif",
              fontWeight: y === year ? 700 : 400,
              padding: "5px 14px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthYearPicker({
  year,
  month,
  onSelect,
  onClose,
}: {
  year: number;
  month: number;
  onSelect: (y: number, m: number) => void;
  onClose: () => void;
}) {
  const [pickerYear, setPickerYear] = useState(year);
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 14 }, (_, i) => currentYear + 3 - i);
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#2C1D55",
        border: "2px solid rgba(245,168,0,0.3)",
        borderRadius: 12,
        boxShadow: "6px 6px 0 #0E0920",
        zIndex: 300,
        padding: 14,
        minWidth: 240,
      }}
    >
      {/* Year selector row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <button onClick={() => setPickerYear((y) => y - 1)} style={calNavStyle}>
          ‹
        </button>
        <select
          value={pickerYear}
          onChange={(e) => setPickerYear(Number(e.target.value))}
          style={{
            background: "rgba(245,168,0,0.1)",
            border: "1px solid rgba(245,168,0,0.3)",
            borderRadius: 6,
            color: "#FFFCF0",
            fontSize: 13,
            fontFamily: "'Syne',sans-serif",
            fontWeight: 700,
            padding: "3px 8px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {years.map((y) => (
            <option key={y} value={y} style={{ background: "#1A1033" }}>
              {y}
            </option>
          ))}
        </select>
        <button onClick={() => setPickerYear((y) => y + 1)} style={calNavStyle}>
          ›
        </button>
      </div>
      {/* Month grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 4,
        }}
      >
        {MONTHS.map((m, i) => {
          const active = i === month && pickerYear === year;
          return (
            <button
              key={m}
              onClick={() => {
                onSelect(pickerYear, i);
                onClose();
              }}
              style={{
                padding: "7px 4px",
                borderRadius: 7,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                background: active
                  ? "rgba(245,168,0,0.22)"
                  : "rgba(255,255,255,0.03)",
                border: active
                  ? "1.5px solid rgba(245,168,0,0.55)"
                  : "1.5px solid transparent",
                color: active ? "#F5A800" : "rgba(255,252,240,0.6)",
              }}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Calendar({
  dateFrom,
  dateTo,
  onPick,
  onPreset,
  onClear,
}: {
  dateFrom: Date | null;
  dateTo: Date | null;
  onPick: (d: Date) => void;
  onPreset: (days: number) => void;
  onClear: () => void;
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [hovered, setHovered] = useState<Date | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  const first = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startDow = first.getDay();
  const monthName = first.toLocaleString("default", { month: "long" });

  const navMonth = (dir: number) => {
    let m = calMonth + dir,
      y = calYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setCalMonth(m);
    setCalYear(y);
  };

  const days: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(calYear, calMonth, i + 1),
    ),
  ];

  const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Determine effective range end for hover preview
  const rangeEnd = dateFrom && !dateTo && hovered ? hovered : dateTo;

  return (
    <div
      style={{
        background: "#2C1D55",
        border: "2px solid rgba(245,168,0,0.3)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "6px 6px 0 #0E0920",
        minWidth: 280,
      }}
    >
      {/* Month/Year Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          position: "relative",
        }}
      >
        <button onClick={() => navMonth(-1)} style={calNavStyle}>
          ‹
        </button>

        {/* Clickable month+year label → opens MonthYearPicker */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowMonthYearPicker((o) => !o);
              setShowYearPicker(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: "#FFFCF0",
            }}
          >
            {monthName}&nbsp;
            {/* Clickable year → opens year dropdown */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowYearPicker((o) => !o);
                setShowMonthYearPicker(false);
              }}
              style={{
                color: "#F5A800",
                textDecoration: "underline dotted",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              {calYear}
            </span>
            <span style={{ color: "rgba(245,168,0,0.5)", fontSize: 10 }}>
              ▾
            </span>
          </button>

          {showYearPicker && (
            <YearSelector
              year={calYear}
              onSelect={(y) => {
                setCalYear(y);
                setShowYearPicker(false);
              }}
              onClose={() => setShowYearPicker(false)}
            />
          )}
          {showMonthYearPicker && (
            <MonthYearPicker
              year={calYear}
              month={calMonth}
              onSelect={(y, m) => {
                setCalYear(y);
                setCalMonth(m);
              }}
              onClose={() => setShowMonthYearPicker(false)}
            />
          )}
        </div>

        <button onClick={() => navMonth(1)} style={calNavStyle}>
          ›
        </button>
      </div>

      <div
        style={{
          fontSize: 10.5,
          color: "rgba(245,168,0,0.4)",
          marginBottom: 8,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {dateFrom && !dateTo ? "Now pick end date" : "Click to pick start date"}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 2,
        }}
      >
        {WEEK.map((w) => (
          <div
            key={w}
            style={{
              fontSize: 9.5,
              textAlign: "center",
              color: "rgba(245,168,0,0.4)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;

          const isStart = sameDay(d, dateFrom);
          const isEnd = sameDay(d, dateTo);
          const isToday = sameDay(d, today);
          const isHovered = sameDay(d, hovered);

          const effectiveStart = dateFrom;
          const effectiveEnd = rangeEnd;
          const inRange = !!(
            effectiveStart &&
            effectiveEnd &&
            ((d > effectiveStart && d < effectiveEnd) ||
              (d < effectiveStart && d > effectiveEnd))
          );

          let bg = "none";
          let color = "rgba(255,252,240,0.55)";
          let radius = "6px";
          let fw: number | string = 400;
          let outline = "none";

          if (isStart || isEnd) {
            bg = "#F5A800";
            color = "#1A1033";
            fw = 700;
          } else if (inRange) {
            // Differentiate confirmed range vs hover preview
            const isConfirmedRange = !!(
              dateFrom &&
              dateTo &&
              ((d > dateFrom && d < dateTo) || (d < dateFrom && d > dateTo))
            );
            bg = isConfirmedRange
              ? "rgba(245,168,0,0.14)"
              : "rgba(245,168,0,0.07)";
            color = "#FFD166";
            radius = "0";
          } else if (isHovered && dateFrom && !dateTo) {
            bg = "rgba(245,168,0,0.1)";
            color = "#F5A800";
          }

          if (isToday && !isStart && !isEnd) {
            outline = "1.5px solid rgba(245,168,0,0.45)";
          }

          if (isStart && isEnd) radius = "6px";
          else if (isStart) radius = "6px 0 0 6px";
          else if (isEnd) radius = "0 6px 6px 0";

          return (
            <button
              key={d.toISOString()}
              onClick={() => onPick(d)}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              style={{
                height: 28,
                borderRadius: radius,
                border: "none",
                background: bg,
                fontSize: 11.5,
                fontFamily: "'Outfit',sans-serif",
                cursor: "pointer",
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: fw,
                outline,
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Presets + Clear */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid rgba(245,168,0,0.12)",
          flexWrap: "wrap",
        }}
      >
        {[7, 30, 90].map((n) => (
          <button
            key={n}
            onClick={() => onPreset(n)}
            style={{
              fontSize: 11,
              fontFamily: "'Outfit',sans-serif",
              background: "rgba(245,168,0,0.08)",
              border: "1px solid rgba(245,168,0,0.2)",
              borderRadius: 6,
              color: "rgba(255,252,240,0.5)",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Last {n}d
          </button>
        ))}
        {(dateFrom || dateTo) && (
          <button
            onClick={onClear}
            style={{
              fontSize: 11,
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 600,
              color: "rgba(255,100,100,0.7)",
              background: "rgba(255,100,100,0.08)",
              border: "1px solid rgba(255,100,100,0.2)",
              borderRadius: 6,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function CalendarPicker({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom: Date | null;
  dateTo: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePick = (d: Date) => {
    if (!dateFrom || (!dateTo && d < dateFrom)) {
      onChange(d, null);
    } else if (dateFrom && !dateTo) {
      if (sameDay(d, dateFrom)) onChange(null, null);
      else if (d > dateFrom) onChange(dateFrom, d);
      else onChange(d, dateFrom);
    } else {
      onChange(d, null);
    }
  };

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - days);
    onChange(from, to);
    setOpen(false);
  };

  const label =
    dateFrom && dateTo
      ? `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`
      : dateFrom
        ? `${fmtDate(dateFrom)} – ...`
        : "Pick date range";

  const hasRange = !!(dateFrom || dateTo);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: hasRange
            ? "rgba(245,168,0,0.14)"
            : "rgba(245,168,0,0.08)",
          border: `1.5px solid ${hasRange ? "rgba(245,168,0,0.55)" : "rgba(245,168,0,0.28)"}`,
          borderRadius: 8,
          color: "#FFFCF0",
          fontSize: 12,
          fontFamily: "'Outfit',sans-serif",
          padding: "8px 12px",
          cursor: "pointer",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 1v3M11 1v3M2 7h12" />
        </svg>
        {label}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 100,
          }}
        >
          <Calendar
            dateFrom={dateFrom}
            dateTo={dateTo}
            onPick={handlePick}
            onPreset={handlePreset}
            onClear={() => onChange(null, null)}
          />
        </div>
      )}
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 9.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(245,168,0,0.5)",
          fontWeight: 700,
        }}
      >
        Search
      </label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="rgba(245,168,0,0.45)"
          strokeWidth="1.5"
          style={{
            position: "absolute",
            left: 10,
            pointerEvents: "none",
            flexShrink: 0,
          }}
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Merchant, category, type…"
          style={{
            background: "rgba(245,168,0,0.08)",
            border: `1.5px solid ${value ? "rgba(245,168,0,0.55)" : "rgba(245,168,0,0.28)"}`,
            borderRadius: 8,
            color: "#FFFCF0",
            fontSize: 12,
            fontFamily: "'Outfit',sans-serif",
            padding: "8px 12px 8px 32px",
            outline: "none",
            minWidth: 200,
          }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              right: 8,
              background: "none",
              border: "none",
              color: "rgba(245,168,0,0.5)",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              padding: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FILTER BAR ──────────────────────────────────────────────────────────────
const filterLabelStyle: React.CSSProperties = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(245,168,0,0.5)",
  fontWeight: 700,
};
const selectStyle: React.CSSProperties = {
  background: "rgba(245,168,0,0.08)",
  border: "1.5px solid rgba(245,168,0,0.28)",
  borderRadius: 8,
  color: "#FFFCF0",
  fontSize: 12,
  fontFamily: "'Outfit',sans-serif",
  padding: "8px 12px",
  cursor: "pointer",
  outline: "none",
  minWidth: 130,
};
const dividerStyle: React.CSSProperties = {
  width: 1,
  background: "rgba(245,168,0,0.15)",
  alignSelf: "stretch",
};

function FilterBar({
  filters,
  setFilters,
  resultCount,
  totalCount,
  categories,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  resultCount: number;
  totalCount: number;
  categories: string[];
}) {
  const set = (patch: Partial<FilterState>) =>
    setFilters({ ...filters, ...patch });
  const hasActive =
    filters.search ||
    filters.category !== ALL_CATEGORY_FILTER ||
    filters.txType !== "all" ||
    !!filters.dateFrom ||
    !!filters.dateTo;
  const typeOptions: { val: TxType; label: string }[] = [
    { val: "all", label: "All" },
    { val: "credit", label: "↑ Credit" },
    { val: "debit", label: "↓ Debit" },
  ];

  return (
    <div
      style={{
        background: "#1A1033",
        border: "2px solid rgba(245,168,0,0.22)",
        borderRadius: 14,
        padding: "18px 20px",
        marginBottom: 18,
        boxShadow: "4px 4px 0 #0E0920",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "flex-end",
        }}
      >
        <SearchBar
          value={filters.search}
          onChange={(v) => set({ search: v })}
        />

        <div style={dividerStyle} />

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={filterLabelStyle}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => set({ category: e.target.value })}
            style={selectStyle}
          >
            {[ALL_CATEGORY_FILTER, ...categories].map((c) => (
              <option
                key={c}
                value={c}
                style={{ background: "#1A1033", color: "#FFFCF0" }}
              >
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={dividerStyle} />

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={filterLabelStyle}>Type</label>
          <div style={{ display: "flex", gap: 4 }}>
            {typeOptions.map(({ val, label }) => {
              const active = filters.txType === val;
              return (
                <button
                  key={val}
                  onClick={() => set({ txType: val })}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 12,
                    fontWeight: active ? 700 : 400,
                    border: active
                      ? "1.5px solid rgba(245,168,0,0.55)"
                      : "1.5px solid rgba(245,168,0,0.18)",
                    background: active
                      ? "rgba(245,168,0,0.2)"
                      : "rgba(245,168,0,0.05)",
                    color: active ? "#F5A800" : "rgba(255,252,240,0.4)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={dividerStyle} />

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={filterLabelStyle}>Date range</label>
          <CalendarPicker
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChange={(from, to) => set({ dateFrom: from, dateTo: to })}
          />
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            alignSelf: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(245,168,0,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {resultCount} of {totalCount} transactions
          </span>
          {hasActive && (
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  category: ALL_CATEGORY_FILTER,
                  txType: "all",
                  dateFrom: null,
                  dateTo: null,
                })
              }
              style={{
                fontSize: 11,
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 600,
                color: "rgba(255,100,100,0.7)",
                background: "rgba(255,100,100,0.08)",
                border: "1px solid rgba(255,100,100,0.2)",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginTop: 18,
        paddingTop: 14,
        borderTop: "1px solid rgba(245,168,0,0.1)",
      }}
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{
          padding: "7px 16px",
          borderRadius: 7,
          cursor: page === 1 ? "not-allowed" : "pointer",
          fontFamily: "'Outfit',sans-serif",
          fontSize: 12,
          fontWeight: 600,
          background: "rgba(245,168,0,0.07)",
          border: "1.5px solid rgba(245,168,0,0.22)",
          color: page === 1 ? "rgba(245,168,0,0.25)" : "#F5A800",
          opacity: page === 1 ? 0.5 : 1,
        }}
      >
        ← Prev
      </button>

      <span
        style={{
          fontSize: 12,
          fontFamily: "'Outfit',sans-serif",
          color: "rgba(255,252,240,0.5)",
        }}
      >
        Page <span style={{ color: "#F5A800", fontWeight: 700 }}>{page}</span>{" "}
        of{" "}
        <span style={{ color: "#FFFCF0", fontWeight: 600 }}>{totalPages}</span>
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{
          padding: "7px 16px",
          borderRadius: 7,
          cursor: page === totalPages ? "not-allowed" : "pointer",
          fontFamily: "'Outfit',sans-serif",
          fontSize: 12,
          fontWeight: 600,
          background: "rgba(245,168,0,0.07)",
          border: "1.5px solid rgba(245,168,0,0.22)",
          color: page === totalPages ? "rgba(245,168,0,0.25)" : "#F5A800",
          opacity: page === totalPages ? 0.5 : 1,
        }}
      >
        Next →
      </button>
    </div>
  );
}

// ─── RESPONSIVE TRANSACTION ROW / CARD ───────────────────────────────────────
function TxCard({ tx }: { tx: Transaction }) {
  return (
    <div
      style={{
        background: "rgba(245,168,0,0.04)",
        border: "1.5px solid rgba(245,168,0,0.14)",
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "rgba(245,168,0,0.1)",
              border: "1.5px solid rgba(245,168,0,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {tx.icon}
          </div>
          <div>
            <div
              style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}
            >
              {tx.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(245,168,0,0.38)",
                marginTop: 1,
              }}
            >
              {tx.date}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: tx.amount > 0 ? "var(--amber3)" : "rgba(255,252,240,0.6)",
            }}
          >
            {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toFixed(2)}
          </div>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 20,
              fontWeight: 600,
              background:
                tx.type === "credit"
                  ? "rgba(80,220,120,0.12)"
                  : "rgba(245,168,0,0.1)",
              color: tx.type === "credit" ? "#6EE7A0" : "var(--amber3)",
            }}
          >
            {tx.type}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "rgba(245,168,0,0.45)" }}>
        <span
          style={{
            background: "rgba(245,168,0,0.08)",
            border: "1px solid rgba(245,168,0,0.15)",
            borderRadius: 5,
            padding: "2px 8px",
          }}
        >
          {tx.category}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN TRANSACTIONS TAB COMPONENT ─────────────────────────────────────────
export default function TransactionsTab({
  transactions,
}: TransactionsTabProps) {
  const defaultFilters: FilterState = {
    search: "",
    category: ALL_CATEGORY_FILTER,
    txType: "all",
    dateFrom: null,
    dateTo: null,
  };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function exportTransactionsCSV(
  transactions: Transaction[],
) {
  if (!transactions.length) return

  const rows = transactions.map(tx => ({
    Merchant: tx.name,
    Category: tx.category,
    Date: tx.date,
    Amount: Math.abs(tx.amount).toFixed(2),
    Type:
      tx.type === 'credit'
        ? 'Credit'
        : 'Debit',
  }))

  const headers = Object.keys(
    rows[0]
  ).join(',')

  const body = rows
    .map(row =>
      Object.values(row).join(',')
    )
    .join('\n')

  const csv = `${headers}\n${body}`

  const blob = new Blob(
    [csv],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )

  saveAs(
    blob,
    `transactions_${Date.now()}.csv`
  )
}
function exportTransactionsExcel(
  transactions: Transaction[],
) {
  if (!transactions.length) return

  const rows = transactions.map(tx => ({
    Merchant: tx.name,
    Category: tx.category,
    Date: tx.date,
    Amount: Math.abs(tx.amount),
    Type:
      tx.type === 'credit'
        ? 'Credit'
        : 'Debit',
  }))

  const worksheet =
    XLSX.utils.json_to_sheet(rows)

  const workbook =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Transactions'
  )

  XLSX.writeFile(
    workbook,
    `transactions_${Date.now()}.xlsx`
  )
}
  const formatCurrency = (
  value: number,
) =>
  new Intl.NumberFormat(
    'en-IN',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value)

function exportTransactionsPDF(
  transactions: Transaction[],
) {
  if (!transactions.length) return

  const doc = new jsPDF()
  const income = transactions
    .filter(
      tx =>
        tx.type === 'credit'
    )
    .reduce(
      (sum, tx) =>
        sum + tx.amount,
      0,
    )
  const expenses = transactions
    .filter(
      tx =>
        tx.type === 'debit' &&
        tx.category !== 'Transfer'
    )
    .reduce(
      (sum, tx) =>
        sum + Math.abs(tx.amount),
      0,
    )
  const net = income - expenses
  doc.setFontSize(22)
  doc.text(
    'centfluence Financial Report',14,18,)
  doc.setFontSize(10)
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,14,28,)
  doc.setDrawColor(200)
  doc.line(14,33,195,33,)
  doc.setFontSize(12)
  doc.text(
    `Transactions : ${transactions.length}`,14,45,)
  doc.text(`Income       : ₹ ${formatCurrency(income)}`,14,53,)
  doc.text(`Expenses     : ₹ ${formatCurrency(expenses)}`,14,61,)
  doc.text(`Net Cashflow : ₹ ${formatCurrency(net)}`,14,69,)

  autoTable(doc, {
    startY: 80,

    head: [[
      'Merchant',
      'Category',
      'Date',
      'Amount',
      'Type',
    ]],

    body: transactions.map(
      tx => [
        tx.name,
        tx.category,
        tx.date,
        `₹ ${formatCurrency(
          Math.abs(tx.amount)
        )}`,
        tx.type === 'credit'
          ? 'Credit'
          : 'Debit',
      ]
    ),

    styles: {
      fontSize: 8,
    },

    headStyles: {
      fillColor: [
        41,
        128,
        185,
      ],
    },
  })

  doc.save(
    `transactions_${Date.now()}.pdf`
  )
}
  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  // Reset to page 1 whenever filters change
  const handleSetFilters = useCallback((f: FilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  const allTransactions: Transaction[] = transactions.data ?? [];

  const allCategories = useMemo(
    () => Array.from(new Set(allTransactions.map((t) => t.category))),
    [allTransactions],
  );

  const filteredTransactions = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return allTransactions.filter((tx) => {
      // Search across merchant name, category, type
      if (q) {
        const matchName = tx.name.toLowerCase().includes(q);
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchType = tx.type.toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchType) return false;
      }
      if (
        filters.category !== ALL_CATEGORY_FILTER &&
        tx.category !== filters.category
      )
        return false;
      if (filters.txType === "credit" && tx.type !== "credit") return false;
      if (filters.txType === "debit" && tx.type !== "debit") return false;
      const txDate = new Date(tx.dateVal);
      if (filters.dateFrom && txDate < filters.dateFrom) return false;
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59);
        if (txDate > end) return false;
      }
      return true;
    });
  }, [allTransactions, filters]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginated = filteredTransactions.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  const hasActiveFilters = !!(
    filters.search ||
    filters.category !== ALL_CATEGORY_FILTER ||
    filters.txType !== "all" ||
    filters.dateFrom ||
    filters.dateTo
  );
  // Style helper for dropdown action buttons
  const dropdownItemStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "rgba(255,252,240,0.8)",
    fontFamily: "'Outfit',sans-serif",
    fontSize: 12,
    padding: "8px 14px",
    textAlign: "left",
    cursor: "pointer",
    outline: "none",
    width: "100%",
    transition: "background 0.2s, color 0.2s",
  };
  return (
    <div>
      <FilterBar
        filters={filters}
        setFilters={handleSetFilters}
        resultCount={filteredTransactions.length}
        totalCount={allTransactions.length}
        categories={allCategories}
      />

      <div className={styles["chart-card"]}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div className={styles["chart-title"]} style={{ margin: 0 }}>
            All Transactions
            {filteredTransactions.length !== allTransactions.length && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "rgba(245,168,0,0.4)",
                  marginLeft: 10,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                — {filteredTransactions.length} result
                {filteredTransactions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {/* ── Export Action Dropdown Menu ── */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className={styles["btn-secondary"]}
              onClick={() => setExportDropdownOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 2v9M4 8l4 4 4-4M2 14h12" />
              </svg>
              Export As
              <span style={{ fontSize: 10, color: "rgba(245,168,0,0.6)" }}>
                ▾
              </span>
            </button>

            {exportDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 150,
                  background: "#2C1D55",
                  border: "1.5px solid rgba(245,168,0,0.3)",
                  borderRadius: 10,
                  boxShadow: "4px 4px 0 #0E0920",
                  padding: "6px 0",
                  minWidth: 130,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* <button
                  onClick={() => {
                    exportTransactionsCSV(filteredTransactions);
                    setExportDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,168,0,0.1)";
                    e.currentTarget.style.color = "#F5A800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "rgba(255,252,240,0.8)";
                  }}
                >
                  Export CSV
                </button> */}
                <button
                  onClick={() => {
                    exportTransactionsExcel(filteredTransactions);
                    setExportDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,168,0,0.1)";
                    e.currentTarget.style.color = "#F5A800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "rgba(255,252,240,0.8)";
                  }}
                >
                  Export Excel
                </button>
                <button
                  onClick={() => {
                    exportTransactionsPDF(filteredTransactions);
                    setExportDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,168,0,0.1)";
                    e.currentTarget.style.color = "#F5A800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "rgba(255,252,240,0.8)";
                  }}
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {transactions.loading ? (
          <LoadingState rows={5} label="Loading transactions…" />
        ) : transactions.error ? (
          <ErrorState
            error={transactions.error}
            onRetry={transactions.refetch}
          />
        ) : filteredTransactions.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,252,240,0.25)",
                marginTop: 12,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              No transactions match your filters
            </div>
            <button
              onClick={() => handleSetFilters(defaultFilters)}
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--amber)",
                background: "none",
                border: "1px solid rgba(245,168,0,0.3)",
                borderRadius: 7,
                padding: "6px 14px",
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : isMobile ? (
          /* ── Mobile Card View ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {paginated.map((tx) => (
              <TxCard key={tx.id} tx={tx} />
            ))}
          </div>
        ) : (
          /* ── Desktop Table View (with horizontal scroll on tablet) ── */
          <div style={{ overflowX: "auto" }}>
            <table className={styles["tx-table"]} style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((tx) => (
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
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(245,168,0,0.1)",
                            border: "1.5px solid rgba(245,168,0,0.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          {tx.icon}
                        </div>
                        <span style={{ color: "var(--white)", fontSize: 13 }}>
                          {tx.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles["tx-cat"]}>{tx.category}</span>
                    </td>
                    <td style={{ fontSize: 11, color: "rgba(245,168,0,0.38)" }}>
                      {tx.date}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          color:
                            tx.amount > 0
                              ? "var(--amber3)"
                              : "rgba(255,252,240,0.6)",
                        }}
                      >
                        {tx.amount > 0 ? "+" : ""}₹
                        {Math.abs(tx.amount).toFixed(2)}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 20,
                          marginLeft: 6,
                          fontWeight: 600,
                          background:
                            tx.type === "credit"
                              ? "rgba(80,220,120,0.12)"
                              : "rgba(245,168,0,0.1)",
                          color:
                            tx.type === "credit" ? "#6EE7A0" : "var(--amber3)",
                        }}
                      >
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > PAGE_SIZE && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}

        {/* Filter summary row */}
        {filteredTransactions.length > 0 && hasActiveFilters && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid rgba(245,168,0,0.1)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 24,
              fontSize: 12,
            }}
          >
            {(() => {
              const net = filteredTransactions.reduce(
                (s, t) => s + t.amount,
                0,
              );
              const out = Math.abs(
                filteredTransactions
                  .filter((t) => t.amount < 0)
                  .reduce((s, t) => s + t.amount, 0),
              );
              const ins = filteredTransactions
                .filter((t) => t.amount > 0)
                .reduce((s, t) => s + t.amount, 0);
              return (
                <>
                  <span style={{ color: "rgba(245,168,0,0.4)" }}>
                    Net:{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          net >= 0 ? "var(--amber3)" : "rgba(255,100,100,0.8)",
                      }}
                    >
                      {net >= 0 ? "+" : ""}₹{Math.abs(net).toFixed(2)}
                    </span>
                  </span>
                  <span style={{ color: "rgba(245,168,0,0.4)" }}>
                    Total out:{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color: "rgba(255,252,240,0.6)",
                      }}
                    >
                      ₹{out.toFixed(2)}
                    </span>
                  </span>
                  <span style={{ color: "rgba(245,168,0,0.4)" }}>
                    Total in:{" "}
                    <span style={{ fontWeight: 700, color: "var(--amber3)" }}>
                      +₹{ins.toFixed(2)}
                    </span>
                  </span>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
