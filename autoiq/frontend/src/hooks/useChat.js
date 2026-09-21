import { useState, useCallback } from "react";
import { askFollowup } from "../services/api";

export function useChat(sessionId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);

  const ask = useCallback(async (question) => {
    if (!question.trim() || !sessionId) return;

    // Optimistic user message
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await askFollowup({ session_id: sessionId, question });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const clear = () => setMessages([]);

  return { messages, loading, ask, clear };
}
