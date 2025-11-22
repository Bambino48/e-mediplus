// src/hooks/usePatientDashboard.js
import { useQuery } from "@tanstack/react-query";
import {
  getPatientActivePrescriptions,
  getPatientActiveTeleconsults,
  getPatientPendingPayments,
  getPatientStats,
  getPatientTodayMedications,
  getPatientUpcomingAppointments,
} from "../api/patient.js";
import { useAuth } from "./useAuth.js";

// ✅ Vérifier si le patient est authentifié et est bien un patient
function isAuthenticatedPatient() {
  const token = localStorage.getItem("token");
  if (!token || token.length <= 10) return false;

  // Pour les hooks patient, on doit vérifier que l'utilisateur est connecté
  // et que c'est un patient. On ne peut pas accéder au user ici directement,
  // donc on laisse la vérification côté API.
  return true;
}

// ✅ Hook pour les statistiques du patient
export function usePatientStats() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  return useQuery({
    queryKey: ["patientStats"],
    queryFn: getPatientStats,
    enabled: isAuthenticatedPatient() && isPatient,
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Rafraîchissement toutes les 5 minutes
  });
}

// ✅ Hook pour les rendez-vous à venir
export function usePatientUpcomingAppointments() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  return useQuery({
    queryKey: ["patientUpcomingAppointments"],
    queryFn: getPatientUpcomingAppointments,
    enabled: isAuthenticatedPatient() && isPatient,
    retry: 1,
    refetchInterval: 10 * 60 * 1000, // Rafraîchissement toutes les 10 minutes
  });
}

// ✅ Hook pour les prescriptions actives
export function usePatientActivePrescriptions() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  return useQuery({
    queryKey: ["patientActivePrescriptions"],
    queryFn: getPatientActivePrescriptions,
    enabled: isAuthenticatedPatient() && isPatient,
    retry: 1,
    refetchInterval: 15 * 60 * 1000, // Rafraîchissement toutes les 15 minutes
  });
}

// ✅ Hook pour les paiements en attente
export function usePatientPendingPayments() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  return useQuery({
    queryKey: ["patientPendingPayments"],
    queryFn: getPatientPendingPayments,
    enabled: isAuthenticatedPatient() && isPatient,
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Rafraîchissement toutes les 5 minutes
  });
}

// ✅ Hook pour les téléconsultations actives
export function usePatientActiveTeleconsults() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  return useQuery({
    queryKey: ["patientActiveTeleconsults"],
    queryFn: getPatientActiveTeleconsults,
    enabled: isAuthenticatedPatient() && isPatient,
    retry: 1,
    refetchInterval: 2 * 60 * 1000, // Rafraîchissement toutes les 2 minutes
  });
}

// ✅ Hook pour les médicaments du jour
export function usePatientTodayMedications() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  return useQuery({
    queryKey: ["patientTodayMedications"],
    queryFn: getPatientTodayMedications,
    enabled: isAuthenticatedPatient() && isPatient,
    retry: 1,
    refetchInterval: 10 * 60 * 1000, // Rafraîchissement toutes les 10 minutes
  });
}
