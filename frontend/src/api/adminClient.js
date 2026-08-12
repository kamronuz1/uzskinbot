import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function createAdminClient(token) {
  const c = axios.create({ baseURL: API_URL });
  c.interceptors.request.use((config) => {
    config.headers["x-admin-secret"] = token;
    return config;
  });
  return c;
}