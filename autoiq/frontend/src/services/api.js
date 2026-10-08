import axios from "axios";

/**
 * Centralised axios instance.
 * All requests go through here — base URL from env,
 * request/response interceptors in one place.
 */
const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 60000,   // GPT-4 can take up to 30s — give headroom
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — normalise error shape
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);

// Cars
export const analyseCar   = (data)       => http.post("/cars/analyse", data);
export const getPopular   = ()           => http.get("/cars/popular");

// Chat
export const askFollowup  = (data)       => http.post("/chat/ask", data);
export const getChatHist  = (id)         => http.get(`/chat/history/${id}`);

// History
export const getHistory   = (limit = 20) => http.get(`/history/?limit=${limit}`);
export const deleteRecord = (id)         => http.delete(`/history/${id}`);
