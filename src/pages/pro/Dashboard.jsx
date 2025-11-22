/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  Edit,
  FileText,
  MapPin,
  RefreshCw,
  Settings,
  Stethoscope,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppToast } from "../../hooks/useAppToast";
import {
  useCreateAvailability,
  useDeleteAvailability,
  useDoctorAvailabilities,
  useUpdateAvailability,
} from "../../hooks/useDoctorAvailabilities";
import {
  useDoctorProfile,
  useDoctorStats,
} from "../../hooks/useDoctorDashboard";
import ProLayout from "../../layouts/ProLayout.jsx";

// ✅ Constantes pour les jours de la semaine
const DAYS_OF_WEEK = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" },
];

// ✅ Fonction pour formater le jour de la semaine
const formatDayOfWeek = (dayOfWeek) => {
  const day = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek);
  return day ? day.label : "Jour inconnu";
};

export default function ProDashboard() {
  // ✅ Données dynamiques du médecin
  const { data: profile, isLoading: loadingProfile } = useDoctorProfile();
  const { data: stats, isLoading: loadingStats } = useDoctorStats();

  // ✅ Données des disponibilités
  const {
    data: availabilities,
    isLoading: loadingAvailabilities,
    refetch: refetchAvailabilities,
    isRefetching: isRefetchingAvailabilities,
  } = useDoctorAvailabilities();
  const createMutation = useCreateAvailability();
  const updateMutation = useUpdateAvailability();
  const deleteMutation = useDeleteAvailability();
  const toast = useAppToast();

  // ✅ État pour l'édition des disponibilités
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    is_recurring: true,
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    date: "",
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // === Liens rapides vers les fonctionnalités ===
  const shortcuts = [
    {
      title: "Calendrier",
      icon: <CalendarDays className="h-5 w-5 text-cyan-500" />,
      link: "/pro/calendar",
      color: "from-cyan-500 to-teal-500",
      description: "Gérez vos rendez-vous et vos disponibilités.",
      badge: stats?.appointments_today > 0 ? stats.appointments_today : null,
    },
    {
      title: "Patients",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      link: "/pro/patients",
      color: "from-blue-500 to-cyan-500",
      description: "Consultez les dossiers de vos patients.",
      badge: null, // TODO: Ajouter nombre de nouveaux patients
    },
    {
      title: "Ordonnances",
      icon: <FileText className="h-5 w-5 text-emerald-500" />,
      link: "/pro/prescriptions",
      color: "from-emerald-500 to-teal-500",
      description: "Accédez à vos prescriptions médicales.",
      badge: stats?.pending_tasks > 0 ? stats.pending_tasks : null,
    },
    {
      title: "Nouvelle prescription",
      icon: <ClipboardCheck className="h-5 w-5 text-cyan-500" />,
      link: "/pro/prescriptions/editor",
      color: "from-cyan-500 to-indigo-500",
      description: "Rédigez et signez une nouvelle ordonnance.",
    },
    {
      title: "Téléconsultation",
      icon: <Video className="h-5 w-5 text-blue-500" />,
      link: "/pro/teleconsult",
      color: "from-blue-500 to-cyan-500",
      description: "Lancez une téléconsultation sécurisée.",
    },
    {
      title: "Facturation",
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      link: "/pro/billing",
      color: "from-amber-500 to-orange-500",
      description: "Suivez vos paiements et revenus mensuels.",
    },
    {
      title: "Mon profil",
      icon: <UserCog className="h-5 w-5 text-slate-500" />,
      link: "/pro/profile",
      color: "from-slate-500 to-slate-700",
      description: "Mettez à jour vos informations professionnelles.",
    },
    {
      title: "Paramètres",
      icon: <Settings className="h-5 w-5 text-slate-500" />,
      link: "/pro/settings",
      color: "from-slate-600 to-slate-900",
      description: "Personnalisez votre compte et vos préférences.",
    },
  ];

  // === Gestion des disponibilités ===
  const DAYS_OF_WEEK = [
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
    { value: 7, label: "Dimanche" },
  ];

  const formatDayOfWeek = (day) => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.value === day);
    return dayObj ? dayObj.label : "Inconnu";
  };

  const handleEditAvailability = (availability) => {
    setEditingId(availability.id);
    setEditFormData({
      is_recurring: availability.is_recurring,
      day_of_week: availability.day_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      date: availability.date || "",
    });
  };

  // ✅ Gestion du changement de type de disponibilité (récurrent/non-récurrent)
  const handleRecurringChange = (isRecurring) => {
    setEditFormData((prev) => ({
      ...prev,
      is_recurring: isRecurring,
      // Nettoyer les champs selon les règles de validation backend
      ...(isRecurring
        ? { date: "" } // Pour récurrent : vider la date
        : { day_of_week: null }), // Pour non-récurrent : vider le jour
    }));
  };

  const handleUpdateAvailability = async () => {
    // ✅ Validation frontend selon les règles backend
    if (editFormData.is_recurring) {
      // Pour récurrent : doit avoir day_of_week, pas de date
      if (!editFormData.day_of_week) {
        toast.error("Veuillez sélectionner un jour de la semaine");
        return;
      }
      if (editFormData.date) {
        toast.error(
          "Une disponibilité récurrente ne peut pas avoir de date spécifique"
        );
        return;
      }
    } else {
      // Pour ponctuel : doit avoir date, pas de day_of_week
      if (!editFormData.date) {
        toast.error("Veuillez sélectionner une date");
        return;
      }
      if (editFormData.day_of_week) {
        toast.error(
          "Une disponibilité ponctuelle ne peut pas avoir de jour de la semaine"
        );
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({ id: editingId, data: editFormData });
      toast.success("Disponibilité mise à jour avec succès");
      setEditingId(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteAvailability = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            Êtes-vous sûr de vouloir supprimer cette disponibilité ?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performDelete(id);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  const performDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Disponibilité supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      is_recurring: true,
      day_of_week: 1,
      start_time: "09:00",
      end_time: "17:00",
      date: "",
    });
  };

  // ✅ Fonction de rafraîchissement manuel des disponibilités
  const handleRefreshAvailabilities = async () => {
    try {
      await refetchAvailabilities();
      setLastUpdated(new Date());
      toast.success("Disponibilités mises à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <ProLayout title="Tableau de bord professionnel 🩺">
      {/* === Salutation personnalisée === */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-linear-to-r from-cyan-500/10 to-teal-500/10 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {loadingProfile ? (
                "Chargement..."
              ) : (
                <>
                  Bonjour {profile?.first_name?.startsWith("Dr.") ? "" : "Dr. "}
                  {profile?.first_name} {profile?.last_name} 👋
                </>
              )}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {loadingStats ? (
                "Chargement des statistiques..."
              ) : (
                <>
                  Aujourd'hui : {stats?.appointments_today || 0} RDV
                  {stats?.pending_tasks > 0 &&
                    ` | ${stats.pending_tasks} tâche${stats.pending_tasks > 1 ? "s" : ""
                    } à faire`}
                  {stats?.revenue_month > 0 &&
                    ` | +${stats.revenue_month.toLocaleString()} FCFA ce mois`}
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>
      {/* === Statistiques principales === */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="card group">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-5 w-5 text-cyan-500" />
            <span className="text-sm text-slate-500">RDV du jour</span>
          </div>
          <div className="mt-1 font-medium text-lg text-cyan-600 dark:text-cyan-400">
            {loadingStats ? (
              <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-24 rounded"></div>
            ) : (
              <>{stats?.appointments_today || 0} rendez-vous</>
            )}
          </div>
          <Link
            to="/pro/calendar"
            className="btn-secondary mt-3 w-full group-hover:bg-cyan-600 group-hover:text-white transition-colors"
          >
            Voir le calendrier
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card group">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-slate-500">Revenus du mois</span>
          </div>
          <div className="mt-1 font-medium text-lg text-emerald-600 dark:text-emerald-400">
            {loadingStats ? (
              <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-32 rounded"></div>
            ) : (
              <>{(stats?.revenue_month || 0).toLocaleString()} FCFA</>
            )}
          </div>
          <Link
            to="/pro/billing"
            className="btn-secondary mt-3 w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors"
          >
            Voir la facturation
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card group">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-slate-500">Tâches à faire</span>
            {stats?.pending_tasks > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                <Bell className="h-3 w-3" />
                {stats.pending_tasks}
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {loadingStats ? (
              <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-4 w-40 rounded"></div>
            ) : stats?.pending_tasks > 0 ? (
              `${stats.pending_tasks} ordonnance${stats.pending_tasks > 1 ? "s" : ""
              } à signer`
            ) : (
              "Aucune tâche en attente"
            )}
          </div>
          <Link
            to="/pro/prescriptions"
            className="btn-secondary mt-3 w-full group-hover:bg-amber-600 group-hover:text-white transition-colors"
          >
            Voir les tâches
          </Link>
        </motion.div>
      </div>

      {/* === Mes Disponibilités === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-cyan-500" />
              Mes Disponibilités
              {isRefetchingAvailabilities && (
                <RefreshCw className="h-4 w-4 text-cyan-500 animate-spin" />
              )}
            </h2>
            {lastUpdated && (
              <p className="text-xs text-slate-500 mt-1">
                Dernière mise à jour: {lastUpdated.toLocaleTimeString("fr-FR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAvailabilities}
              disabled={isRefetchingAvailabilities}
              className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Actualiser les disponibilités"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetchingAvailabilities ? "animate-spin" : ""
                  }`}
              />
            </button>
            <Link
              to="/pro/availabilities"
              className="text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:underline inline-flex items-center gap-1"
            >
              Gérer toutes les disponibilités →
            </Link>
          </div>
        </div>

        {loadingAvailabilities ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : availabilities &&
          Array.isArray(availabilities) &&
          availabilities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilities.slice(0, 6).map((availability) => (
              <motion.div
                key={`availability-${availability.id}-${availability.day_of_week || availability.date
                  }`}
                whileHover={{ scale: 1.02 }}
                className="card group"
              >
                {editingId === availability.id ? (
                  // Mode édition
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Modifier la disponibilité
                      </span>
                    </div>

                    {editFormData.is_recurring ? (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Jour
                        </label>
                        <select
                          value={editFormData.day_of_week}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              day_of_week: parseInt(e.target.value),
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Début
                        </label>
                        <input
                          type="time"
                          value={editFormData.start_time}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              start_time: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Fin
                        </label>
                        <input
                          type="time"
                          value={editFormData.end_time}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              end_time: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleUpdateAvailability}
                        disabled={updateMutation.isPending}
                        className="flex-1 bg-cyan-500 text-white px-3 py-1 text-sm rounded hover:bg-cyan-600 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? "..." : "Sauvegarder"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Affichage normal
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {availability.is_recurring
                          ? formatDayOfWeek(availability.day_of_week)
                          : new Date(availability.date).toLocaleDateString(
                            "fr-FR"
                          )}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {availability.start_time} - {availability.end_time}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAvailability(availability)}
                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Modifier
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteAvailability(availability.id)
                        }
                        disabled={deleteMutation.isPending}
                        className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1 text-sm rounded hover:bg-red-200 dark:hover:bg-red-800/50 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <CalendarDays className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Aucune disponibilité définie
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Définissez vos horaires de consultation pour recevoir des
              rendez-vous.
            </p>
            <Link to="/pro/availabilities" className="btn-primary inline-block">
              Définir mes disponibilités
            </Link>
          </div>
        )}
      </motion.div>

      {/* === Profil professionnel === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserCog className="h-5 w-5 text-slate-500" />
            Profil professionnel
          </h2>
          <Link
            to="/pro/profilpro"
            className="text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:underline inline-flex items-center gap-1"
          >
            Modifier →
          </Link>
        </div>

        <div className="card">
          {loadingProfile ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          ) : profile ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Spécialité principale
                  </span>
                  <p className="text-slate-900 dark:text-slate-100">
                    {profile.primary_specialty || "Non défini"}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Ville
                  </span>
                  <p className="text-slate-900 dark:text-slate-100">
                    {profile.city || "Non défini"}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Téléphone
                  </span>
                  <p className="text-slate-900 dark:text-slate-100">
                    {profile.phone || "Non défini"}
                  </p>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Honoraires
                  </span>
                  <p className="text-slate-900 dark:text-slate-100">
                    {profile.fees
                      ? `${profile.fees.toLocaleString()} FCFA`
                      : "Non défini"}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Note moyenne
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="text-slate-900 dark:text-slate-100">
                      {profile.rating || "0.0"} / 5.0
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Statut
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                    Actif
                  </span>
                </div>
              </div>

              {/* Adresse */}
              {profile.address && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Adresse
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    {profile.address}
                  </p>
                </div>
              )}

              {/* Spécialité principale */}
              {profile.primary_specialty && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Spécialité
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {profile.primary_specialty}
                    </span>
                  </div>
                </div>
              )}

              {/* Biographie */}
              {profile.bio && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Biographie
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 text-sm mt-1 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCog className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Profil non configuré
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Complétez votre profil professionnel pour apparaître dans les
                recherches des patients.
              </p>
              <Link
                to="/pro/profilpro"
                className="btn-primary inline-flex items-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                Configurer mon profil
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* === Raccourcis rapides === */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-slate-500" />
          Actions rapides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortcuts.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`card border-t-4 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-200 border-gradient-to-r ${item.color}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-white/50 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.badge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium rounded-full animate-pulse">
                        <Bell className="h-3 w-3" />
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {item.description}
                  </p>
                  <Link
                    to={item.link}
                    className="text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:underline inline-flex items-center gap-1 group/link"
                  >
                    Ouvrir →
                    <motion.span
                      className="inline-block"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ProLayout>
  );
}
