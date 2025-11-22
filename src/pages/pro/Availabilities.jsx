// src/pages/pro/Availabilities.jsx
 
import { Calendar, Clock, Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useAppToast } from "../../hooks/useAppToast";
import {
  useCreateAvailability,
  useDeleteAvailability,
  useDoctorAvailabilities,
  useUpdateAvailability,
} from "../../hooks/useDoctorAvailabilities";
import ProLayout from "../../layouts/ProLayout";

const DAYS_OF_WEEK = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" },
];

export default function Availabilities() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    is_recurring: true,
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    date: "",
  });

  // Utilisation des hooks personnalisés avec gestion des succès/erreurs
  const { data: availabilities, isLoading, error } = useDoctorAvailabilities();
  const createMutation = useCreateAvailability();
  const toast = useAppToast();
  const updateMutation = useUpdateAvailability();
  const deleteMutation = useDeleteAvailability();

  // Gestionnaire de succès pour la création
  const handleCreateSuccess = () => {
    toast.success("Disponibilité ajoutée avec succès");
    setIsAdding(false);
    resetForm();
  };

  // Gestionnaire de succès pour la mise à jour
  const handleUpdateSuccess = () => {
    toast.success("Disponibilité mise à jour avec succès");
    setEditingId(null);
    resetForm();
  };

  // Gestionnaire de succès pour la suppression
  const handleDeleteSuccess = () => {
    toast.success("Disponibilité supprimée avec succès");
  };

  // Gestionnaire d'erreur
  const handleError = (error) => {
    toast.error("Une erreur est survenue");
    console.error("Erreur:", error);
  };

  const resetForm = () => {
    setFormData({
      is_recurring: true,
      day_of_week: 1,
      start_time: "09:00",
      end_time: "17:00",
      date: "", // Vide pour les récurrentes par défaut
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation frontend selon les règles backend
    if (formData.is_recurring) {
      // Pour récurrent : doit avoir day_of_week, pas de date
      if (!formData.day_of_week) {
        toast.error("Veuillez sélectionner un jour de la semaine");
        return;
      }
      if (formData.date) {
        toast.error(
          "Une disponibilité récurrente ne peut pas avoir de date spécifique"
        );
        return;
      }
    } else {
      // Pour ponctuel : doit avoir date, pas de day_of_week
      if (!formData.date) {
        toast.error("Veuillez sélectionner une date");
        return;
      }
      if (formData.day_of_week) {
        toast.error(
          "Une disponibilité ponctuelle ne peut pas avoir de jour de la semaine"
        );
        return;
      }
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: formData });
        handleUpdateSuccess();
      } else {
        await createMutation.mutateAsync(formData);
        handleCreateSuccess();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleEdit = (availability) => {
    setEditingId(availability.id);
    setFormData({
      is_recurring: availability.is_recurring,
      day_of_week: availability.day_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      date: availability.date || "",
    });
  };

  // ✅ Gestion du changement de type de disponibilité (récurrent/non-récurrent)
  const handleRecurringChange = (isRecurring) => {
    setFormData((prev) => ({
      ...prev,
      is_recurring: isRecurring,
      // Nettoyer les champs selon les règles de validation backend
      ...(isRecurring
        ? { date: "" } // Pour récurrent : vider la date
        : { day_of_week: null }), // Pour non-récurrent : vider le jour
    }));
  };

  const handleDelete = async (id) => {
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
      handleDeleteSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const formatDayOfWeek = (day) => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.value === day);
    return dayObj ? dayObj.label : "Inconnu";
  };

  if (isLoading) {
    return (
      <ProLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </ProLayout>
    );
  }

  if (error) {
    return (
      <ProLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Erreur de chargement
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Impossible de charger les disponibilités. Le serveur backend n'est
              peut-être pas disponible.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Endpoint requis: GET /api/doctor/availabilities
            </p>
          </div>
        </div>
      </ProLayout>
    );
  }

  return (
    <ProLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Mes Disponibilités
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gérez vos horaires de consultation
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus size={18} />
            Ajouter une disponibilité
          </button>
        </div>

        {/* Formulaire d'ajout/édition */}
        {(isAdding || editingId) && (
          <div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editingId
                ? "Modifier la disponibilité"
                : "Nouvelle disponibilité"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type de disponibilité */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type de disponibilité
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={() => handleRecurringChange(true)}
                      className="mr-2"
                    />
                    Récurrente (hebdomadaire)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_recurring"
                      checked={!formData.is_recurring}
                      onChange={() => handleRecurringChange(false)}
                      className="mr-2"
                    />
                    Ponctuelle (date spécifique)
                  </label>
                </div>
              </div>

              {/* Jour de la semaine ou date */}
              {formData.is_recurring ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jour de la semaine
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day_of_week: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    required
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              )}

              {/* Heures */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {createMutation.isPending || updateMutation.isPending
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    cancelEdit();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des disponibilités */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Disponibilités configurées
            </h3>
          </div>

          <div className="p-6">
            {availabilities && availabilities.length > 0 ? (
              <div className="space-y-4">
                {availabilities.map((availability) => (
                  <div
                    key={`availability-${availability.id}-${availability.day_of_week || availability.date
                      }`}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-cyan-500" />
                        {availability.is_recurring ? (
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {formatDayOfWeek(availability.day_of_week)}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {new Date(availability.date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {availability.start_time} - {availability.end_time}
                        </span>
                      </div>
                      {availability.is_recurring && (
                        <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-full">
                          Récurrent
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(availability)}
                        className="p-2 text-slate-500 hover:text-cyan-500 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(availability.id)}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Aucune disponibilité configurée
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Ajoutez vos premiers horaires de consultation pour permettre
                  aux patients de prendre rendez-vous.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Plus size={18} />
                  Ajouter une disponibilité
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProLayout>
  );
}


