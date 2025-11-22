// Simplified appointments API for build compatibility
const API_BASE = "http://127.0.0.1:8000/api";

// ✅ API Réelles - Prochain rendez-vous du patient
export async function getNextAppointment() {
  const response = await fetch(`${API_BASE}/patient/appointments/next`);
  return response.json();
}

// ✅ API Réelles - Liste des rendez-vous du patient
export async function getPatientAppointments() {
  const response = await fetch(`${API_BASE}/patient/appointments`);
  const data = await response.json();
  return Array.isArray(data) ? { items: data } : data;
}

// ✅ API Réelles - Créer un rendez-vous
export async function bookAppointment(payload) {
  const response = await fetch(`${API_BASE}/patient/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}

// ✅ API Réelles - Consultations récentes du patient
export async function getRecentConsultations() {
  const response = await fetch(`${API_BASE}/patient/consultations/recent`);
  return response.json();
}

// ✅ API Réelles - Annuler un rendez-vous
export async function cancelAppointment(appointmentId) {
  const response = await fetch(
    `${API_BASE}/patient/appointments/${appointmentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    }
  );
  return response.json();
}

// ✅ API Réelles - Modifier un rendez-vous
export async function updateAppointment(appointmentId, payload) {
  const response = await fetch(
    `${API_BASE}/patient/appointments/${appointmentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
}

// ✅ API Réelles - Disponibilités médecin
export async function getDoctorAvailabilities(doctorId) {
  const response = await fetch(
    `${API_BASE}/doctors/${doctorId}/availabilities`
  );
  return response.json();
}

export default {
  getNextAppointment,
  getPatientAppointments,
  bookAppointment,
  getRecentConsultations,
  cancelAppointment,
  updateAppointment,
  getDoctorAvailabilities,
};
