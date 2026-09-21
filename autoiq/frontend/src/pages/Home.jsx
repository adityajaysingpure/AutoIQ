import React, { useEffect, useState } from "react";
import CarForm from "../components/ui/CarForm";
import AnalysisResult from "../components/ui/AnalysisResult";
import { useCar } from "../hooks/useCar";
import { getPopular } from "../services/api";

export default function Home() {
  const { loading, result, error, analyse, reset } = useCar();
  const [popular, setPopular] = useState([]);
  const [lastQuery, setLastQuery] = useState(null);

  useEffect(() => {
    getPopular().then((r) => setPopular(r.data)).catch(() => {});
  }, []);

  const handleSubmit = (data) => {
    setLastQuery(data);
    analyse(data);
  };

  if (result) {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        <AnalysisResult
          result={result}
          askingPrice={lastQuery?.asking_price || 0}
          onReset={reset}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#1f2937" }}>
          Is this car worth buying?
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
          Enter the car details and get an AI-powered price analysis, known issues,
          negotiation script, and inspection checklist — specific to the Indian market.
        </p>
      </div>

      <div style={{
        background: "#fff", borderRadius: 14, padding: 24,
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20,
      }}>
        <CarForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 10,
          background: "#fee2e2", border: "1px solid #fca5a5",
          color: "#991b1b", fontSize: 14, marginBottom: 16,
        }}>
          ❌ {error}
        </div>
      )}

      {popular.length > 0 && (
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>
            MOST SEARCHED CARS
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {popular.map((car, i) => (
              <div key={i} style={{
                padding: "6px 14px", borderRadius: 999,
                border: "1px solid #e5e7eb", background: "#fff",
                fontSize: 13, color: "#374151",
              }}>
                {car.make} {car.model}
                <span style={{ marginLeft: 6, color: "#9ca3af", fontSize: 11 }}>
                  ⭐ {car.avg_reliability}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
