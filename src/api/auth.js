// src/api/auth.js
import api from "./axiosInstance";

// 🧩 Récupération du profil utilisateur connecté
export const getCurrentUser = async (token) => {
  const { data } = await api.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}; // 🧩 Connexion utilisateur
export const loginRequest = async (payload) => {
  const { data } = await api.post("/login", payload);
  return data;
};

// 🧩 Inscription utilisateur
export const registerRequest = async (payload) => {
  const { data } = await api.post("/register", payload);
  return data;
};

// 🧩 Déconnexion utilisateur
export const logoutRequest = async (token) => {
  const { data } = await api.post(
    "/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

// 🧩 Mise à jour du profil
export const updateProfileRequest = async (token, payload) => {
  const hasFile = payload?.photoFile instanceof File;
  const hasBase64Photo =
    typeof payload?.photo === "string" &&
    payload.photo.startsWith("data:image");

  if (hasFile || hasBase64Photo) {
    const formData = new FormData();

    // Filtrer pour n'inclure que les champs autorisés
    const allowedFields = ["name", "email", "phone", "latitude", "longitude"];

    // Ajouter les champs non fichier
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (key === "photo" || key === "photoFile") return;
      if (value === null || value === undefined || value === "") return;
      if (!allowedFields.includes(key)) return;
      formData.append(key, value);
    });

    if (hasFile) {
      formData.append("photo", payload.photoFile);
    } else if (hasBase64Photo) {
      const response = await fetch(payload.photo);
      const blob = await response.blob();
      const extension = blob.type?.split("/")[1] || "jpg";
      formData.append("photo", blob, `profile-photo.${extension}`);
    }

    formData.append("_method", "PUT");

    const { data } = await api.post("/profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }

  const jsonPayload = { ...payload };
  delete jsonPayload.photoFile;
  delete jsonPayload.photo;

  // Filtrer pour n'inclure que les champs autorisés
  const allowedFields = ["name", "email", "phone", "latitude", "longitude"];
  const filteredPayload = {};
  for (const field of allowedFields) {
    if (
      jsonPayload.hasOwnProperty(field) &&
      jsonPayload[field] !== "" &&
      jsonPayload[field] !== null &&
      jsonPayload[field] !== undefined
    ) {
      filteredPayload[field] = jsonPayload[field];
    }
  }

  const { data } = await api.put("/profile", filteredPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
