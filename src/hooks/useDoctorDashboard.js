// src/hooks/useDoctorDashboard.js
import { useQuery } from "@tanstack/react-query";
import {
  getDoctorProfile,
  getDoctorStats,
  getUserProfile,
} from "../api/doctor";

// ✅ Vérifier si le médecin est authentifié
function isAuthenticated() {
  const token = localStorage.getItem("token");
  return token && token.length > 10;
}

// ✅ Hook pour les statistiques du médecin
export function useDoctorStats() {
  return useQuery({
    queryKey: ["doctorStats"],
    queryFn: getDoctorStats,
    enabled: isAuthenticated(),
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Rafraîchissement toutes les 5 minutes
  });
}

// ✅ Hook pour le profil complet du médecin (utilisateur + professionnel)
export function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctor-profile"],
    queryFn: async () => {
      console.log("🔄 Hook useDoctorProfile - Fetching combined profile data");

      // Récupérer les données utilisateur et professionnel en parallèle
      const [userData, profileResponse] = await Promise.all([
        getUserProfile(),
        getDoctorProfile(),
      ]);

      // Extraire les données du profil (API retourne {doctor_profile: {...}, has_profile: true})
      const profileData = profileResponse.doctor_profile || {};

      // Les données utilisateur peuvent venir soit de getUserProfile, soit de profileData.user
      const finalUserData = profileData.user || userData;

      // Si nous avons un name complet, le diviser en first_name et last_name
      if (finalUserData.name && !finalUserData.first_name) {
        const nameParts = finalUserData.name.split(" ");
        finalUserData.first_name = nameParts[0] || "";
        finalUserData.last_name = nameParts.slice(1).join(" ") || "";
      }

      // Enrichir les données du profil avec les noms des spécialités
      const enrichedProfileData = {
        ...profileData,
        primary_specialty_name: profileData.specialty || "Non défini",
        specialty: profileData.specialty || "Non défini",
      };

      // Combiner les données utilisateur et profil enrichi
      const combinedData = {
        ...finalUserData, // first_name, last_name, email, avatar
        ...enrichedProfileData, // city, address, phone, fees, primary_specialty_name, specialty, etc.
      };

      console.log("✅ Hook useDoctorProfile - Combined data:", combinedData);
      return combinedData;
    },
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 10 * 60 * 1000, // Considéré frais pendant 10 minutes
  });
}
