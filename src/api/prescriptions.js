// src/api/prescriptions.js
import api from "./axiosInstance.js";

// ✅ API Réelles - Liste des ordonnances du patient
export async function getPatientPrescriptions() {
  const { data } = await api.get("/patient/prescriptions");
  return data; // { items: [...] }
}

// ✅ API Réelles - Créer une ordonnance (Laravel)
export async function createPrescription(payload) {
  // payload: { patient_id, medications: [{ name, dosage, posology, intake, frequency, duration_days, instructions }] }
  if (!payload?.patient_id || !Array.isArray(payload?.medications)) {
    throw new Error("Données d'ordonnance incomplètes");
  }

  // Transformer les données pour correspondre au format attendu par Laravel
  const content = payload.medications.map((med) => ({
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    times: med.intake ? med.intake.split(",").map((t) => t.trim()) : [],
    duration_days: med.duration_days,
    instructions: med.instructions || "",
    // Pour l'instant on ne gère pas posology séparément côté backend
  }));

  try {
    // Appel à l'API Laravel réelle
    const { data } = await api.post("/pro/prescriptions", {
      patient_id: payload.patient_id,
      content: content,
    });

    return data;
  } catch (error) {
    // Fallback vers le mock local en cas d'erreur
    console.warn(
      "Erreur API Laravel, utilisation du mock local:",
      error.message
    );
    throw error; // Remonter l'erreur pour que l'UI la gère
  }
}

// ✅ API Réelles - Liste des ordonnances du docteur
export async function getDoctorPrescriptions() {
  const { data } = await api.get("/pro/prescriptions");
  return data; // { items: [...] }
}

// ✅ API Réelles - Supprimer une prescription (médecin uniquement)
export async function deletePrescription(prescriptionId) {
  const { data } = await api.delete(`/pro/prescriptions/${prescriptionId}`);
  return data;
}

// ✅ API Réelles - Mettre à jour une prescription (médecin uniquement)
export async function updatePrescription(prescriptionId, payload) {
  // payload: { patient_id?, content? }
  const { data } = await api.put(
    `/pro/prescriptions/${prescriptionId}`,
    payload
  );
  return data;
}

// ✅ API Réelles - Obtenir une prescription spécifique (médecin uniquement)
export async function getPrescription(prescriptionId) {
  const { data } = await api.get(`/pro/prescriptions/${prescriptionId}`);
  return data.prescription;
}

// Fonctions de compatibilité pour les anciens appels
export async function listPrescriptionsByDoctor(doctor_id) {
  try {
    const result = await getDoctorPrescriptions();
    return result;
  } catch (error) {
    console.warn("Erreur getDoctorPrescriptions:", error.message);
    return { items: [] };
  }
}

export async function markDoseTaken(medication_id) {
  try {
    // TODO: Implémenter l'API backend pour marquer une dose comme prise
    // const { data } = await api.post(`/medications/${medication_id}/taken`);
    console.log("Dose marquée comme prise pour le médicament:", medication_id);
    return { ok: true };
  } catch (error) {
    console.warn("Erreur markDoseTaken:", error.message);
    throw error;
  }
}
