// src/hooks/usePrescriptions.js
import { useQuery } from "@tanstack/react-query";
import { listPrescriptionsByDoctor } from "../api/prescriptions.js";
import { useAuth } from "./useAuth.js";

export function usePrescriptions() {
  const { user } = useAuth();
  const doctorId = user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["prescriptions", { doctorId }],
    queryFn: () => listPrescriptionsByDoctor(doctorId),
    enabled: !!doctorId, // Ne faire la requête que si doctorId existe
  });

  return {
    data: data?.items || [],
    isLoading,
    error,
    refetch,
  };
}
