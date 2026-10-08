import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const verdictMeta = {
  great_deal:  { label: "Great Deal 🎉",  color: "#22c55e", bg: "#dcfce7" },
  fair:        { label: "Fair Price ✅",   color: "#3b82f6", bg: "#dbeafe" },
  overpriced:  { label: "Overpriced ⚠️",  color: "#f59e0b", bg: "#fef3c7" },
  avoid:       { label: "Avoid ❌",        color: "#ef4444", bg: "#fee2e2" },
};

export default function PriceCard({ pa, askingPrice }) {
  const meta = verdictMeta[pa.verdict] || verdictMeta.fair;

  const chartData = [
    { name: "Market Low",  price: pa.fair_price_range_low  / 100000 },
    { name: "Market Avg",  price: pa.market_avg             / 100000 },
    { name: "Market High", price: pa.fair_price_range_high / 100000 },
    { name: "Asking",      price: askingPrice               / 100000 },
  ];

  const fmt = (n) => `₹${(n / 100000).toFixed(1)}L`;

  return (
    <div>
      {/* Verdict badge */}
      <div style={{
        padding: "14px 18px", borderRadius: 12, marginBottom: 16,
        background: meta.bg, border: `1.5px solid ${meta.color}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: meta.color }}>
            {meta.label}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            Fair range: {fmt(pa.fair_price_range_low)} – {fmt(pa.fair_price_range_high)}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Market avg</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "#1f2937" }}>
            {fmt(pa.market_avg)}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
          <Tooltip formatter={(v) => [`₹${v.toFixed(1)}L`]} />
          <Bar dataKey="price" radius={[6, 6, 0, 0]}
            fill="#dc2626"
            label={{ position: "top", fontSize: 10, formatter: (v) => `₹${v.toFixed(1)}L` }}
          />
          <ReferenceLine
            y={askingPrice / 100000}
            stroke="#dc2626" strokeDasharray="4 3"
            label={{ value: "Asking", position: "right", fontSize: 10, fill: "#dc2626" }}
          />
        </BarChart>
      </ResponsiveContainer>

      <p style={{ margin: "12px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
        {pa.price_reasoning}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
        {pa.depreciation_note}
      </p>
    </div>
  );
}
