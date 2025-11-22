import api from "./axiosInstance.js";

/**
 * ✅ API Téléconsultations - Connexion aux routes Laravel réelles
 *
 * Routes backend disponibles :
 * - POST /teleconsult/create
 * - GET /teleconsult/token/{roomId}
 * - POST /teleconsult/end/{roomId}
 *
 * Structure BDD : teleconsult_rooms
 * - id, room_id, doctor_id, patient_id, status, started_at, ended_at
 */

// ✅ Créer une nouvelle session de téléconsultation
export async function createTeleconsultRoom(doctorId = null) {
  const payload = {};
  if (doctorId) payload.doctor_id = doctorId;

  const { data } = await api.post("/teleconsult/create", payload);
  return data; // { room_id, doctor_id, patient_id, status, started_at, ... }
}

// ✅ Obtenir le token Agora pour rejoindre une salle
export async function getTeleconsultToken(roomId) {
  const { data } = await api.get(`/teleconsult/token/${roomId}`);
  return data; // { token, appId, channel, uid }
}

// ✅ Terminer une téléconsultation
export async function endTeleconsultRoom(roomId) {
  const { data } = await api.post(`/teleconsult/end/${roomId}`);
  return data; // { success: true, ended_at }
}

// ✅ Récupérer les téléconsultations actives du patient
export async function getActiveTeleconsults() {
  // TODO: Ajouter route backend si nécessaire
  // Pour l'instant, on peut filtrer depuis les rendez-vous
  const { data } = await api.get("/patient/appointments");

  // Filtrer les rendez-vous en mode "video" avec status "confirmed" ou "in_progress"
  const activeTeleconsults = Array.isArray(data)
    ? data.filter(
        (apt) =>
          apt.mode === "video" &&
          (apt.status === "confirmed" || apt.status === "in_progress")
      )
    : [];

  return activeTeleconsults;
}

// ✅ Récupérer les téléconsultations actives du doctor
export async function getActiveTeleconsultsByDoctor(doctorId) {
  const { data } = await api.get(`/pro/appointments?doctor_id=${doctorId}`);

  // Filtrer les rendez-vous en mode "video" avec status "confirmed" ou "in_progress"
  const activeTeleconsults = Array.isArray(data?.items)
    ? data.items.filter(
        (apt) =>
          apt.mode === "video" &&
          (apt.status === "confirmed" || apt.status === "in_progress")
      )
    : [];

  return activeTeleconsults;
}

// ✅ Récupérer l'historique des téléconsultations
export async function getTeleconsultHistory() {
  const { data } = await api.get("/patient/appointments");

  const history = Array.isArray(data)
    ? data.filter((apt) => apt.mode === "video" && apt.status === "completed")
    : [];

  return history;
}

// ✅ Récupérer l'historique des téléconsultations du doctor
export async function getTeleconsultHistoryByDoctor(doctorId) {
  const { data } = await api.get(`/pro/appointments?doctor_id=${doctorId}`);

  const history = Array.isArray(data?.items)
    ? data.items.filter(
        (apt) => apt.mode === "video" && apt.status === "completed"
      )
    : [];

  return history;
}

// 🧪 LEGACY - Pour compatibilité avec ancien code
export async function startTeleconsult(roomId) {
  // Si c'est un roomId existant, on récupère le token
  if (roomId) {
    return getTeleconsultToken(roomId);
  }
  // Sinon on crée une nouvelle salle
  return createTeleconsultRoom();
}
