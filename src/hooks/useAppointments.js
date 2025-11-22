// src/hooks/useAppointments.js
// Hook pour récupérer les rendez-vous depuis l'API
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance.js";

// Fonction pour récupérer les rendez-vous depuis l'API
async function fetchAppointments({ role, status, doctorId }) {
  try {
    let endpoint = "";
    let params = {};

    if (role === "doctor" || role === "pro") {
      // Pour les professionnels : récupérer tous leurs rendez-vous
      endpoint = "/pro/appointments";
      if (doctorId) {
        params.doctor_id = doctorId;
      }
    } else {
      // Pour les patients : récupérer leurs rendez-vous
      endpoint = "/patient/appointments";
    }

    if (status) {
      params.status = status;
    }

    const response = await api.get(endpoint, { params });

    // Normaliser la réponse pour avoir toujours data.items
    if (response.data.appointments) {
      return { items: response.data.appointments };
    } else if (response.data.items) {
      return response.data;
    } else {
      return { items: [] };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    // Retourner des données vides en cas d'erreur
    return { items: [] };
  }
}
export function useAppointments({ role = "patient", status } = {}) {
  return useQuery({
    queryKey: ["appointments", { role, status }],
    queryFn: () => fetchAppointments({ role, status }),
    // Rafraîchissement automatique toutes les 30 secondes pour le temps réel
    refetchInterval: 30000,
    // Rafraîchir quand la fenêtre retrouve le focus
    refetchOnWindowFocus: true,
    // Garder les données en cache pendant 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
