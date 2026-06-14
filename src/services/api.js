import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isHandling401 = false;

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthFlow =
        url.includes("/auth/login") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password");

      if (!isAuthFlow && !isHandling401) {
        isHandling401 = true;
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
