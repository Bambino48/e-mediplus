// src/api/patient.js
import api from "./axiosInstance.js";

// ✅ API Réelles - Statistiques du patient basées sur les vraies tables
export async function getPatientStats() {
  const { data } = await api.get("/patient/stats");
  return data; // {
  //   upcoming_appointments: 3,
  //   active_prescriptions: 2,
  //   pending_payments: 1,
  //   total_consultations: 15,
  //   active_teleconsults: 0
  // }
}

// ✅ API Réelles - Rendez-vous à venir (table appointments)
export async function getPatientUpcomingAppointments() {
  const { data } = await api.get("/patient/appointments/upcoming");
  return data; // { items: [...] } avec status, scheduled_at, doctor info
}

// ✅ API Réelles - Prescriptions actives (tables prescriptions + medications)
export async function getPatientActivePrescriptions() {
  const { data } = await api.get("/patient/prescriptions/active");
  return data; // { items: [...] } avec medications array
}

// ✅ API Réelles - Paiements en attente (table payments)
export async function getPatientPendingPayments() {
  const { data } = await api.get("/patient/payments/pending");
  return data; // { items: [...] } avec amount, status, appointment info
}

// ✅ API Réelles - Téléconsultations actives (table teleconsult_rooms)
export async function getPatientActiveTeleconsults() {
  const { data } = await api.get("/patient/teleconsults/active");
  return data; // { items: [...] } avec room_id, doctor info, status
}

// ✅ API Réelles - Historique des paiements (table payments)
export async function getPatientPaymentHistory() {
  const { data } = await api.get("/patient/payments/history");
  return data; // { items: [...] } triés par date décroissante
}

// ✅ API Réelles - Rendez-vous du jour (table appointments)
export async function getPatientTodayAppointments() {
  const { data } = await api.get("/patient/appointments/today");
  return data; // { items: [...] } pour aujourd'hui
}

// ✅ API Réelles - Médicaments à prendre aujourd'hui (table medications)
export async function getPatientTodayMedications() {
  const { data } = await api.get("/patient/medications/today");
  return data; // { items: [...] } avec dosage, frequency, etc.
}
