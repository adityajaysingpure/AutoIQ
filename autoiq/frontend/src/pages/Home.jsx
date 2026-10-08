import React, { useEffect, useState } from "react";
import CarForm        from "../components/ui/CarForm";
import AnalysisResult from "../components/ui/AnalysisResult";
import { useCar }     from "../hooks/useCar";
import { getPopular } from "../services/api";

export default function Home() {
  const { loading, result, error, analyse, reset } = useCar();
  const [popular, setPopular]   = useState([]);
  const [lastQuery, setLastQuery] = useState(null);

  useEffect(() => {
    getPopular()
      .then((r) => setPopular(r.data))
      .catch(() => {}); // popular cars is non-critical — fail silently
  }, []);

  const handleSubmit = (data) => {
    setLastQuery(data);
    analyse(data);
  };

  if (result) {
    return (
      <div style={pageWrapper}>
        <AnalysisResult
          result={result}
          askingPrice={lastQuery?.asking_price ?? 0}
          onReset={reset}
        />
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={pageTitle}>Is this car worth buying?</h2>
        <p style={pageSub}>
          Enter the car details and get an AI-powered price analysis, known issues,
          negotiation script, and inspection checklist — specific to the Indian market.
        </p>
      </div>

      {/* Form card */}
      <div style={card}>
        <CarForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div style={errorBox}>❌ {error}</div>
      )}

      {/* Popular cars */}
      {popular.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p style={popularLabel}>MOST SEARCHED CARS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {popular.map((car, i) => (
              <div key={i} style={popularChip}>
                {car.make} {car.model}
                <span style={popularScore}>⭐ {car.avg_reliability}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const pageWrapper = { maxWidth: 820, margin: "0 auto", padding: "24px 16px" };
const pageTitle   = { margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#1f2937" };
const pageSub     = { margin: 0, fontSize: 14, color: "#6b7280" };
const card        = { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 16 };
const errorBox    = { padding: "12px 16px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 14, marginBottom: 16 };
const popularLabel = { margin: "0 0 10px", fontSize: 12, color: "#9ca3af", fontWeight: 700, letterSpacing: "0.06em" };
const popularChip  = { padding: "6px 14px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, color: "#374151" };
const popularScore = { marginLeft: 8, color: "#9ca3af", fontSize: 11 };
