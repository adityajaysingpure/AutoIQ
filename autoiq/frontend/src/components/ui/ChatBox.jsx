import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";

const SUGGESTIONS = [
  "Is diesel worth it for 15km daily?",
  "What is the resale value after 3 years?",
  "How do I check for flood damage?",
  "What should I ask the seller?",
  "Is this a good first car?",
];

export default function ChatBox({ sessionId }) {
  const { messages, loading, ask } = useChat(sessionId);
  const [input, setInput]          = useState("");
  const bottomRef                  = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    ask(input.trim());
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 380 }}>
      <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
        🤖 Ask anything about this car
      </p>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", marginBottom: 12 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 12,
                border: "1px solid #e5e7eb", background: "#fff",
                color: "#4b5563", cursor: "pointer",
              }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 10,
          }}>
            <div style={{
              maxWidth: "80%", padding: "9px 13px", fontSize: 13,
              lineHeight: 1.6, whiteSpace: "pre-wrap",
              borderRadius: m.role === "user"
                ? "14px 14px 4px 14px"
                : "14px 14px 14px 4px",
              background: m.role === "user" ? "#dc2626" : "#f3f4f6",
              color: m.role === "user" ? "#fff" : "#1f2937",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{
              padding: "9px 14px", borderRadius: "14px 14px 14px 4px",
              background: "#f3f4f6", color: "#9ca3af", fontSize: 13,
            }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a follow-up question..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 18px", borderRadius: 10,
            background: "#dc2626", color: "#fff",
            border: "none", fontWeight: 600, fontSize: 13,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
