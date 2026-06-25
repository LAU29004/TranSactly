"use client";
import styles from "../app/dashboard/Dashboard.module.css";
import { useEffect, useState } from "react";
export type Tab =
  | "overview"
  | "transactions"
  | "analytics"
  | "subscriptions"
  | "assistant";
import { userService } from "../services/userService";
import Image from "next/image";
interface SidebarProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 5h12M2 8h8M2 11h5" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 14V8M6.5 14V3M11 14V6.5M15 14V1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1.5" y="3" width="13" height="10" rx="2" />
        <path d="M1.5 6.5h13M4 9.5h3" />
      </svg>
    ),
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M8 1.5l1.6 3.4 3.7.5-2.7 2.6.6 3.7L8 9.8l-3.2 1.9.6-3.7-2.7-2.6 3.7-.5L8 1.5z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Sidebar({
  activeTab,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [imageError, setImageError] =
  useState(false)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getMe();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((word: string) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  return (
    <aside
      style={{
        width: 224,
        minWidth: 224,
        background: "#1A1033",
        borderRight: "3px solid #0E0920",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "0 18px 20px",
          borderBottom: "2px solid rgba(245,168,0,0.12)",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#F5A800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "3px 3px 0 #0E0920",
            }}
          >
    <Image
      src="/screenLogo.png"
      alt="Centfluence Logo"
      width={36}
      height={36}
      style={{ objectFit: 'contain' }}
    />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 17,
                color: "#FFFCF0",
                letterSpacing: "-0.03em",
              }}
            >
              cent<span style={{ color: "#F5A800" }}>fluence</span>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(245,168,0,0.4)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 1,
              }}
            >
              Wealth Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "0 8px", marginBottom: 4 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(245,168,0,0.35)",
            padding: "0 10px 6px",
            fontWeight: 700,
          }}
        >
          Overview
        </div>
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 2,
                fontSize: 13,
                fontFamily: "'Outfit',sans-serif",
                textAlign: "left",
                fontWeight: active ? 700 : 400,
                color: active ? "#F5A800" : "rgba(255,252,240,0.35)",
                background: active ? "rgba(245,168,0,0.12)" : "transparent",
                border: active
                  ? "1.5px solid rgba(245,168,0,0.28)"
                  : "1.5px solid transparent",
                boxShadow: active ? "2px 2px 0 #0E0920" : "none",
                transition: "all 0.15s",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* User card + logout */}
      <div
        style={{
          marginTop: "auto",
          padding: "14px 8px 0",
          borderTop: "2px solid rgba(245,168,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(245,168,0,0.06)",
            border: "1.5px solid rgba(245,168,0,0.18)",
            boxShadow: "2px 2px 0 #0E0920",
            marginBottom: 10,
          }}
        >
{
  user?.picture &&
  !imageError ? (
    <img
      src={user.picture}
      alt={user.name}
      onError={() =>
        setImageError(true)
      }
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        objectFit: "cover",
        border: "2px solid #0E0920",
      }}
    />
  ) : (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#F5A800",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800,
        color: "#1A1033",
        border: "2px solid #0E0920",
      }}
    >
      {initials}
    </div>
  )
}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#FFFCF0",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {loadingUser ? "Loading..." : user?.name}
            </div>
            <div style={{ fontSize: 10, color: "#F5A800", opacity: 0.55 }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 600,
            background: "rgba(255,80,80,0.07)",
            border: "1.5px solid rgba(255,80,80,0.2)",
            color: "rgba(255,120,120,0.75)",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "rgba(255,80,80,0.15)";
            b.style.borderColor = "rgba(255,80,80,0.45)";
            b.style.color = "#ff8888";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "rgba(255,80,80,0.07)";
            b.style.borderColor = "rgba(255,80,80,0.2)";
            b.style.color = "rgba(255,120,120,0.75)";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}
