import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Eye,
  MapPin,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  cancelAppointment,
  getPatientAppointments,
} from "../../api/appointments.js";
import { useAppToast } from "../../hooks/useAppToast";
import PatientLayout from "../../layouts/PatientLayout";

/**
 * ✅ Carte de rendez-vous
 */
function AppointmentCard({ appointment, onView, onCancel }) {
  const isPast = new Date(appointment.scheduled_at) < new Date();
  const date = new Date(appointment.scheduled_at);

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status) => {
    const labels = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Terminé",
      no_show: "Absent",
    };
    return labels[status] || status;
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
      confirmed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      completed:
        "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
      no_show:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-4 ${isPast ? "opacity-75" : ""
        } ${appointment.status === "cancelled"
          ? "border-red-200 dark:border-red-800"
          : "border-slate-200 dark:border-slate-700"
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Médecin */}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {appointment.doctor?.name || "Dr. Inconnu"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {appointment.doctor?.specialization || "Spécialité non définie"}
          </p>

          {/* Date et heure */}
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-cyan-600" />
              <span>
                {date.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-cyan-600" />
              <span>
                {date.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {appointment.duration && (
                  <span className="text-slate-500 dark:text-slate-400 ml-1">
                    ({appointment.duration} min)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Mode et lieu */}
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
            {appointment.mode === "video" ? (
              <div className="flex items-center gap-1.5">
                <Video size={16} className="text-purple-600" />
                <span>Téléconsultation</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-blue-600" />
                <span>Cabinet médical</span>
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="mt-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                appointment.status
              )}`}
            >
              {getStatusLabel(appointment.status)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition"
            title="Voir les détails"
          >
            <Eye size={18} />
          </button>
          {!isPast && appointment.status !== "cancelled" && (
            <button
              onClick={onCancel}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              title="Annuler"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ✅ Modal de détails
 */
function AppointmentDetailsModal({ appointment, onClose, onCancel }) {
  const date = new Date(appointment.scheduled_at);
  const isPast = date < new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Détails du rendez-vous
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="space-y-4">
          {/* Médecin */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Médecin
            </label>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
              {appointment.doctor?.name || "Dr. Inconnu"}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {appointment.doctor?.specialization || "Spécialité non définie"}
            </p>
          </div>

          {/* Date et heure */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Date et heure
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar size={18} className="text-cyan-600" />
              <span className="text-slate-900 dark:text-white">
                {date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={18} className="text-cyan-600" />
              <span className="text-slate-900 dark:text-white">
                {date.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Type de consultation
            </label>
            <div className="flex items-center gap-2 mt-1">
              {appointment.mode === "video" ? (
                <>
                  <Video size={18} className="text-purple-600" />
                  <span className="text-slate-900 dark:text-white">
                    Téléconsultation
                  </span>
                </>
              ) : (
                <>
                  <MapPin size={18} className="text-blue-600" />
                  <span className="text-slate-900 dark:text-white">
                    Cabinet médical
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Motif */}
          {appointment.reason && (
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Motif
              </label>
              <p className="text-slate-900 dark:text-white mt-1">
                {appointment.reason}
              </p>
            </div>
          )}

          {/* Statut */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Statut
            </label>
            <p className="text-slate-900 dark:text-white mt-1">
              {appointment.status === "confirmed"
                ? "Confirmé"
                : appointment.status === "pending"
                  ? "En attente de confirmation"
                  : appointment.status === "cancelled"
                    ? "Annulé"
                    : "Terminé"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {!isPast && appointment.status !== "cancelled" && (
            <>
              {appointment.mode === "video" && (
                <button
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  onClick={() => (window.location.href = "/teleconsult")}
                >
                  <Video size={18} />
                  <span>Rejoindre</span>
                </button>
              )}
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                <span>Annuler</span>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Appointments({ useLayout = true }) {
  const [filter, setFilter] = useState("upcoming"); // "upcoming" | "past" | "all"
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const queryClient = useQueryClient();
  const toast = useAppToast();

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status) => {
    const labels = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Terminé",
      no_show: "Absent",
    };
    return labels[status] || status;
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
      confirmed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      completed:
        "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
      no_show:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-appointments"],
    queryFn: getPatientAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast.success("Rendez-vous annulé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'annulation du rendez-vous");
      console.error("Cancel appointment error:", error);
    },
  });

  const appointments = data?.items || [];
  const now = new Date();

  // Trouver le prochain rendez-vous
  const nextAppointment = appointments
    .filter((apt) => new Date(apt.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  const upcomingCount = appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= now
  ).length;
  const pastCount = appointments.filter(
    (apt) => new Date(apt.scheduled_at) < now
  ).length;

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduled_at);
    if (filter === "upcoming") {
      // Exclure le prochain rendez-vous de la liste si il est affiché en haut
      if (nextAppointment && apt.id === nextAppointment.id) return false;
      return aptDate >= now;
    }
    if (filter === "past") return aptDate < now;
    return true;
  });

  // Fonction pour calculer les jours restants de manière précise
  const getDaysRemaining = (scheduledDate) => {
    const now = new Date();
    const appointmentDate = new Date(scheduledDate);
    const diffTime = appointmentDate - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return 0; // Rendez-vous passé
    if (diffDays < 1) return 0; // Aujourd'hui
    return Math.floor(diffDays); // Nombre de jours complets restants
  };

  const handleCancel = (id) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?");
    if (confirmed) cancelMutation.mutate(id);
  };

  if (isLoading) {
    const loadingContent = (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
    return useLayout ? (
      <PatientLayout title="Mes rendez-vous">{loadingContent}</PatientLayout>
    ) : (
      loadingContent
    );
  }

  if (error) {
    const errorContent = (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200">
            Erreur lors du chargement des rendez-vous
          </p>
        </div>
      </div>
    );
    return useLayout ? (
      <PatientLayout title="Mes rendez-vous">{errorContent}</PatientLayout>
    ) : (
      errorContent
    );
  }

  const mainContent = (
    <div className="max-w-6xl mx-auto">
      {/* Bouton nouveau rendez-vous */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => (window.location.href = "/search")}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          <Plus size={18} />
          <span>Nouveau rendez-vous</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 rounded-lg transition ${filter === "upcoming"
            ? "bg-cyan-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
        >
          À venir ({upcomingCount})
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 rounded-lg transition ${filter === "past"
            ? "bg-cyan-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
        >
          Passés ({pastCount})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition ${filter === "all"
            ? "bg-cyan-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
        >
          Tous ({appointments.length})
        </button>
      </div>

      {/* ✅ Section Prochain Rendez-vous avec Statut */}
      {nextAppointment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-800/50 rounded-full">
                <Calendar className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Prochain rendez-vous
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(
                        nextAppointment.scheduled_at
                      ).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      à{" "}
                      {new Date(
                        nextAppointment.scheduled_at
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      avec
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {nextAppointment.doctor_name ||
                        nextAppointment.doctor?.name ||
                        `Dr ${nextAppointment.doctor_id}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  nextAppointment.status
                )}`}
              >
                {getStatusLabel(nextAppointment.status)}
              </span>
              {nextAppointment.status === "confirmed" && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Confirmé</span>
                </div>
              )}
            </div>
          </div>

          {/* Barre de progression temporelle */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Statut du rendez-vous</span>
              <span>
                {getDaysRemaining(nextAppointment.scheduled_at)} jours restants
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${nextAppointment.status === "confirmed"
                  ? "bg-green-500"
                  : nextAppointment.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                  }`}
                style={{
                  width:
                    nextAppointment.status === "confirmed"
                      ? "100%"
                      : nextAppointment.status === "pending"
                        ? "60%"
                        : "80%",
                }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Liste des rendez-vous */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-12 text-center mt-6">
          <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {filter === "upcoming"
              ? "Aucun rendez-vous à venir"
              : filter === "past"
                ? "Aucun rendez-vous passé"
                : "Aucun rendez-vous enregistré"}
          </p>
          <button
            onClick={() => (window.location.href = "/search")}
            className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Prendre un rendez-vous
          </button>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onView={() => setSelectedAppointment(apt)}
              onCancel={() => handleCancel(apt.id)}
            />
          ))}
        </div>
      )}

      {/* Modal détails */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCancel={() => handleCancel(selectedAppointment.id)}
        />
      )}
    </div>
  );

  return useLayout ? (
    <PatientLayout title="Mes rendez-vous">{mainContent}</PatientLayout>
  ) : (
    mainContent
  );
}

