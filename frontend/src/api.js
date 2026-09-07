import axios from "axios";

// In production the React app and FastAPI are served from the same origin.
// REACT_APP_BACKEND_URL is only needed when the frontend is hosted separately.
const BACKEND = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const API = `${BACKEND}/api`;
export const BACKEND_URL = BACKEND;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("golde_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (
      error.response?.status === 402 &&
      detail?.code === "coins_exhausted" &&
      window.location.pathname !== "/pricing"
    ) {
      sessionStorage.setItem("golde_billing_notice", detail.message || "Your free coins are finished.");
      window.location.assign(detail.pricing_url || "/pricing");
    }
    return Promise.reject(error);
  }
);

export function apiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && e.msg ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && detail.message) return detail.message;
  if (detail && detail.msg) return detail.msg;
  return String(detail);
}

export default api;
