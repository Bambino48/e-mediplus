// src/pages/pro/Calendar.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Phone, User, Video } from "lucide-react";
import {
  confirmAppointment,
  rejectAppointment,
} from "../../api/appointments.js";
import { useAppointments } from "../../hooks/useAppointments.js";
import { useAppToast } from "../../hooks/useAppToast";
import ProLayout from "../../layouts/ProLayout.jsx";

export default function Calendar() {
  const { data, isLoading, refetch } = useAppointments({ role: "doctor" });
  const queryClient = useQueryClient();
  const toast = useAppToast();

  // Mutation pour confirmer un rendez-vous
  const confirmMutation = useMutation({
    mutationFn: confirmAppointment,
    onSuccess: (data) => {
      toast.success(data.message || "Rendez-vous confirmé");
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["unreadNotifications"]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la confirmation");
    },
  });

  // Mutation pour refuser un rendez-vous
  const rejectMutation = useMutation({
    mutationFn: rejectAppointment,
    onSuccess: (data) => {
      toast.success(data.message || "Rendez-vous refusé");
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["unreadNotifications"]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du refus");
    },
  });

  // Fonction pour formater la date et l'heure
  const formatDateTime = (scheduledAt) => {
    const date = new Date(scheduledAt);
    return {
      date: date.toLocaleDateString("fr-FR"),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Fonction pour traduire le statut
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Terminé",
    };
    return statusMap[status] || status;
  };

  // Fonction pour traduire le mode de consultation
  const getModeLabel = (mode) => {
    const modeMap = {
      presentiel: "Présentiel",
      video: "Vidéo",
      telephone: "Téléphone",
    };
    return modeMap[mode] || mode || "Non spécifié";
  };

  // Fonction pour obtenir l'icône du mode de consultation
  const getModeIcon = (mode) => {
    switch (mode) {
      case "presentiel":
        return <User className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "telephone":
        return <Phone className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <ProLayout title="Calendrier des rendez-vous">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Rendez-vous mis à jour automatiquement toutes les 30 secondes
        </p>
        <button
          onClick={() => refetch()}
          className="btn-secondary text-xs"
          disabled={isLoading}
        >
          {isLoading ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      {isLoading ? (
        <div className="card grid place-items-center py-16">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <span>Chargement des rendez-vous...</span>
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          {data?.items?.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Heure</th>
                  <th className="px-4 py-2">Patient</th>
                  <th className="px-4 py-2">Motif</th>
                  <th className="px-4 py-2">Mode</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((appointment) => {
                  const { date, time } = formatDateTime(
                    appointment.scheduled_at
                  );
                  return (
                    <tr
                      key={appointment.id}
                      className="border-b last:border-none hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">{date}</td>
                      <td className="px-4 py-3">{time}</td>
                      <td className="px-4 py-3">
                        {appointment.patient?.name ||
                          `Patient #${appointment.patient_id}`}
                      </td>
                      <td className="px-4 py-3">
                        {appointment.reason || "Non spécifié"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center gap-1">
                          {getModeIcon(appointment.mode)}
                          {getModeLabel(appointment.mode)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {appointment.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  confirmMutation.mutate(appointment.id)
                                }
                                disabled={confirmMutation.isPending}
                                className="text-xs bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-2 py-1 rounded"
                              >
                                {confirmMutation.isPending
                                  ? "..."
                                  : "Confirmer"}
                              </button>
                              <button
                                onClick={() =>
                                  rejectMutation.mutate(appointment.id)
                                }
                                disabled={rejectMutation.isPending}
                                className="text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-2 py-1 rounded"
                              >
                                {rejectMutation.isPending ? "..." : "Refuser"}
                              </button>
                            </>
                          )}
                          <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <CalendarDays size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun rendez-vous trouvé</p>
              <p className="text-sm mt-2">
                Les rendez-vous apparaîtront ici automatiquement
              </p>
            </div>
          )}
        </div>
      )}
    </ProLayout>
  );
}


