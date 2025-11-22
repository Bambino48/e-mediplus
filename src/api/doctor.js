// src/api/doctor.js
import api from "./axiosInstance.js";

// ✅ API Réelles - Statistiques du médecin
export async function getDoctorStats() {
  const { data } = await api.get("/doctor/stats");
  return data; // { appointments_today: 5, revenue_month: 145000, pending_tasks: 1 }
}

// ✅ API Réelles - Données utilisateur de base
export async function getUserProfile() {
  const { data } = await api.get("/profile");
  return data; // { first_name: "Michel", last_name: "Kouamé", avatar: "...", email: "..." }
}

// ✅ API Réelles - Profil professionnel du médecin
export async function getDoctorProfile() {
  console.log("🔄 API getDoctorProfile - Calling /doctor/profile");
  const { data } = await api.get("/doctor/profile");
  console.log("✅ API getDoctorProfile - Response data:", data);
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
  const { data } = await api.get("/doctor/availabilities");
  // L'API retourne {availabilities: [...]}, on extrait le tableau
  return data.availabilities || [];
}

// ✅ API Disponibilités - Créer une nouvelle disponibilité
export async function createDoctorAvailability(availabilityData) {
  const { data } = await api.post("/doctor/availabilities", availabilityData);
  return data;
}

// ✅ API Disponibilités - Mettre à jour une disponibilité
export async function updateDoctorAvailability(id, availabilityData) {
  const { data } = await api.put(
    `/doctor/availabilities/${id}`,
    availabilityData
  );
  return data;
}

// ✅ API Disponibilités - Supprimer une disponibilité
export async function deleteDoctorAvailability(id) {
  const { data } = await api.delete(`/doctor/availabilities/${id}`);
  return data;
}
