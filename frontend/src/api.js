import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND}/api`;
export const BACKEND_URL = BACKEND;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("golde_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && e.msg ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && detail.msg) return detail.msg;
  return String(detail);
}

export default api;
