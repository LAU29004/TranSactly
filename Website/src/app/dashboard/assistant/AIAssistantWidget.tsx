"use client";
import { useState, useRef, useEffect } from "react";
import styles from "../Dashboard.module.css";
import { aiService } from "@/services/aiService";
import { chatHistoryService } from "@/services/chatHistoryService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}
interface HistoryMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm your AI Financial Assistant. Ask me about your spending, savings, subscriptions, merchants, or financial trends.",
  timestamp: formatTime(new Date()),
};

interface AIAssistantWidgetProps {
  initialPrompt?: string;
  userName: string;
}

export default function AIAssistantWidget({
  initialPrompt = "",
  userName,
}: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState(initialPrompt);
  const [isThinking, setIsThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const historyBtnRef = useRef<HTMLButtonElement>(null);

  const userInitials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    if (!historyOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        historyBtnRef.current &&
        !historyBtnRef.current.contains(e.target as Node)
      ) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [historyOpen]);

  // ── Load history from backend on mount ──────────────────────────────────
  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await chatHistoryService.getHistory();

        if (data?.messages?.length) {
          setMessages(
            data.messages.map((m: HistoryMessage) => ({
              id: String(m.id),
              role: m.role,
              text: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString(),
            })),
          );
        }
      } catch (err) {
      }
    }

    loadHistory();
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleAsk = async (textToSend?: string) => {
    const targetText = textToSend || input;
    const trimmed = targetText.trim();
    if (!trimmed || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await aiService.ask(trimmed);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: response.text,
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: "Unable to get response from AI Assistant.",
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([WELCOME_MSG]);
    setHistoryOpen(false);
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MSG]);
    setHistoryOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className={styles["chart-card"]} style={{ position: "relative" }}>
      {/* Header */}
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
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          AI Assistant
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className={styles["ai-chat-scroll"]}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: 420,
          minHeight: 200,
          overflowY: "auto",
          padding: "4px 4px 4px 0",
          marginBottom: 14,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  background:
                    msg.role === "user" ? "rgba(245,168,0,0.18)" : "#F5A800",
                  color: msg.role === "user" ? "#F5A800" : "#1A1033",
                  border:
                    msg.role === "user"
                      ? "1.5px solid rgba(245,168,0,0.3)"
                      : "none",
                }}
              >
                {msg.role === "user" ? userInitials : "✦"}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(245,168,0,0.35)",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {msg.timestamp}
              </span>
            </div>
            <div
              style={{
                maxWidth: "82%",
                fontSize: 12.5,
                lineHeight: 1.55,
                padding: "9px 13px",
                borderRadius: 10,
                fontFamily: "'Outfit',sans-serif",
                background:
                  msg.role === "user"
                    ? "rgba(245,168,0,0.14)"
                    : "rgba(255,252,240,0.04)",
                border:
                  msg.role === "user"
                    ? "1.5px solid rgba(245,168,0,0.28)"
                    : "1.5px solid rgba(245,168,0,0.1)",
                color:
                  msg.role === "user" ? "#FFFCF0" : "rgba(255,252,240,0.55)",
                borderTopRightRadius: msg.role === "user" ? 3 : 10,
                borderTopLeftRadius: msg.role === "assistant" ? 3 : 10,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                background: "#F5A800",
                color: "#1A1033",
              }}
            >
              ✦
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(255,252,240,0.04)",
                border: "1.5px solid rgba(245,168,0,0.1)",
                borderTopLeftRadius: 3,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={styles["ai-typing-dot"]}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            padding: "12px",
            borderRadius: 12,
            background: "rgba(255,252,240,0.03)",
            border: "1px solid rgba(245,168,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(245,168,0,0.4)",
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            Suggested Questions
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
            {[
              "Top spending category",
              "Top merchants",
              "Savings rate",
              "My subscriptions",
            ].map((question) => (
              <button
                key={question}
                onClick={() => handleAsk(question)}
                style={{
                  flexShrink: 0,
                  background: "rgba(245,168,0,0.08)",
                  border: "1px solid rgba(245,168,0,0.12)",
                  borderRadius: 999,
                  padding: "7px 12px",
                  color: "rgba(255,252,240,0.65)",
                  fontSize: 11,
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,168,0,0.14)";
                  e.currentTarget.style.borderColor = "rgba(245,168,0,0.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(245,168,0,0.08)";
                  e.currentTarget.style.borderColor = "rgba(245,168,0,0.12)";
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your spending, income, or savings…"
            style={{
              flex: 1,
              background: "rgba(245,168,0,0.06)",
              border: "1.5px solid rgba(245,168,0,0.22)",
              borderRadius: 8,
              color: "#FFFCF0",
              fontSize: 12.5,
              fontFamily: "'Outfit',sans-serif",
              padding: "10px 14px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,168,0,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,168,0,0.22)";
            }}
          />
          <button
            onClick={() => handleAsk()}
            disabled={!input.trim() || isThinking}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background:
                !input.trim() || isThinking
                  ? "rgba(245,168,0,0.15)"
                  : "#F5A800",
              color:
                !input.trim() || isThinking ? "rgba(26,16,51,0.4)" : "#1A1033",
              border: "none",
              borderRadius: 8,
              padding: "0 18px",
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "'Outfit',sans-serif",
              cursor: !input.trim() || isThinking ? "default" : "pointer",
              boxShadow:
                !input.trim() || isThinking ? "none" : "2px 2px 0 #0E0920",
              whiteSpace: "nowrap",
            }}
          >
            Ask
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M2 8h12M9 3l5 5-5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown fade-in keyframe */}
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
