// src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // ✅ Laravel API base
  withCredentials: false, // ❌ pas besoin de cookie Sanctum car on utilise Bearer token
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Intercepteur pour ajouter automatiquement le token si présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Gestion uniforme des erreurs (affichage propre côté frontend)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Erreur réseau";
    return Promise.reject({ ...error, message });
  }
);

export default api;
