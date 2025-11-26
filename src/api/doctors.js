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
  const response = await api.get("/doctors", { params });
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

  // Defensive: if backend does not return an aggregated `slots` object,
  // try to build it from a raw `availabilities` array so patient UI still works.
  if (!data || data.slots || !Array.isArray(data.availabilities)) {
    return data;
  }

  const availabilities = data.availabilities;

  const toHHMM = (t) => {
    if (!t) return t;
    const parts = String(t).split(":");
    const hh = parts[0].padStart(2, "0");
    const mm = (parts[1] || "00").padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const slots = {};
  const today = new Date();
  // Generate slots for the next 14 days for recurring availabilities
  const daysToBuild = 7;

  for (const a of availabilities) {
    const start = toHHMM(a.start_time);
    const end = toHHMM(a.end_time);

    if (a.is_recurring && a.day_of_week != null) {
      // Assume day_of_week follows 1=Monday .. 7=Sunday
      for (let i = 0; i < daysToBuild; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dow = d.getDay() === 0 ? 7 : d.getDay();
        if (dow === Number(a.day_of_week)) {
          const dateStr = d.toISOString().slice(0, 10);
          slots[dateStr] = slots[dateStr] || [];
          if (start) slots[dateStr].push(start);
          if (end) slots[dateStr].push(end);
        }
      }
    } else if (a.date) {
      const dateStr = String(a.date).slice(0, 10);
      slots[dateStr] = slots[dateStr] || [];
      if (start) slots[dateStr].push(start);
      if (end) slots[dateStr].push(end);
    }
  }

  // Normalize: unique + sort
  for (const date of Object.keys(slots)) {
    const uniq = Array.from(new Set(slots[date]));
    uniq.sort((x, y) => {
      const [xh, xm] = x.split(":").map(Number);
      const [yh, ym] = y.split(":").map(Number);
      return xh * 100 + xm - (yh * 100 + ym);
    });
    slots[date] = uniq;
  }

  return { ...data, slots };
};

/**
 * 🧩 Mise à jour du profil professionnel du docteur
 * @param {Object} payload - Données du profil professionnel à mettre à jour
 * @returns {Promise<Object>} Profil mis à jour
 */
export const updateDoctorProfile = async (payload) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token non trouvé");

  // Payload will be sent to the API; keep logs minimal in production

  try {
    const { data } = await api.put("/doctor/profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Réponse reçue (log supprimé pour production)
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
