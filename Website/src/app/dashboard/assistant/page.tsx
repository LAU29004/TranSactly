"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../Dashboard.module.css";
import Sidebar from "../../../components/Sidebar";
import AIAssistantWidget from "../assistant/AIAssistantWidget";
import { auth } from "@/utils/auth";
import { useUser } from "../../../hooks/useUser";

// 1. Internal content component that uses browser search parameters safely
function AssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";
  const { data: user } = useUser();

  return (
    <div className={styles["db-root"]}>
      <div className={styles["db-dot-field"]} />

      <Sidebar
        activeTab="assistant"
        onNavigate={(tab) => {
          if (tab === "assistant") return;
          router.push(`/dashboard?tab=${tab}`);
        }}
        onLogout={() => {
          auth.logout();
          router.push("/login");
        }}
      />

      <main className={styles["db-main"]}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
              AI Assistant
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
              Your full conversation history with stored context
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 720 }}>
          <AIAssistantWidget
            initialPrompt={initialPrompt}
            userName={user?.name ?? ""}
          />
        </div>
      </main>
    </div>
  );
}

// 2. Default export wrapper component adding the Next.js production boundary
export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "var(--navy)" }}>Loading assistant dashboard...</div>}>
      <AssistantContent />
    </Suspense>
  );
}