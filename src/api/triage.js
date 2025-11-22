// src/api/triage.js
import axiosInstance from "./axiosInstance";

/**
 * Récupère l'historique des sessions de triage du patient connecté
 * GET /patient/triage
 * @returns {Promise<Array>} Liste des sessions (id, symptoms, result, created_at)
 */
export const getTriageSessions = async () => {
  try {
    const response = await axiosInstance.get("/patient/triage");
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des sessions de triage:",
      error
    );
    throw error;
  }
};

/**
 * Crée une nouvelle session de triage avec analyse des symptômes
 * POST /patient/triage
 * @param {string} symptoms - Description des symptômes du patient
 * @returns {Promise<Object>} Session créée avec résultat de l'analyse IA
 */
export const createTriageSession = async (symptoms) => {
  try {
    const response = await axiosInstance.post("/patient/triage", { symptoms });
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la création de la session de triage:", error);
    throw error;
  }
};

/**
 * Récupère le détail d'une session de triage
 * GET /patient/triage/{id}
 * @param {number} id - ID de la session
 * @returns {Promise<Object>} Détails de la session
 */
export const getTriageSession = async (id) => {
  try {
    const response = await axiosInstance.get(`/patient/triage/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la session:", error);
    throw error;
  }
};

/**
 * Extrait le niveau d'urgence depuis le résultat JSON
 * @param {Object} result - Objet JSON avec {urgency, triage, recommendation}
 * @returns {string} "haute" | "modérée" | "basse"
 */
export const parseUrgencyLevel = (result) => {
  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);
      return parsed.urgency || "basse";
    } catch {
      return "basse";
    }
  }
  return result?.urgency || "basse";
};

/**
 * Détermine la couleur du badge selon l'urgence
 * @param {string} urgency - Niveau d'urgence
 * @returns {Object} Classes Tailwind pour le badge
 */
export const getUrgencyBadgeClasses = (urgency) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

  switch (urgency) {
    case "haute":
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
    case "modérée":
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
    case "basse":
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
  }
};

/**
 * Formate la date pour l'affichage
 * @param {string} dateString - Date ISO
 * @returns {string} Date formatée "DD/MM/YYYY à HH:MM"
 */
export const formatTriageDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
