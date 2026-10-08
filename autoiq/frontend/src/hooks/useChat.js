import { useState, useCallback } from "react";
import { askFollowup } from "../services/api";

/**
 * useChat
 * -------
 * Per-session multi-turn chat state.
 * Optimistic: user message appended immediately,
 * assistant message appended on response.
 * On error: replaces optimistic message with error notice.
 */
export function useChat(sessionId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);

  const ask = useCallback(async (question) => {
    if (!question.trim() || !sessionId) return;

    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await askFollowup({ session_id: sessionId, question });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, loading, ask, clear };
}
