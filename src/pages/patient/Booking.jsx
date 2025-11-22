import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  bookAppointment,
  getDoctorAvailabilities,
} from "../../api/appointments.js";
import SchedulePicker from "../../components/SchedulePicker.jsx";
import { useAppToast } from "../../hooks/useAppToast";
import { useAppointmentStore } from "../../store/appointmentStore.js";

export default function Booking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const toast = useAppToast();
  const { doctor, setDoctor, selection, setSelection, mode, setMode, clear } =
    useAppointmentStore();

  const { data, isLoading } = useQuery({
    queryKey: ["availabilities", doctorId],
    queryFn: () => getDoctorAvailabilities(Number(doctorId)),
  });

  useEffect(() => {
    if (data?.doctor) setDoctor(data.doctor);
  }, [data, setDoctor]);

  const slots = useMemo(() => data?.slots || {}, [data?.slots]);

  const mutation = useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      toast.success("Rendez-vous réservé ✅");
      clear();
      navigate("/patient/dashboard");
    },
    onError: (e) => toast.error(e.message || "Échec de réservation"),
  });

  const canConfirm = useMemo(
    () => !!(doctor && selection && mode),
    [doctor, selection, mode]
  );

  const onConfirm = () => {
    if (!canConfirm) return;
    const { date, time } = selection;
    const scheduled_at = new Date(date);
    const [hh, mm] = time.split(":");
    scheduled_at.setHours(Number(hh), Number(mm), 0, 0);

    mutation.mutate({
      doctor_id: doctor.id,
      mode,
      reason: "Consultation générale",
      scheduled_at: scheduled_at.toISOString(),
    });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div className="card grid place-items-center py-24">
          Chargement des disponibilités…
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h1 className="text-xl font-semibold">Choisissez un créneau</h1>
              <div className="mt-4">
                <SchedulePicker
                  value={selection}
                  onChange={setSelection}
                  slots={slots}
                />
              </div>
            </div>
            <div className="card">
              <h2 className="text-sm text-slate-500">Mode de consultation</h2>
              <div className="mt-3 flex gap-2">
                <ModeButton
                  label="Présentiel"
                  active={mode === "presentiel"}
                  onClick={() => setMode("presentiel")}
                />
                <ModeButton
                  label="Téléconsultation"
                  active={mode === "teleconsult"}
                  onClick={() => setMode("teleconsult")}
                />
                <ModeButton
                  label="Professionnel"
                  active={mode === "professionnel"}
                  onClick={() => setMode("professionnel")}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card">
              <div className="text-sm text-slate-500">Professionnel</div>
              <div className="mt-1 font-medium">{doctor?.name}</div>
              <div className="text-sm text-slate-500">{doctor?.specialty}</div>
              <div className="mt-2 text-sm">
                Frais de consultation :{" "}
                <span className="font-medium">
                  {(doctor?.fees || 0).toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <button
              className="btn-primary w-full"
              disabled={!canConfirm || mutation.isPending}
              onClick={onConfirm}
            >
              {mutation.isPending ? "Réservation…" : "Confirmer le rendez-vous"}
            </button>
            <button className="btn-ghost w-full" onClick={() => navigate(-1)}>
              Annuler
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

function ModeButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm border ${active
          ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800"
          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
    >
      {label}
    </button>
  );
}

