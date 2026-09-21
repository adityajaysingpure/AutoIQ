import React, { useState } from "react";

const MAKES = ["Maruti", "Hyundai", "Tata", "Honda", "Toyota", "Kia", "MG",
               "Mahindra", "Ford", "Volkswagen", "Skoda", "Renault", "Nissan", "Other"];
const FUELS = ["petrol", "diesel", "cng", "electric", "hybrid"];
const TRANS = ["manual", "automatic", "amt"];
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad",
                "Chennai", "Ahmedabad", "Kolkata", "Jaipur", "Surat", "Other"];

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

export default function CarForm({ onSubmit, loading }) {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    make: "", model: "", variant: "",
    year: currentYear - 3, km_driven: "",
    asking_price: "", fuel_type: "petrol",
    transmission: "manual", city: "", seller_type: "individual",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.make && form.model && form.km_driven && form.asking_price;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...form,
      year: parseInt(form.year),
      km_driven: parseInt(form.km_driven),
      asking_price: parseFloat(form.asking_price),
    });
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        <div>
          <label style={labelStyle}>Make <Required /></label>
          <select value={form.make} onChange={(e) => set("make", e.target.value)} style={inp}>
            <option value="">Select make</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Model <Required /></label>
          <input
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            placeholder="e.g. Swift, Creta, Nexon"
            style={inp}
          />
        </div>

        <div>
          <label style={labelStyle}>Variant <Optional /></label>
          <input
            value={form.variant}
            onChange={(e) => set("variant", e.target.value)}
            placeholder="e.g. VXI, SX, XZ+"
            style={inp}
          />
        </div>

        <div>
          <label style={labelStyle}>Year <Required /></label>
          <select value={form.year} onChange={(e) => set("year", e.target.value)} style={inp}>
            {Array.from({ length: 20 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>KM Driven <Required /></label>
          <input
            type="number" value={form.km_driven}
            onChange={(e) => set("km_driven", e.target.value)}
            placeholder="e.g. 45000"
            style={inp}
          />
        </div>

        <div>
          <label style={labelStyle}>Asking Price (₹) <Required /></label>
          <input
            type="number" value={form.asking_price}
            onChange={(e) => set("asking_price", e.target.value)}
            placeholder="e.g. 550000"
            style={inp}
          />
        </div>

        <div>
          <label style={labelStyle}>Fuel Type</label>
          <select value={form.fuel_type} onChange={(e) => set("fuel_type", e.target.value)} style={inp}>
            {FUELS.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Transmission</label>
          <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} style={inp}>
            {TRANS.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>City <Optional /></label>
          <select value={form.city} onChange={(e) => set("city", e.target.value)} style={inp}>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Seller Type</label>
          <select value={form.seller_type} onChange={(e) => set("seller_type", e.target.value)} style={inp}>
            <option value="individual">Individual</option>
            <option value="dealer">Dealer</option>
          </select>
        </div>

      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        style={{
          marginTop: 20, width: "100%", padding: "14px",
          borderRadius: 10, border: "none", fontWeight: 700, fontSize: 15,
          cursor: canSubmit && !loading ? "pointer" : "not-allowed",
          background: canSubmit && !loading ? "#dc2626" : "#e5e7eb",
          color: canSubmit && !loading ? "#fff" : "#9ca3af",
          transition: "background 0.2s",
        }}
      >
        {loading ? "🤖 Analysing with GPT-4... (15–30s)" : "🔍 Analyse This Car"}
      </button>
    </div>
  );
}

const Required = () => <span style={{ color: "#ef4444" }}> *</span>;
const Optional = () => <span style={{ color: "#9ca3af", fontWeight: 400 }}> (optional)</span>;
const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" };
