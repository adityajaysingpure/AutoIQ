import { useState, useCallback } from "react";
import { analyseCar } from "../services/api";

/**
 * useCar
 * ------
 * Manages the full analysis lifecycle:
 *   idle → loading → success | error
 *
 * Error messages come normalised from the axios interceptor
 * so we never need to dig into err.response.data here.
 */
const IDLE = { loading: false, result: null, error: null };

export function useCar() {
  const [state, setState] = useState(IDLE);

  const analyse = useCallback(async (formData) => {
    setState({ loading: true, result: null, error: null });
    try {
      const { data } = await analyseCar(formData);
      setState({ loading: false, result: data, error: null });
    } catch (err) {
      setState({ loading: false, result: null, error: err.message });
    }
  }, []);

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, analyse, reset };
}
