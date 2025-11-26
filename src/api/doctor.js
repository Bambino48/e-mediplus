// src/api/doctor.js
import api from "./axiosInstance.js";

// ✅ API Réelles - Statistiques du médecin
export async function getDoctorStats() {
  try {
    const { data } = await api.get("/doctor/stats");
    return data; // { appointments_today: 5, revenue_month: 145000, pending_tasks: 1 }
  } catch (err) {
    // Si l'erreur est un 500 (par ex. pas de stats en base), ne pas spammer la console
    const status = err?.response?.status;
    if (status === 500) {
      return { appointments_today: 0, revenue_month: 0, pending_tasks: 0 };
    }

    // Retourner un fallback silencieux pour toutes les autres erreurs afin
    // d'éviter d'afficher des logs clients répétitifs si le backend a un bug
    return { appointments_today: 0, revenue_month: 0, pending_tasks: 0 };
  }
}

// ✅ API Réelles - Données utilisateur de base
export async function getUserProfile() {
  const { data } = await api.get("/profile");
  return data; // { first_name: "Michel", last_name: "Kouamé", avatar: "...", email: "..." }
}

// ✅ API Réelles - Profil professionnel du médecin
export async function getDoctorProfile() {
  // Removed debug logs to reduce console noise
  const { data } = await api.get("/doctor/profile");
  return data; // Données du profil professionnel (city, address, phone, fees, etc.)
}

// ✅ API Réelles - Rendez-vous du jour
export async function getDoctorTodayAppointments() {
  const { data } = await api.get("/doctor/appointments/today");
  return data; // { items: [...] }
}

// ✅ API Réelles - Revenus du mois
export async function getDoctorMonthlyRevenue() {
  const { data } = await api.get("/doctor/revenue/month");
  return data; // { amount: 145000, currency: "FCFA" }
}

// ✅ API Réelles - Tâches en attente
export async function getDoctorPendingTasks() {
  const { data } = await api.get("/doctor/tasks/pending");
  return data; // { prescriptions: 1, reviews: 0, messages: 2 }
}

// ✅ API Disponibilités - Récupérer toutes les disponibilités du médecin
export async function getDoctorAvailabilities() {
  try {
    const { data } = await api.get("/doctor/availabilities");
    // L'API retourne {availabilities: [...]}, on extrait le tableau
    return data.availabilities || [];
  } catch (err) {
    // Retourner tableau vide si erreur (422, 500...) pour ne pas casser l'UI
    return [];
  }
}

// ✅ API Disponibilités - Créer une nouvelle disponibilité
export async function createDoctorAvailability(availabilityData) {
  const { data } = await api.post("/doctor/availabilities", availabilityData);
  // Normaliser la réponse : certaines API renvoient { availability: {...} }
  // Retourner directement l'objet disponibilité pour simplifier l'usage côté client
  return data?.availability || data;
}

// ✅ API Disponibilités - Mettre à jour une disponibilité
export async function updateDoctorAvailability(id, availabilityData) {
  const { data } = await api.put(
    `/doctor/availabilities/${id}`,
    availabilityData
  );
  return data?.availability || data;
}

// ✅ API Disponibilités - Supprimer une disponibilité
export async function deleteDoctorAvailability(id) {
  const { data } = await api.delete(`/doctor/availabilities/${id}`);
  // Si l'API retourne { success: true, id }, retourner l'id supprimé
  if (data && (data.id || data.deleted_id)) {
    return data.id || data.deleted_id;
  }
  return data;
}
