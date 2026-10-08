import React, { useState } from "react";
import PriceCard from "../charts/PriceCard";
import ChatBox from "./ChatBox";

const card = {
  background: "#fff", borderRadius: 12,
  padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
  marginBottom: 16,
};
const secTitle = { margin: "0 0 14px", fontWeight: 700, fontSize: 15, color: "#1f2937" };

const recMeta = {
  "Buy":                   { color: "#22c55e", bg: "#dcfce7" },
  "Negotiate":             { color: "#f59e0b", bg: "#fef3c7" },
  "Avoid":                 { color: "#ef4444", bg: "#fee2e2" },
  "Get Inspected First":   { color: "#6366f1", bg: "#eef2ff" },
};

const sevColor = { minor: "#22c55e", moderate: "#f59e0b", major: "#ef4444" };

export default function AnalysisResult({ result, askingPrice, onReset }) {
  const [tab, setTab] = useState("price");
  const rec = recMeta[result.buy_recommendation] || recMeta["Negotiate"];

  const tabs = [
    { id: "price",     label: "Price"      },
    { id: "issues",    label: "Issues"     },
    { id: "negotiate", label: "Negotiate"  },
    { id: "checklist", label: "Checklist"  },
    { id: "chat",      label: "💬 Ask AI"  },
  ];

  return (
    <div>
      {/* Recommendation banner */}
      <div style={{
        ...card,
        background: rec.bg, border: `1.5px solid ${rec.color}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: rec.color }}>
            Recommendation: {result.buy_recommendation}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
            {result.overall_verdict}
          </p>
        </div>
        <div style={{ textAlign: "center", minWidth: 80 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 28, color: "#1f2937" }}>
            {result.reliability_score}<span style={{ fontSize: 14, color: "#9ca3af" }}>/10</span>
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>Reliability</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 13,
            fontWeight: 600, border: "none", cursor: "pointer",
            background: tab === t.id ? "#dc2626" : "#f3f4f6",
            color: tab === t.id ? "#fff" : "#6b7280",
          }}>
            {t.label}
          </button>
        ))}
        <button onClick={onReset} style={{
          marginLeft: "auto", padding: "7px 14px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, border: "1px solid #e5e7eb",
          cursor: "pointer", background: "#fff", color: "#6b7280",
        }}>
          ↩ New Search
        </button>
      </div>

      {/* PRICE TAB */}
      {tab === "price" && (
        <div style={card}>
          <p style={secTitle}>💰 Price Analysis</p>
          <PriceCard pa={result.price_analysis} askingPrice={askingPrice} />
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Service/Year",  value: result.estimated_service_cost_per_year },
              { label: "Insurance/Year", value: result.insurance_estimate },
              { label: "Mileage",       value: result.avg_mileage_kmpl ? `${result.avg_mileage_kmpl} kmpl` : "N/A" },
              { label: "Resale (3yr)",  value: result.resale_value_3yr },
            ].map((s) => (
              <div key={s.label} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{s.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ISSUES TAB */}
      {tab === "issues" && (
        <div style={card}>
          <p style={secTitle}>⚙️ Known Issues for This Model</p>
          {result.red_flags.length > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fee2e2", marginBottom: 14 }}>
              <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#991b1b" }}>🚨 Red Flags</p>
              {result.red_flags.map((f, i) => (
                <p key={i} style={{ margin: "4px 0", fontSize: 13, color: "#7f1d1d" }}>• {f}</p>
              ))}
            </div>
          )}
          {result.known_issues.map((issue, i) => (
            <div key={i} style={{
              padding: "12px 14px", borderRadius: 10, marginBottom: 10,
              border: `1px solid ${sevColor[issue.severity]}22`,
              background: `${sevColor[issue.severity]}08`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{issue.component}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                  color: sevColor[issue.severity], background: `${sevColor[issue.severity]}20`,
                  textTransform: "capitalize",
                }}>{issue.severity}</span>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#374151" }}>{issue.description}</p>
              {issue.estimated_repair_cost && (
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                  Est. repair: {issue.estimated_repair_cost}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NEGOTIATE TAB */}
      {tab === "negotiate" && (
        <div style={card}>
          <p style={secTitle}>🤝 Negotiation Guide</p>
          <div style={{
            padding: "14px 18px", borderRadius: 10,
            background: "#fef3c7", border: "1px solid #fcd34d", marginBottom: 16,
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
              TARGET PRICE
            </p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 24, color: "#78350f" }}>
              ₹{result.max_negotiable_price.toLocaleString("en-IN")}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#92400e" }}>
              Realistic lowest you can negotiate to
            </p>
          </div>
          {result.negotiation_tips.map((tip, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 0",
              borderBottom: i < result.negotiation_tips.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <span style={{
                minWidth: 26, height: 26, borderRadius: "50%",
                background: "#dc2626", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>{i + 1}</span>
              <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* CHECKLIST TAB */}
      {tab === "checklist" && (
        <div style={card}>
          <p style={secTitle}>✅ Pre-Purchase Inspection Checklist</p>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6b7280" }}>
            Go through these before signing anything.
          </p>
          {result.inspection_checklist.map((item, i) => (
            <div key={i} style={{
              padding: "12px 0",
              borderBottom: i < result.inspection_checklist.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  minWidth: 22, height: 22, border: "2px solid #d1d5db",
                  borderRadius: 4, display: "inline-block", marginTop: 1,
                }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1f2937" }}>
                    {item.item}
                  </p>
                  <p style={{ margin: "3px 0", fontSize: 13, color: "#374151" }}>
                    {item.what_to_check}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                    {item.why_it_matters}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHAT TAB */}
      {tab === "chat" && (
        <div style={card}>
          <ChatBox sessionId={result.session_id} />
        </div>
      )}
    </div>
  );
}
