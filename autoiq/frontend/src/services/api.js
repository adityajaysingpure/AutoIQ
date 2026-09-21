import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const http = axios.create({ baseURL: BASE });

export const analyseCar   = (data)       => http.post("/cars/analyse", data);
export const getPopular   = ()           => http.get("/cars/popular");
export const askFollowup  = (data)       => http.post("/chat/ask", data);
export const getChatHistory = (id)       => http.get(`/chat/history/${id}`);
export const getHistory   = (limit = 20) => http.get(`/history/?limit=${limit}`);
export const deleteRecord = (id)         => http.delete(`/history/${id}`);
