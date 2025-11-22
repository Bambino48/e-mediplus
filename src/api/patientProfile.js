// src/api/patientProfile.js
import api from "./axiosInstance.js";

// 🏥 Récupération du profil médical du patient
export const getPatientProfile = async (token) => {
  const { data } = await api.get("/patient/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// 🏥 Création du profil médical du patient
export const createPatientProfile = async (token, payload) => {
  const { data } = await api.post("/patient/profile", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// 🏥 Mise à jour du profil médical du patient
export const updatePatientProfile = async (token, payload) => {
  const { data } = await api.put("/patient/profile", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// 🏥 Suppression du profil médical du patient (si nécessaire)
export const deletePatientProfile = async (token) => {
  const { data } = await api.delete("/patient/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
