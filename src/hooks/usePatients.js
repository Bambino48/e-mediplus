// src/hooks/usePatients.js
import { useMemo } from "react";
import { useAppointments } from "./useAppointments.js";
import { useAuth } from "./useAuth.js";

export function usePatients() {
  const { user } = useAuth();
  const doctorId = user?.id;

  const { data, isLoading, error, refetch } = useAppointments({
    role: "doctor",
    doctorId,
  });

  // Extraire les patients uniques depuis les rendez-vous
  // TODO: Remplacer par une vraie API /pro/patients quand disponible côté backend
  const patients = useMemo(() => {
    if (!data?.items) return [];

    // Grouper les rendez-vous par patient
    const patientsMap = new Map();

    data.items.forEach((appointment) => {
      const patientKey =
        appointment.patient_id ||
        appointment.patient?.id ||
        appointment.patient;

      if (!patientsMap.has(patientKey)) {
        patientsMap.set(patientKey, {
          id: patientKey,
          name:
            appointment.patient?.name ||
            appointment.patient ||
            `Patient #${appointment.patient_id}`,
          lastAppointment: appointment,
          totalAppointments: 1,
          upcomingAppointments: appointment.status === "confirmed" ? 1 : 0,
        });
      } else {
        const patient = patientsMap.get(patientKey);
        patient.totalAppointments += 1;
        if (appointment.status === "confirmed") {
          patient.upcomingAppointments += 1;
        }
        // Garder le rendez-vous le plus récent
        if (
          new Date(appointment.scheduled_at) >
          new Date(patient.lastAppointment.scheduled_at)
        ) {
          patient.lastAppointment = appointment;
        }
      }
    });

    return Array.from(patientsMap.values()).sort(
      (a, b) =>
        new Date(b.lastAppointment.scheduled_at) -
        new Date(a.lastAppointment.scheduled_at)
    );
  }, [data?.items]);

  return {
    data: patients,
    isLoading,
    error,
    refetch,
  };
}
