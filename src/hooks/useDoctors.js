// src/hooks/useDoctors.js
import { useQuery } from "@tanstack/react-query";
import {
  getDoctorAvailabilities,
  getDoctorDetails,
  getDoctorsList,
} from "../api/doctors.js";

/**
 * Hook pour récupérer la liste des docteurs avec pagination et filtres
 * @param {Object} params - Paramètres de filtrage et pagination
 * @returns {Object} Données, statut de chargement et erreurs
 */
export function useDoctors(params = {}) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      console.log("🔄 useDoctors - Fetching doctors with params:", params);
      const result = await getDoctorsList(params);
      console.log("✅ useDoctors - API response:", result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour récupérer les détails d'un docteur spécifique
 * @param {number} doctorId - ID du docteur
 * @returns {Object} Données, statut de chargement et erreurs
 */
export function useDoctor(doctorId) {
  return useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorDetails(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour récupérer les disponibilités d'un docteur
 * @param {number} doctorId - ID du docteur
 * @param {Object} params - Paramètres de filtrage des disponibilités
 * @returns {Object} Données, statut de chargement et erreurs
 */
export function useDoctorAvailabilities(doctorId, params = {}) {
  return useQuery({
    queryKey: ["doctor-availabilities", doctorId, params],
    queryFn: () => getDoctorAvailabilities(doctorId, params),
    enabled: !!doctorId,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus frais pour les disponibilités)
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}
