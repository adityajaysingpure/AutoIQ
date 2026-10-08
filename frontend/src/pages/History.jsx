import React, { useState, useEffect } from "react";
import { getHistory, deleteRecord } from "../services/api";

const VERDICT_COLOR = {
  great_deal: "#22c55e",
  fair:       "#3b82f6",
  overpriced: "#f59e0b",
  avoid:      "#ef4444",
};

const REC_COLOR = {
  "Buy":                 "#22c55e",
  "Negotiate":           "#f59e0b",
  "Avoid":               "#ef4444",
  "Get Inspected First": "#6366f1",
};

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getHistory()
      .then((r) => setRecords(r.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    // Optimistic removal
    setRecords((prev) => prev.filter((r) => r._id !== id));
    try {
      await deleteRecord(id);
    } catch {
      // If delete fails, the record will reappear on next load — acceptable
    }
  };

  return (
    <div style={pageWrapper}>
      <h2 style={pageTitle}>Search History</h2>
      <p style={pageSub}>Cars you've previously researched.</p>

      {loading && <p style={{ color: "#9ca3af" }}>Loading...</p>}

      {error && (
        <div style={errorBox}>❌ {error}</div>
      )}

      {!loading && !error && records.length === 0 && (
        <div style={emptyState}>
          <p style={{ fontSize: 40, margin: "0 0 12px" }}>🚗</p>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No searches yet.</p>
        </div>
      )}

      {records.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => (
            <div key={r._id} style={recordCard}>
              <div style={{ flex: 1 }}>
                <p style={recordTitle}>
                  {r.year} {r.make} {r.model}
                  {r.variant && <span style={recordVariant}> · {r.variant}</span>}
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={metaText}>{r.km_driven?.toLocaleString("en-IN")} km</span>
                  <span style={metaText}>₹{r.asking_price?.toLocaleString("en-IN")}</span>

                  <Badge
                    label={r.price_verdict?.replace(/_/g, " ")}
                    color={VERDICT_COLOR[r.price_verdict]}
                  />
                  <Badge
                    label={r.buy_recommendation}
                    color={REC_COLOR[r.buy_recommendation]}
                  />
                </div>

                <p style={dateText}>
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(r._id)}
                style={deleteBtn}
                aria-label="Delete record"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sub-component ──────────────────────────────────── */

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 999,
      color: color || "#6b7280",
      background: "#f9fafb",
      border: `1px solid ${color || "#e5e7eb"}`,
      textTransform: "capitalize",
    }}>
      {label}
    </span>
  );
}

/* ── Styles ─────────────────────────────────────────── */

const pageWrapper = { maxWidth: 820, margin: "0 auto", padding: "24px 16px" };
const pageTitle   = { margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1f2937" };
const pageSub     = { margin: "0 0 20px", fontSize: 14, color: "#6b7280" };
const errorBox    = { padding: "12px 16px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 14, marginBottom: 16 };
const emptyState  = { textAlign: "center", padding: "60px 0", color: "#9ca3af" };
const recordCard  = { background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" };
const recordTitle  = { margin: "0 0 6px", fontWeight: 700, fontSize: 15, color: "#1f2937" };
const recordVariant = { color: "#9ca3af", fontWeight: 400 };
const metaText    = { fontSize: 13, color: "#6b7280" };
const dateText    = { margin: "6px 0 0", fontSize: 12, color: "#9ca3af" };
const deleteBtn   = { background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 20, flexShrink: 0 };
