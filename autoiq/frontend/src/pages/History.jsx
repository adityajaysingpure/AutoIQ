import React, { useState, useEffect } from "react";
import { getHistory, deleteRecord } from "../services/api";

const verdictColor = {
  great_deal: "#22c55e", fair: "#3b82f6",
  overpriced: "#f59e0b", avoid: "#ef4444",
};
const recColor = {
  "Buy": "#22c55e", "Negotiate": "#f59e0b",
  "Avoid": "#ef4444", "Get Inspected First": "#6366f1",
};

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((r) => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    setRecords((prev) => prev.filter((r) => r._id !== id));
    await deleteRecord(id);
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
        Search History
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
        Cars you've previously researched.
      </p>

      {loading ? (
        <p style={{ color: "#9ca3af", textAlign: "center" }}>Loading...</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 40 }}>🚗</p>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No searches yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => (
            <div key={r._id} style={{
              background: "#fff", borderRadius: 12, padding: "16px 18px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 15, color: "#1f2937" }}>
                  {r.year} {r.make} {r.model}
                  {r.variant && <span style={{ color: "#9ca3af", fontWeight: 400 }}> · {r.variant}</span>}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    {r.km_driven.toLocaleString("en-IN")} km
                  </span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    ₹{r.asking_price.toLocaleString("en-IN")}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                    color: verdictColor[r.price_verdict] || "#6b7280",
                    background: "#f9fafb",
                    border: `1px solid ${verdictColor[r.price_verdict] || "#e5e7eb"}`,
                    textTransform: "replace-all",
                  }}>{r.price_verdict?.replace("_", " ")}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                    color: recColor[r.buy_recommendation] || "#6b7280",
                    background: "#f9fafb",
                    border: `1px solid ${recColor[r.buy_recommendation] || "#e5e7eb"}`,
                  }}>{r.buy_recommendation}</span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => remove(r._id)}
                style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 20 }}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
