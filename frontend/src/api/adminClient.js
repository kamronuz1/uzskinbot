import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://uzskinbot-backend.onrender.com/api";

export function createAdminClient(token) {
  const c = axios.create({
    baseURL: API_URL,
  });

  c.interceptors.request.use((config) => {
    config.headers["x-admin-secret"] = token;
    return config;
  });

  return c;
}