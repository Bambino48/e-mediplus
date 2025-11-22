// main.jsx (tout en haut)
window.global ||= window;
window.process ||= {
  env: {},
  nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
  browser: true,
};

// Fonction pour nettoyer le localStorage corrompu
const cleanLocalStorage = () => {
  const keysToCheck = ["token", "cachedUser", "theme", "locale"];

  keysToCheck.forEach((key) => {
    let value;
    try {
      value = localStorage.getItem(key);
      if (value) {
        // Essayer de parser seulement si c'est censé être du JSON et que ça ressemble à du JSON
        if (
          (key === "cachedUser" || key === "token") &&
          (value.startsWith("{") ||
            value.startsWith("[") ||
            value.startsWith('"'))
        ) {
          JSON.parse(value);
        }
      }
    } catch (error) {
      console.warn(
        `Suppression de la clé localStorage corrompue: ${key} (valeur: "${value?.substring(
          0,
          50
        )}...")`,
        error
      );
      localStorage.removeItem(key);
    }
  });

  // Nettoyage supplémentaire pour les clés inconnues qui pourraient contenir du JSON invalide
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      let value;
      try {
        value = localStorage.getItem(key);
        if (
          value &&
          (value.includes('"MediPlus') ||
            value.startsWith('"MediPlus') ||
            value.includes("MediPlusAc"))
        ) {
          console.warn(`Suppression de clé suspecte: ${key}`);
          localStorage.removeItem(key);
          i--; // Ajuster l'index après suppression
        }
      } catch (error) {
        console.warn(`Suppression de clé corrompue: ${key}`, error);
        localStorage.removeItem(key);
        i--; // Ajuster l'index après suppression
      }
    }
  }

  // Nettoyage forcé de toutes les clés qui commencent par des guillemets et contiennent MediPlus
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    let value;
    try {
      value = localStorage.getItem(key);
      if (
        value &&
        (value.startsWith('"MediPlus') || value.includes("MediPlusAc"))
      ) {
        console.warn(`Nettoyage forcé de clé suspecte: ${key}`);
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Erreur lors du nettoyage de ${key}:`, error);
      localStorage.removeItem(key);
    }
  });
};

// Gestionnaire d'erreur global pour les erreurs JSON
window.addEventListener("error", (event) => {
  if (
    event.error &&
    event.error.message &&
    event.error.message.includes("JSON")
  ) {
    console.warn("Erreur JSON capturée globalement:", event.error);
    // Empêcher la propagation de l'erreur
    event.preventDefault();
  }
});

// Gestionnaire pour les erreurs non capturées
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes("JSON")
  ) {
    console.warn("Promesse rejetée avec erreur JSON:", event.reason);
    event.preventDefault();
  }
});

// Fonction de nettoyage d'urgence (accessible via console)
window.forceCleanLocalStorage = () => {
  console.log("🧹 Nettoyage d'urgence du localStorage...");
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    let value;
    try {
      value = localStorage.getItem(key);
      if (
        value &&
        (value.includes("MediPlus") ||
          (!value.startsWith("{") &&
            !value.startsWith("[") &&
            value.startsWith('"')))
      ) {
        console.log(`Suppression de ${key}: ${value.substring(0, 50)}...`);
        localStorage.removeItem(key);
      }
    } catch (e) {
      localStorage.removeItem(key);
    }
  });
  console.log("✅ Nettoyage terminé");
};

// Nettoyer le localStorage au démarrage
cleanLocalStorage();

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
