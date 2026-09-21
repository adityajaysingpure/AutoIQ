import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
        <nav style={{
          background: "#1f2937", height: 56,
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 24,
        }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>
            Auto<span style={{ color: "#dc2626" }}>IQ</span>
          </span>
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            AI Used Car Research · Indian Market
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {[{ to: "/", label: "Analyse" }, { to: "/history", label: "History" }].map(({ to, label }) => (
              <NavLink key={to} to={to} end style={({ isActive }) => ({
                padding: "6px 14px", borderRadius: 8, fontSize: 13,
                fontWeight: 600, textDecoration: "none",
                background: isActive ? "#374151" : "transparent",
                color: isActive ? "#fff" : "#9ca3af",
              })}>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
