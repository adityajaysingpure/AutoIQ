import { useState, useCallback } from "react";
import { analyseCar } from "../services/api";

const INITIAL = { loading: false, result: null, error: null };

export function useCar() {
  const [state, setState] = useState(INITIAL);

  const analyse = useCallback(async (formData) => {
    setState({ loading: true, result: null, error: null });
    try {
      const res = await analyseCar(formData);
      setState({ loading: false, result: res.data, error: null });
    } catch (err) {
      const msg = err.response?.data?.detail || "Analysis failed. Check your API key.";
      setState({ loading: false, result: null, error: msg });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, analyse, reset };
}
