// src/api/doctors.js
import api from "./axiosInstance";

/**
 * 🧩 Récupération de la liste des docteurs (route publique)
 * @param {Object} params - Paramètres de filtrage et pagination
 * @param {number} params.per_page - Nombre de résultats par page (défaut: 20)
 * @param {string} params.sort_by - Critère de tri (nom, date, note, tarifs)
 * @param {string} params.sort_order - Ordre de tri (asc/desc)
 * @param {string} params.city - Filtrage par ville
 * @param {string} params.specialty - Filtrage par spécialité
 * @param {boolean} params.has_profile - Profils complets uniquement
 * @returns {Promise<Object>} Liste des docteurs avec pagination
 */
export const getDoctorsList = async (params = {}) => {
  console.log("🌐 API getDoctorsList - Calling /doctors with params:", params);
  const response = await api.get("/doctors", { params });
  console.log("🌐 API getDoctorsList - Raw response:", response);
  console.log("🌐 API getDoctorsList - Response data:", response.data);
  // Retourne directement la structure complète pour que le composant puisse accéder aux docteurs
  return response.data;
};

/**
 * 🧩 Récupération des détails d'un docteur spécifique
 * @param {number} doctorId - ID du docteur
 * @returns {Promise<Object>} Détails du docteur
 */
export const getDoctorDetails = async (doctorId) => {
  const { data } = await api.get(`/doctors/${doctorId}`);
  return data;
};

/**
 * 🧩 Récupération des disponibilités d'un docteur
 * @param {number} doctorId - ID du docteur
 * @param {Object} params - Paramètres de filtrage des disponibilités
 * @returns {Promise<Object>} Disponibilités du docteur
 */
export const getDoctorAvailabilities = async (doctorId, params = {}) => {
  const { data } = await api.get(`/doctors/${doctorId}/availabilities`, {
    params,
  });
  return data;
};

/**
 * 🧩 Mise à jour du profil professionnel du docteur
 * @param {Object} payload - Données du profil professionnel à mettre à jour
 * @returns {Promise<Object>} Profil mis à jour
 */
export const updateDoctorProfile = async (payload) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token non trouvé");

  console.log("🔄 API updateDoctorProfile - Payload envoyé:", payload);
  console.log("🔄 API updateDoctorProfile - Type de payload:", typeof payload);
  console.log(
    "🔄 API updateDoctorProfile - Clés du payload:",
    Object.keys(payload)
  );

  try {
    const { data } = await api.put("/doctor/profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ API updateDoctorProfile - Réponse réussie:", data);
    return data;
  } catch (error) {
    console.error("❌ API updateDoctorProfile - Erreur complète:", error);
    console.error(
      "❌ API updateDoctorProfile - Response data:",
      error.response?.data
    );
    console.error(
      "❌ API updateDoctorProfile - Response status:",
      error.response?.status
    );

    // Afficher les erreurs de validation détaillées
    if (error.response?.data?.errors) {
      console.error(
        "❌ API updateDoctorProfile - Erreurs de validation:",
        error.response.data.errors
      );
      // Afficher chaque erreur individuellement
      Object.entries(error.response.data.errors).forEach(
        ([field, messages]) => {
          console.error(`❌ ${field}:`, messages);
        }
      );
    }

    throw error;
  }
};

/**
 * 🧩 Récupération du profil professionnel du docteur connecté
 * @returns {Promise<Object>} Profil professionnel du docteur
 */
export const getDoctorProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token non trouvé");

  const { data } = await api.get("/doctor/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
