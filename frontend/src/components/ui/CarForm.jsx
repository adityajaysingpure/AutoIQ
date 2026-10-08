import React from "react";
import { useForm } from "react-hook-form";

const MAKES  = ["Maruti", "Hyundai", "Tata", "Honda", "Toyota", "Kia", "MG",
                "Mahindra", "Ford", "Volkswagen", "Skoda", "Renault", "Nissan", "Other"];
const FUELS  = ["petrol", "diesel", "cng", "electric", "hybrid"];
const TRANS  = ["manual", "automatic", "amt"];
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad",
                "Chennai", "Ahmedabad", "Kolkata", "Jaipur", "Surat", "Other"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);

/**
 * CarForm — react-hook-form
 *
 * register() for all native inputs/selects.
 * Built-in validation rules — required, min, max, valueAsNumber.
 * onSubmit fires only when all rules pass.
 * No manual canSubmit flag needed — RHF handles that via isValid.
 */
export default function CarForm({ onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      make: "", model: "", variant: "",
      year: currentYear - 3,
      km_driven: "", asking_price: "",
      fuel_type: "petrol", transmission: "manual",
      city: "", seller_type: "individual",
    },
    mode: "onTouched",
  });

  const onValid = (data) => {
    onSubmit({
      ...data,
      year:          Number(data.year),
      km_driven:     Number(data.km_driven),
      asking_price:  Number(data.asking_price),
    });
  };

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <div style={grid}>

        <Field label="Make" required error={errors.make?.message}>
          <select {...register("make", { required: "Make is required." })} style={inp(errors.make)}>
            <option value="">Select make</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="Model" required error={errors.model?.message}>
          <input
            {...register("model", {
              required:  "Model is required.",
              minLength: { value: 2, message: "Enter a valid model name." },
            })}
            placeholder="e.g. Swift, Creta, Nexon"
            style={inp(errors.model)}
          />
        </Field>

        <Field label="Variant" error={errors.variant?.message}>
          <input
            {...register("variant")}
            placeholder="e.g. VXI, SX, XZ+"
            style={inp()}
          />
        </Field>

        <Field label="Year" required error={errors.year?.message}>
          <select
            {...register("year", {
              required: "Year is required.",
              valueAsNumber: true,
            })}
            style={inp(errors.year)}
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>

        <Field label="KM Driven" required error={errors.km_driven?.message}>
          <input
            type="number"
            {...register("km_driven", {
              required:  "KM driven is required.",
              valueAsNumber: true,
              min: { value: 0,      message: "Cannot be negative." },
              max: { value: 500000, message: "Value seems too high." },
            })}
            placeholder="e.g. 45000"
            style={inp(errors.km_driven)}
          />
        </Field>

        <Field label="Asking Price (₹)" required error={errors.asking_price?.message}>
          <input
            type="number"
            {...register("asking_price", {
              required:  "Asking price is required.",
              valueAsNumber: true,
              min: { value: 10000,    message: "Price seems too low." },
              max: { value: 10000000, message: "Price seems too high." },
            })}
            placeholder="e.g. 550000"
            style={inp(errors.asking_price)}
          />
        </Field>

        <Field label="Fuel Type" error={errors.fuel_type?.message}>
          <select {...register("fuel_type")} style={inp()}>
            {FUELS.map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
        </Field>

        <Field label="Transmission" error={errors.transmission?.message}>
          <select {...register("transmission")} style={inp()}>
            {TRANS.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </Field>

        <Field label="City" error={errors.city?.message}>
          <select {...register("city")} style={inp()}>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Seller Type" error={errors.seller_type?.message}>
          <select {...register("seller_type")} style={inp()}>
            <option value="individual">Individual</option>
            <option value="dealer">Dealer</option>
          </select>
        </Field>

      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          ...submitBtn,
          background: loading ? "#e5e7eb" : "#dc2626",
          color:      loading ? "#9ca3af" : "#fff",
          cursor:     loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "🤖 Analysing with GPT-4... (15–30s)" : "🔍 Analyse This Car"}
      </button>
    </form>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function Field({ label, required, error, children }) {
  return (
    <div>
      <label style={labelSt}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
        {!required && <span style={{ color: "#9ca3af", fontWeight: 400 }}> (optional)</span>}
      </label>
      {children}
      {error && <p style={errSt}>{error}</p>}
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const inp = (err) => ({
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: `1.5px solid ${err ? "#ef4444" : "#e5e7eb"}`,
  fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
});

const submitBtn = {
  marginTop: 20, width: "100%", padding: "14px",
  borderRadius: 10, border: "none",
  fontWeight: 700, fontSize: 15,
  transition: "background 0.2s",
};

const labelSt = {
  display: "block", marginBottom: 6,
  fontSize: 13, fontWeight: 600, color: "#374151",
};

const errSt = { margin: "4px 0 0", fontSize: 12, color: "#ef4444" };
