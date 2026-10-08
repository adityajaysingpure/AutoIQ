import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";

const SUGGESTIONS = [
  "Is diesel worth it for 15km daily?",
  "What is the resale value after 3 years?",
  "How do I check for flood damage?",
  "What should I ask the seller before buying?",
  "Is this a good first car?",
];

export default function ChatBox({ sessionId }) {
  const { messages, loading, ask } = useChat(sessionId);
  const [input, setInput]          = useState("");
  const bottomRef                  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || loading) return;
    ask(q);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={container}>
      <p style={titleSt}>🤖 Ask anything about this car</p>

      {/* Message list */}
      <div style={messageList}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} style={suggBtn}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div style={bubbleStyle(m.role)}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={bubbleStyle("assistant")}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up question..."
          style={inputSt}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            ...sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor:  loading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────── */

const container = { display: "flex", flexDirection: "column", height: 380 };

const titleSt = { margin: "0 0 12px", fontWeight: 700, fontSize: 14, color: "#1f2937" };

const messageList = {
  flex: 1, overflowY: "auto", padding: "4px 0", marginBottom: 12,
};

const bubbleStyle = (role) => ({
  maxWidth: "80%",
  padding: "9px 13px",
  fontSize: 13,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  borderRadius: role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
  background: role === "user" ? "#dc2626" : "#f3f4f6",
  color: role === "user" ? "#fff" : "#1f2937",
});

const inputRow = { display: "flex", gap: 8 };

const inputSt = {
  flex: 1, padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
  fontFamily: "inherit",
};

const sendBtn = {
  padding: "10px 18px", borderRadius: 10,
  background: "#dc2626", color: "#fff",
  border: "none", fontWeight: 600, fontSize: 13,
};

const suggBtn = {
  padding: "6px 12px", borderRadius: 999, fontSize: 12,
  border: "1px solid #e5e7eb", background: "#fff",
  color: "#4b5563", cursor: "pointer",
};
