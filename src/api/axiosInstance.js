// src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://lightsalmon-elk-292300.hostingersite.com/backend/public",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Ajouter automatiquement le token
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

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enrichir l'erreur pour faciliter le debug côté frontend
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.message || data?.error || error.message || "Erreur réseau";

    // Log détaillé pour investigation (non bloquant)
    // eslint-disable-next-line no-console
    console.error("API ERROR:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status,
      data,
      message,
    });

    // Si 401 -> token invalide : nettoyer le token local pour éviter rebouclage
    if (status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (e) {
        /* silent */
      }
    }

    // Construire un objet erreur plus lisible
    const enriched = {
      original: error,
      status,
      data,
      message,
    };
    return Promise.reject(enriched);
  }
);

export default api;
