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
    // Ne pas relancer agressivement en cas d'erreur serveur (backoff côté client)
    retry: 0,
    // Pas de rafraîchissement automatique par intervalle pour réduire la charge
    refetchInterval: false,
    // Considérer les stats fraîches pendant 15 minutes
    staleTime: 15 * 60 * 1000,
    // Eviter de refetch au focus de la fenêtre
    refetchOnWindowFocus: false,
  });
}

// ✅ Hook pour le profil complet du médecin (utilisateur + professionnel)
export function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctor-profile"],
    queryFn: async () => {
      // Debug logs removed in production build

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

      // Combined data ready (debug log removed)
      return combinedData;
    },
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 10 * 60 * 1000, // Considéré frais pendant 10 minutes
  });
}
