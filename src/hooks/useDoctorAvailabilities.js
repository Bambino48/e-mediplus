// src/hooks/useDoctorAvailabilities.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDoctorAvailability,
  deleteDoctorAvailability,
  getDoctorAvailabilities as getDoctorAvailabilitiesFromDoctor,
  updateDoctorAvailability,
} from "../api/doctor";
import { getDoctorAvailabilities as getDoctorAvailabilitiesById } from "../api/doctors";

// ✅ Hook pour récupérer les disponibilités du médecin
export function useDoctorAvailabilities() {
  return useQuery({
    queryKey: ["doctor-availabilities"],
    queryFn: getDoctorAvailabilitiesFromDoctor,
    staleTime: 30 * 1000, // Considéré frais pendant 30 secondes
    refetchInterval: 60 * 1000, // Rafraîchissement automatique toutes les 60 secondes
    refetchOnWindowFocus: true, // Rafraîchissement quand l'utilisateur revient sur l'onglet
    refetchOnReconnect: true, // Rafraîchissement en cas de reconnexion réseau
    refetchIntervalInBackground: false, // Pas de refetch en arrière-plan pour économiser la batterie
  });
}

// ✅ Hook pour créer une disponibilité
export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctorAvailability,
    onSuccess: (newAvailability) => {
      // Ne pas appliquer d'update optimiste ici : s'appuyer sur la source
      // de vérité (backend). On invalide la query pour forcer un refetch
      // et éviter d'afficher des disponibilités locales qui n'auraient
      // pas été réellement persistées en base.
      queryClient.invalidateQueries(["doctor-availabilities"]);
    },
  });
}

// ✅ Hook pour mettre à jour une disponibilité
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateDoctorAvailability(id, data),
    onSuccess: (updatedAvailability) => {
      // Ne pas faire d'update optimiste ici : invalider les queries pour
      // récupérer l'état réel depuis le backend (évite les fantômes).
      queryClient.invalidateQueries(["doctor-availabilities"]);
      queryClient.invalidateQueries(["availabilities"]);
    },
  });
}

// ✅ Hook pour supprimer une disponibilité
export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctorAvailability,
    onSuccess: (_, deletedId) => {
      // Ne pas modifier le cache local directement : invalider pour forcer
      // le refetch et afficher uniquement ce qui est réellement en base.
      queryClient.invalidateQueries(["doctor-availabilities"]);
      queryClient.invalidateQueries(["availabilities"]);
    },
  });
}

// ✅ Hook pour récupérer les disponibilités d'un médecin spécifique (pour les cartes de docteur)
export function useDoctorAvailabilitiesById(doctorId) {
  return useQuery({
    queryKey: ["doctor-availabilities", doctorId],
    queryFn: () => getDoctorAvailabilitiesById(doctorId),
    enabled: !!doctorId, // Ne pas exécuter si doctorId est null/undefined
    staleTime: 5 * 60 * 1000, // Considéré frais pendant 5 minutes
    refetchOnWindowFocus: false, // Pas de refetch automatique au focus
    refetchOnReconnect: false, // Pas de refetch à la reconnexion
  });
}
