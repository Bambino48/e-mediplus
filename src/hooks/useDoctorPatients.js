// src/hooks/useDoctorPatients.js
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance.js";

/**
 * Hook pour récupérer les patients d'un médecin avec leurs profils médicaux
 */
export function useDoctorPatients() {
  const query = useQuery({
    queryKey: ["doctor-patients"],
    queryFn: async () => {
      try {
        const response = await api.get("/doctor/patients");
        return response.data.patients || [];
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des patients:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    ...query,
    data: query.data || [],
  };
}
