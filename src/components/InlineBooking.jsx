/* eslint-disable no-unused-vars */
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppToast } from "../hooks/useAppToast";
import appointmentsApi from "/src/api/appointments";
import SchedulePicker from "/src/components/SchedulePicker";
import { useAppointmentStore } from "/src/store/appointmentStore";

const InlineBooking = ({ doctor, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const toast = useAppToast();
  const { setDoctor, selection, setSelection, mode, setMode, clear } =
    useAppointmentStore();

  const [isVisible, setIsVisible] = useState(false);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["availabilities", doctor.id],
    queryFn: () => appointmentsApi.getDoctorAvailabilities(Number(doctor.id)),
    enabled: !!doctor?.id,
  });

  useEffect(() => {
    if (data?.doctor) {
      setDoctor(data.doctor);
      setIsVisible(true);
    }
  }, [data, setDoctor]);

  const slots = useMemo(() => data?.slots || {}, [data?.slots]);

  const mutation = useMutation({
    mutationFn: appointmentsApi.bookAppointment,
    onSuccess: () => {
      toast.success("Rendez-vous réservé ✅");
      clear();
      setReason(""); // Réinitialiser le motif
      setIsVisible(false);
      if (onSuccess) {
        onSuccess();
      } else {
        // Recharger la page ou mettre à jour l'état
        window.location.reload();
      }
    },
    onError: (e) => toast.error(e.message || "Échec de réservation"),
  });

  const canConfirm = useMemo(
    () => !!(doctor && selection && mode && reason.trim()),
    [doctor, selection, mode, reason]
  );

  const onConfirm = () => {
    if (!canConfirm) return;
    const { date, time } = selection;
    const scheduled_at = new Date(date);
    const [hh, mm] = time.split(":");
    scheduled_at.setHours(Number(hh), Number(mm), 0, 0);

    mutation.mutate({
      doctor_id: doctor.id,
      scheduled_at: scheduled_at.toISOString(),
      mode,
      reason: reason.trim(),
      notes: "",
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    clear();
    setReason(""); // Réinitialiser le motif
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Réserver un rendez-vous
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              avec {doctor?.name || "le médecin"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <span className="ml-3 text-slate-600 dark:text-slate-400">
                Chargement des disponibilités...
              </span>
            </div>
          ) : (
            <SchedulePicker
              slots={slots}
              selection={selection}
              onSelect={setSelection}
              mode={mode}
              onModeChange={setMode}
            />
          )}

          {/* Motif de consultation */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Motif de consultation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez brièvement le motif de votre consultation..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white resize-none"
              rows={3}
              maxLength={500}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {reason.length}/500 caractères
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || mutation.isPending}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Réservation...
              </>
            ) : (
              "Confirmer la réservation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineBooking;


