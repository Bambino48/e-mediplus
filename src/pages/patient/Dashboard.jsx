/* eslint-disable no-unused-vars */
// src/pages/patient/Dashboard.jsx
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  Clock,
  Heart,
  Pill,
  Stethoscope,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorsList } from "../../api/doctors.js";
import DoctorCard from "../../components/DoctorCard.jsx";
import DoctorCarousel from "../../components/DoctorCarousel";
import InlineBooking from "../../components/InlineBooking.jsx";
import PatientMedicalProfile from "../../components/PatientMedicalProfile";
import { useAppToast } from "../../hooks/useAppToast";
import { useAuth } from "../../hooks/useAuth";
import {
  useNextAppointment,
  useRecentConsultations,
  useUnreadNotifications,
} from "../../hooks/useDashboard.js";
import { useGeo } from "../../hooks/useGeo";
import {
  usePatientActivePrescriptions,
  usePatientActiveTeleconsults,
  usePatientPendingPayments,
  usePatientStats,
  usePatientTodayMedications,
  usePatientUpcomingAppointments,
} from "../../hooks/usePatientDashboard.js";

export default function PatientDashboard() {
  // État local pour gérer les docteurs
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [errorDoctors, setErrorDoctors] = useState(null);

  // État pour le formulaire de réservation intégré
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] =
    useState(null);

  // États pour les vues intégrées dans le dashboard
  const [showPrescriptionsView, setShowPrescriptionsView] = useState(false);
  const [showAppointmentView, setShowAppointmentView] = useState(false);

  // Liste des docteurs pour le carrousel (top 12, triés par note)
  const navigate = useNavigate();
  const toast = useAppToast();

  // Fonction pour charger les docteurs
  const fetchDoctors = async () => {
    try {
      setIsLoadingDoctors(true);
      setErrorDoctors(null);

      console.log("🔄 Chargement des docteurs...");
      const response = await getDoctorsList({
        per_page: 12,
        has_profile: true,
        sort_by: "rating",
        sort_order: "desc",
      });

      // La structure est : response.data.doctors (et non response.data.data.doctors)
      const doctorsArray = response.data?.doctors || [];
      setDoctors(doctorsArray);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des docteurs:", err);
      console.error("� Détails de l'erreur:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setErrorDoctors(err);
      // Fallback vers une liste vide
      setDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  // Récupération des docteurs au chargement du composant
  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ Vérification de l'authentification
  const { user } = useAuth();
  const { userLocation } = useGeo();
  const isAuthenticated = !!user;

  // ✅ Récupération des données en temps réel (désactivées si non authentifié)
  const {
    data: nextAppointmentData,
    isLoading: loadingAppointment,
    error: appointmentError,
  } = useNextAppointment();
  const {
    data: todayMedications,
    isLoading: loadingTodayMedications,
    error: todayMedicationsError,
  } = usePatientTodayMedications();
  const {
    data: notificationsData,
    isLoading: loadingNotifications,
    error: notificationsError,
  } = useUnreadNotifications();
  const {
    data: consultationsData,
    isLoading: loadingConsultations,
    error: consultationsError,
  } = useRecentConsultations();

  // ✅ Nouveaux hooks pour les vraies données de la base
  const { data: patientStats, isLoading: loadingStats } = usePatientStats();

  const { data: upcomingAppointments, isLoading: loadingUpcoming } =
    usePatientUpcomingAppointments();

  const { data: activePrescriptions, isLoading: loadingActivePrescriptions } =
    usePatientActivePrescriptions();

  const { data: pendingPayments, isLoading: loadingPayments } =
    usePatientPendingPayments();

  const { data: activeTeleconsults, isLoading: loadingTeleconsults } =
    usePatientActiveTeleconsults();

  // ✅ Gestionnaires de clics intelligents
  const handleAppointmentsClick = (e) => {
    if (!nextAppointmentData?.appointment) {
      e.preventDefault();
      toast("Vous n'avez aucun rendez-vous prévu pour le moment", {
        icon: "📅",
        duration: 3000,
      });
    } else {
      setShowAppointmentView(true);
    }
  };

  const handlePrescriptionsClick = (e) => {
    if (!todayMedications?.items || todayMedications.items.length === 0) {
      e.preventDefault();
      toast("Vous n'avez aucun médicament à prendre aujourd'hui", {
        icon: "💊",
        duration: 3000,
      });
    } else {
      setShowPrescriptionsView(true);
    }
  };

  const handleNotificationsClick = (e) => {
    if (!notificationsData?.count || notificationsData.count === 0) {
      e.preventDefault();
      toast("Vous n'avez aucune nouvelle notification", {
        icon: "🔔",
        duration: 3000,
      });
    } else {
      navigate("/notifications");
    }
  };

  const shortcuts = [
    {
      title: "Téléconsultation",
      icon: <Video className="h-5 w-5 text-cyan-500" />,
      link: "/teleconsult",
      color: "from-blue-500 to-cyan-500",
      description: "Consultez un médecin en ligne en direct.",
    },
    {
      title: "Triage IA",
      icon: <Stethoscope className="h-5 w-5 text-teal-500" />,
      link: "/triage",
      color: "from-emerald-500 to-teal-500",
      description: "Analysez vos symptômes via notre assistant IA.",
    },
    {
      title: "Mes ordonnances",
      icon: <ClipboardList className="h-5 w-5 text-teal-500" />,
      link: "/patient/prescriptions",
      color: "from-indigo-500 to-cyan-500",
      description: "Accédez à vos prescriptions et traitements.",
    },
    {
      title: "Mes rendez-vous",
      icon: <CalendarDays className="h-5 w-5 text-cyan-500" />,
      link: "/booking",
      color: "from-cyan-500 to-blue-500",
      description: "Gérez vos rendez-vous médicaux.",
    },
    {
      title: "Mon profil médical",
      icon: <Heart className="h-5 w-5 text-red-500" />,
      link: "/patient/dashboard", // Reste sur le dashboard
      color: "from-red-500 to-pink-500",
      description:
        "Gérez vos informations médicales et votre dossier de santé.",
    },
  ];

  return (
    <>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue personnalisé */}
        <div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-linear-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-cyan-100 dark:border-slate-600"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Bonjour ! Prêt à prendre soin de votre santé ?
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Votre tableau de bord personnel pour gérer vos rendez-vous,
            médicaments et consultations médicales.
          </p>
        </div>

        {/* === Section Aujourd'hui - Priorité haute === */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Aujourd'hui
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Médicaments prioritaires */}
              <div className="bg-cyan-50 dark:bg-slate-800/50 rounded-xl p-4 border border-cyan-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                    Médicaments
                  </span>
                </div>
                {loadingTodayMedications ? (
                  <div className="flex items-center gap-2 text-cyan-600">
                    <Clock className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Chargement...</span>
                  </div>
                ) : todayMedicationsError ? (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Erreur de chargement
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400">
                    Connectez-vous pour voir vos médicaments
                  </div>
                ) : todayMedications?.items &&
                  todayMedications.items.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                      {todayMedications.items.length} médicament
                      {todayMedications.items.length > 1 ? "s" : ""} à prendre
                    </div>
                    <div className="text-xs text-cyan-600 dark:text-cyan-400">
                      Prochaine prise:{" "}
                      {todayMedications.items[0]?.times?.[0] || "À définir"}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400">
                    Aucun médicament prévu
                  </div>
                )}
              </div>

              {/* Rendez-vous du jour */}
              <div className="bg-emerald-50 dark:bg-slate-800/50 rounded-xl p-4 border border-emerald-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Rendez-vous
                  </span>
                </div>
                {loadingAppointment ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Clock className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Chargement...</span>
                  </div>
                ) : appointmentError ? (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Erreur de chargement
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    Connectez-vous pour voir vos rendez-vous
                  </div>
                ) : nextAppointmentData?.appointment ? (
                  <div className="space-y-1">
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      {nextAppointmentData.appointment.doctor_name ||
                        `Dr ${nextAppointmentData.appointment.doctor_id}`}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      {new Date(
                        nextAppointmentData.appointment.scheduled_at
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    Aucun rendez-vous aujourd'hui
                  </div>
                )}
              </div>

              {/* Notifications importantes */}
              <div className="bg-amber-50 dark:bg-slate-800/50 rounded-xl p-4 border border-amber-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Alertes
                  </span>
                </div>
                {loadingNotifications ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Chargement...</span>
                  </div>
                ) : notificationsError ? (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Erreur de chargement
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Connectez-vous pour voir vos alertes
                  </div>
                ) : notificationsData?.count > 0 ? (
                  <div className="space-y-1">
                    <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      {notificationsData.count} notification
                      {notificationsData.count > 1 ? "s" : ""} non lue
                      {notificationsData.count > 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      À consulter rapidement
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Aucune alerte active
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides du jour */}
            <div className="mt-4 flex flex-wrap gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setShowPrescriptionsView(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                >
                  <Pill className="h-3 w-3" />
                  Voir médicaments
                </button>
              )}

              {isAuthenticated && nextAppointmentData?.appointment && (
                <button
                  onClick={() => setShowAppointmentView(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <CalendarDays className="h-3 w-3" />
                  Mon RDV
                </button>
              )}

              {isAuthenticated && notificationsData?.count > 0 && (
                <button
                  onClick={() => navigate("/notifications")}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                >
                  <AlertCircle className="h-3 w-3" />
                  Notifications ({notificationsData.count})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === Vue intégrée - Prescriptions === */}
        {
          showPrescriptionsView && (
            <div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center">
                      <Pill className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Mes prescriptions
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Gérez vos médicaments et prescriptions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPrescriptionsView(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Contenu des prescriptions - à implémenter avec les vraies données */}
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Fonctionnalité de prescriptions à implémenter
                  </p>
                  <button
                    onClick={() => navigate("/patient/prescriptions")}
                    className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Voir la page complète
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* === Vue intégrée - Rendez-vous === */}
        {
          showAppointmentView && nextAppointmentData?.appointment && (
            <div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Mon rendez-vous
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Détails de votre prochain rendez-vous
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAppointmentView(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Détails du rendez-vous */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {nextAppointmentData.appointment.doctor_name ||
                          `Dr ${nextAppointmentData.appointment.doctor_id}`}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(
                          nextAppointmentData.appointment.scheduled_at
                        ).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(
                          nextAppointmentData.appointment.scheduled_at
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/booking/${nextAppointmentData.appointment.doctor_id}`
                        )
                      }
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Modifier le RDV
                    </button>
                    <button
                      onClick={() => setShowAppointmentView(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* === Statistiques principales === */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* 📅 Prochain rendez-vous */}
          <div className="card bg-white dark:bg-slate-900">
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Prochain rendez-vous
            </div>
            {loadingAppointment ? (
              <div className="mt-3 flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : appointmentError ? (
              <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                Erreur de chargement des rendez-vous
              </div>
            ) : !isAuthenticated ? (
              <div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center py-6"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Connectez-vous pour voir vos rendez-vous
                </p>
                <button
                  onClick={() => navigate("/auth/login")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                >
                  Se connecter
                </button>
              </div>
            ) : nextAppointmentData?.appointment ? (
              <>
                <div className="mt-1 font-medium">
                  {new Date(
                    nextAppointmentData.appointment.scheduled_at
                  ).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  •{" "}
                  {new Date(
                    nextAppointmentData.appointment.scheduled_at
                  ).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {nextAppointmentData.appointment.doctor_name ||
                    `Dr ${nextAppointmentData.appointment.doctor_id}`}
                </div>
              </>
            ) : (
              <div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center py-6"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Aucun rendez-vous prévu pour le moment
                </p>
                <button
                  onClick={() => navigate("/search")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                >
                  <Stethoscope className="h-4 w-4" />
                  Prendre RDV maintenant
                </button>
              </div>
            )
            }
            <button
              onClick={handleAppointmentsClick}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
            >
              <CalendarDays className="h-4 w-4" />
              Voir mes rendez-vous
            </button >
          </div>

          {/* 💊 Médicaments du jour */}
          < div className="card bg-white dark:bg-slate-900" >
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Médicaments du jour
            </div>
            {
              loadingTodayMedications ? (
                <div className="mt-3 flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              ) : todayMedicationsError ? (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                  Erreur de chargement des médicaments
                </div>
              ) : !isAuthenticated ? (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-center py-4"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Pill className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connectez-vous pour voir vos médicaments
                  </p>
                </div>
              ) : todayMedications?.items && todayMedications.items.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {todayMedications.items.slice(0, 3).map((med, idx) => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const nextDoseTime =
                      med.times?.find((time) => {
                        const [hours] = time.split(":").map(Number);
                        return hours > currentHour;
                      }) || med.times?.[0];

                    const isUrgent =
                      nextDoseTime &&
                      (() => {
                        const [hours] = nextDoseTime.split(":").map(Number);
                        const timeDiff = hours - currentHour;
                        return timeDiff >= 0 && timeDiff <= 2;
                      })();

                    return (
                      <div
                        key={med.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${isUrgent
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUrgent
                            ? "bg-red-500 text-white"
                            : "bg-cyan-500 text-white"
                            }`}
                        >
                          {isUrgent ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Pill className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                              {med.name}
                            </span>
                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                <Clock className="h-3 w-3" />
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {med.dosage} • {med.frequency} •{" "}
                            {med.times?.join(", ") || "Horaires non définis"}
                          </div>
                          {nextDoseTime && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              Prochaine prise: {nextDoseTime}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-center py-4"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Aucun médicament à prendre aujourd'hui
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Profitez de votre journée !
                  </p>
                </div>
              )
            }
            <button
              onClick={handlePrescriptionsClick}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
            >
              <Pill className="h-4 w-4" />
              Voir mes ordonnances
            </button >
          </div>

          {/* 🔔 Notifications */}
          < div className="card bg-white dark:bg-slate-900" >
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Notifications & Alertes
            </div>
            {
              loadingNotifications ? (
                <div className="mt-3 flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              ) : notificationsError ? (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                  Erreur de chargement des notifications
                </div>
              ) : !isAuthenticated ? (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-center py-6"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connectez-vous pour voir vos notifications
                  </p>
                </div>
              ) : notificationsData?.count > 0 ? (
                <div className="mt-3 space-y-3">
                  {/* Notification prioritaire - Résultats d'examens */}
                  <div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Résultats d'analyses disponibles
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                            <Clock className="h-3 w-3" />
                            Nouveau
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Vos résultats de prise de sang du 15 novembre sont
                          prêts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Autres notifications */}
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      {notificationsData.count} notification
                      {notificationsData.count > 1 ? "s" : ""} active
                      {notificationsData.count > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-center py-6"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="h-6 w-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Aucune alerte active
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Tout est à jour !
                  </p>
                </div>
              )
            }
            <button
              onClick={handleNotificationsClick}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm"
            >
              <AlertCircle className="h-4 w-4" />
              Voir toutes les notifications
            </button >
          </div>
        </div>

        {/* === Métriques avancées basées sur les vraies données === */}
        {
          isAuthenticated && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mon activité médicale
              </h2>

              {/* Grille des métriques principales */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* 📅 Rendez-vous à venir */}
                <div
                  className="card group bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {loadingUpcoming ? (
                          <div className="animate-pulse bg-blue-200 dark:bg-blue-700 h-6 w-8 rounded"></div>
                        ) : (
                          upcomingAppointments?.items?.length || 0
                        )}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Rendez-vous à venir
                      </div>
                    </div>
                  </div>
                </div>

                {/* 💊 Prescriptions actives */}
                <div className="card group bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                      <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {loadingActivePrescriptions ? (
                          <div className="animate-pulse bg-green-200 dark:bg-green-700 h-6 w-8 rounded"></div>
                        ) : (
                          activePrescriptions?.items?.length || 0
                        )}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Prescriptions actives
                      </div>
                    </div>
                  </div>
                </div>

                {/* 💰 Paiements en attente */}
                <div className="card group bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
    >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                      <Heart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {loadingPayments ? (
                          <div className="animate-pulse bg-amber-200 dark:bg-amber-700 h-6 w-8 rounded"></div>
                        ) : (
                          pendingPayments?.items?.length || 0
                        )}
                      </div>
                      <div className="text-sm text-amber-600 dark:text-amber-400">
                        Paiements en attente
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📹 Téléconsultations actives */}
                <div className="card group bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
  >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {loadingTeleconsults ? (
                          <div className="animate-pulse bg-purple-200 dark:bg-purple-700 h-6 w-8 rounded"></div>
                        ) : (
                          activeTeleconsults?.items?.length || 0
                        )}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Téléconsultations
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section détaillée des rendez-vous à venir */}
              {
                upcomingAppointments?.items &&
                upcomingAppointments.items.length > 0 && (
                  <div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card mb-6"
                  >
                    <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-500" />
                      Prochains rendez-vous
                    </h3>
                    <div className="space-y-3">
                      {upcomingAppointments.items
                        .slice(0, 3)
                        .map((appointment, idx) => (
                          <div
                            key={appointment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {new Date(
                                    appointment.scheduled_at
                                  ).toLocaleDateString("fr-FR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {new Date(
                                    appointment.scheduled_at
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  • {appointment.reason || "Consultation"}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === "confirmed"
                                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                            >
                              {appointment.status === "confirmed"
                                ? "Confirmé"
                                : appointment.status === "pending"
                                  ? "En attente"
                                  : appointment.status}
                            </div>
                          </div>
                        ))}
                    </div>
                    <button onClick={() => navigate("/patient/appointments")}
                      className="mt-4 w-full btn-secondary"
                    >
                      Voir tous mes rendez-vous
                    </button>
                  </div>
                )
              }

              {/* Section des prescriptions actives */}
              {
                activePrescriptions?.items &&
                activePrescriptions.items.length > 0 && (
                  <div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card mb-6"
                  >
                    <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                      <Pill className="h-5 w-5 text-green-500" />
                      Traitements en cours
                    </h3>
                    <div className="space-y-3">
                      {activePrescriptions.items
                        .slice(0, 3)
                        .map((prescription, idx) => (
                          <div
                            key={prescription.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                                <Pill className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  Prescription #{prescription.id}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {prescription.medications?.length || 0}{" "}
                                  médicament(s) • Dr. {prescription.doctor_id}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(
                                prescription.created_at
                              ).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        ))}
                    </div>
                    <button onClick={() => navigate("/patient/prescriptions")}
                      className="mt-4 w-full btn-secondary"
                    >
                      Voir toutes mes prescriptions
                    </button>
                  </div>
                )
              }

              {/* Section des paiements en attente */}
              {
                pendingPayments?.items && pendingPayments.items.length > 0 && (
                  <div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-amber-500" />
                      Paiements en attente
                    </h3>
                    <div className="space-y-3">
                      {pendingPayments.items.slice(0, 3).map((payment, idx) => (
                        <div
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                              <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {payment.amount?.toLocaleString()} FCFA
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Rendez-vous du{" "}
                                {new Date(
                                  payment.appointment?.scheduled_at
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                              : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                              }`}
                          >
                            {payment.status === "pending" ? "En attente" : "Échoué"}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate("/patient/payments")}
                      className="mt-4 w-full btn-primary"
                    >
                      Gérer mes paiements
                    </button>
                  </div>
                )
              }

              {/* Section des téléconsultations actives */}
              {
                activeTeleconsults?.items &&
                activeTeleconsults.items.length > 0 && (
                  <div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5 text-purple-500" />
                      Téléconsultations actives
                    </h3>
                    <div className="space-y-3">
                      {activeTeleconsults.items.map((teleconsult, idx) => (
                        <div
                          key={teleconsult.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                              <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                Salle #{teleconsult.room_id}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Dr.{" "}
                                {teleconsult.doctor_name || teleconsult.doctor_id}{" "}
                                • Démarrée{" "}
                                {teleconsult.started_at
                                  ? new Date(
                                    teleconsult.started_at
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : "Maintenant"}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${teleconsult.status === "active"
                              ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                              : teleconsult.status === "waiting"
                                ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                          >
                            {teleconsult.status === "active"
                              ? "En cours"
                              : teleconsult.status === "waiting"
                                ? "En attente"
                                : teleconsult.status}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate("/patient/teleconsult")}
                      className="mt-4 w-full btn-secondary"
                    >
                      Accéder aux téléconsultations
                    </button>
                  </div >
                )
              }
            </div >
          )
        }

        {/* === Carrousel des docteurs === */}
        <div className="mt-10">
          {isLoadingDoctors ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-slate-500">
                <Clock className="h-5 w-5 animate-spin" />
                <span>Chargement des médecins...</span>
              </div>
            </div>
          ) : errorDoctors ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                Erreur lors du chargement des médecins
              </p>
              <button
                onClick={fetchDoctors}
                className="btn-secondary"
                disabled={isLoadingDoctors}
              >
                {isLoadingDoctors ? "Chargement..." : "Réessayer"}
              </button>
            </div>
          ) : doctors && doctors.length > 0 ? (
            <DoctorCarousel
              doctors={doctors}
              title="Nos médecins recommandés"
              renderCard={(doctor) => (
                <DoctorCard
                  doctor={doctor}
                  user={user}
                  userLocation={userLocation}
                  onBooking={setSelectedDoctorForBooking}
                />
              )}
            />
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Aucun médecin disponible pour le moment</p>
                <p className="text-sm text-slate-400 mt-1">
                  Réessayez plus tard ou contactez le support
                </p>
              </div>
            </div>
          )}
        </div>

        {/* === Historique des consultations récentes === */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Consultations récentes
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Vos dernières visites médicales
                  </p>
                </div>
              </div>
              <button onClick={() => navigate("/patient/history")}
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Voir tout →
              </button>
            </div>

            {/* Liste des consultations récentes */}
            {loadingConsultations ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Chargement des consultations...
                  </span>
                </div>
              </div>
            ) : consultationsError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Erreur lors du chargement des consultations
                  </p>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Connectez-vous pour voir vos consultations
                  </p>
                </div>
              </div>
            ) : !consultationsData?.items ||
              consultationsData.items.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Aucune consultation récente trouvée
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Vos futures consultations apparaîtront ici
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {consultationsData.items
                  .slice(0, 3)
                  .map((consultation, index) => (
                    <div
                      key={consultation.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/patient/consultation/${consultation.id}`)
                      }
                    >
                      <div className="w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {consultation.doctor_name ||
                              `Dr. ${consultation.doctor?.first_name} ${consultation.doctor?.last_name}`}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {consultation.specialty ||
                              consultation.doctor?.specialization ||
                              "Médecine générale"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {consultation.reason || "Consultation"} •{" "}
                          {new Date(
                            consultation.scheduled_at || consultation.created_at
                          ).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {consultation.scheduled_at
                              ? new Date(
                                consultation.scheduled_at
                              ).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "À définir"}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {consultation.status === "completed"
                              ? "Terminée"
                              : "Planifiée"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <button onClick={() => navigate("/patient/history")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                Voir l'historique complet
              </button>
            </div>
          </div >
        </div >

        {/* === Profil Médical === */}
        <div className="mt-10">
          <PatientMedicalProfile />
        </div>        {/* === Raccourcis rapides intelligents === */}
        < div className="mt-10" >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Actions recommandées
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Personnalisé
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Téléconsultation - Priorité si médicaments actifs */}
            <div className={`card border-t-4 bg-white dark:bg-slate-900 cursor-pointer ${todayMedications?.items && todayMedications.items.length > 0
              ? "border-t-blue-500 shadow-blue-100 dark:shadow-blue-900/20"
              : "border-t-blue-400"
              }`}
              onClick={() => navigate("/teleconsult")}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl relative">
                  <Video className="h-5 w-5 text-blue-500" />
                  {todayMedications?.items &&
                    todayMedications.items.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      Téléconsultation
                    </h3>
                    {todayMedications?.items &&
                      todayMedications.items.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                          Recommandé
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {todayMedications?.items &&
                      todayMedications.items.length > 0
                      ? "Parfait pour suivre votre traitement"
                      : "Consultez un médecin en ligne en direct."}
                  </p>
                  <div className="text-cyan-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Commencer →
                  </div>
                </div>
              </div>
            </div>

            {/* Triage IA - Priorité si symptômes ou première visite */}
            <div className="card border-t-4 border-t-emerald-400 bg-white dark:bg-slate-900 cursor-pointer"
              onClick={() => navigate("/triage")}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-xl">
                  <Stethoscope className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Triage IA
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Analysez vos symptômes via notre assistant IA pour une
                    orientation rapide.
                  </p>
                  <div className="text-cyan-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Commencer →
                  </div>
                </div>
              </div>
            </div>

            {/* Mes ordonnances - Priorité si médicaments actifs */}
            <div className={`card border-t-4 bg-white dark:bg-slate-900 cursor-pointer ${todayMedications?.items && todayMedications.items.length > 0
              ? "border-t-cyan-500 shadow-cyan-100 dark:shadow-cyan-900/20"
              : "border-t-cyan-400"
              }`}
              onClick={() => navigate("/patient/prescriptions")}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-cyan-50 dark:bg-slate-800 rounded-xl relative">
                  <ClipboardList className="h-5 w-5 text-cyan-500" />
                  {todayMedications?.items &&
                    todayMedications.items.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      Mes ordonnances
                    </h3>
                    {todayMedications?.items &&
                      todayMedications.items.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded">
                          {todayMedications.items.length} actif
                          {todayMedications.items.length > 1 ? "s" : ""}
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {todayMedications?.items &&
                      todayMedications.items.length > 0
                      ? "Suivez vos traitements en cours"
                      : "Accédez à vos prescriptions et traitements."}
                  </p>
                  <div className="text-cyan-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Voir →
                  </div>
                </div>
              </div>
            </div>

            {/* Rendez-vous - Priorité si RDV proche */}
            <div className={`card border-t-4 bg-white dark:bg-slate-900 cursor-pointer ${nextAppointmentData?.appointment
              ? "border-t-green-500 shadow-green-100 dark:shadow-green-900/20"
              : "border-t-green-400"
              }`}
              onClick={() => navigate("/booking")}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-green-50 dark:bg-slate-800 rounded-xl relative">
                  <CalendarDays className="h-5 w-5 text-green-500" />
                  {nextAppointmentData?.appointment && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      Mes rendez-vous
                    </h3>
                    {nextAppointmentData?.appointment && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                        Prochain
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {nextAppointmentData?.appointment
                      ? `Prochain RDV: ${new Date(
                        nextAppointmentData.appointment.scheduled_at
                      ).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })}`
                      : "Gérez vos rendez-vous médicaux."}
                  </p>
                  <div className="text-cyan-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Gérer →
                  </div>
                </div>
              </div>
            </div>

            {/* Profil médical - Toujours disponible */}
            <div className="card border-t-4 border-t-purple-400 bg-white dark:bg-slate-900 cursor-pointer"
              onClick={() => navigate("/patient/dashboard")}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-xl">
                  <Heart className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Mon profil médical
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gérez vos informations médicales et votre dossier de santé.
                  </p>
                  <div className="text-cyan-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Consulter →
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats - Priorité si notifications de résultats */}
            <div className="card border-t-4 border-t-amber-400 bg-white dark:bg-slate-900 cursor-pointer"
              onClick={() => navigate("/patient/results")}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-xl">
                  <svg
                    className="h-5 w-5 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Mes résultats
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Consultez vos analyses et examens médicaux.
                  </p>
                  <div className="text-cyan-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Voir →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >
      </section >

      {/* Formulaire de réservation intégré */}
      {
        selectedDoctorForBooking && (
          <InlineBooking
            doctor={selectedDoctorForBooking}
            onClose={() => setSelectedDoctorForBooking(null)}
            onSuccess={() => {
              setSelectedDoctorForBooking(null);
              // Recharger les données si nécessaire
              fetchDoctors();
            }}
          />
        )
      }
    </>
  );
}


