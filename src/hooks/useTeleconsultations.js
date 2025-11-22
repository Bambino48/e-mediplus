// src/hooks/useTeleconsultations.js
import { useQuery } from "@tanstack/react-query";
import {
  getActiveTeleconsultsByDoctor,
  getTeleconsultHistoryByDoctor,
} from "../api/teleconsultations.js";
import { useAuth } from "./useAuth.js";

export function useTeleconsultations() {
  const { user } = useAuth();
  const doctorId = user?.id;

  // Récupérer les téléconsultations actives
  const {
    data: activeTeleconsults,
    isLoading: isLoadingActive,
    error: errorActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ["teleconsultations", "active", { doctorId }],
    queryFn: () => getActiveTeleconsultsByDoctor(doctorId),
    enabled: !!doctorId,
  });

  // Récupérer l'historique des téléconsultations
  const {
    data: teleconsultHistory,
    isLoading: isLoadingHistory,
    error: errorHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["teleconsultations", "history", { doctorId }],
    queryFn: () => getTeleconsultHistoryByDoctor(doctorId),
    enabled: !!doctorId,
  });

  return {
    activeTeleconsults: activeTeleconsults || [],
    teleconsultHistory: teleconsultHistory || [],
    isLoading: isLoadingActive || isLoadingHistory,
    error: errorActive || errorHistory,
    refetch: () => {
      refetchActive();
      refetchHistory();
    },
  };
}
