/* eslint-disable no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { getDoctorProfile, updateDoctorProfile } from "../../api/doctors.js";
import { useAppToast } from "../../hooks/useAppToast";
import ProLayout from "../../layouts/ProLayout.jsx";

// Hook pour récupérer le profil médecin
const useDoctorProfile = () => {
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getDoctorProfile,
  });

  return { profile, isLoading, error };
};

// Hook pour récupérer les spécialités disponibles
// NOTE: Supprimé car nous utilisons seulement primary_specialty maintenant

export default function Profilpro() {
  const queryClient = useQueryClient();
  const { profile, isLoading: profileLoading } = useDoctorProfile();
  const toast = useAppToast();

  // Liste statique des spécialités pour le select
  const specialties = [
    { id: 1, name: "Médecine générale" },
    { id: 2, name: "Cardiologie" },
    { id: 3, name: "Dermatologie" },
    { id: 4, name: "Gynécologie" },
    { id: 5, name: "Ophtalmologie" },
    { id: 6, name: "Pédiatrie" },
    { id: 7, name: "Psychiatrie" },
    { id: 8, name: "Radiologie" },
    { id: 9, name: "Urologie" },
    { id: 10, name: "Orthopédie" },
  ];

  const [form, setForm] = useState({
    // Champs de doctor_profiles selon le schéma exact
    city: "",
    address: "",
    phone: "",
    fees: "",
    bio: "",
    primary_specialty: "",
    professional_document: null,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Mettre à jour le formulaire quand les données arrivent
  useEffect(() => {
    if (profile && profile.doctor_profile) {
      const doctorProfile = profile.doctor_profile;
      setForm({
        city: doctorProfile.city || "",
        address: doctorProfile.address || "",
        phone: doctorProfile.fees || "",
        fees: doctorProfile.fees || "",
        bio: doctorProfile.bio || "",
        primary_specialty: doctorProfile.primary_specialty || "",
        professional_document: doctorProfile.professional_document || null,
      });

      // Charger les spécialités du médecin
      // Note: Les spécialités multiples ont été supprimées, seul primary_specialty est utilisé
    }
  }, [profile]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: updateDoctorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      toast.success("Profil mis à jour avec succès !");
    },
    onError: (error) => {
      // Affiche les détails envoyés par le backend si disponibles (422 -> validation errors)
      console.error("Erreur updateProfileMutation:", error);
      const validation = error?.response?.data || error?.data || null;

      if (validation && typeof validation === "object") {
        // Si c'est une erreur de validation Laravel, afficher toutes les erreurs
        if (validation.errors && typeof validation.errors === "object") {
          const errorMessages = [];
          Object.entries(validation.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((message) => {
                errorMessages.push(`${field}: ${message}`);
              });
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          });

          // Afficher la première erreur dans le toast
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
          }

          // Afficher toutes les erreurs dans la console
          console.error("Erreurs de validation détaillées:", errorMessages);
        } else if (validation.message) {
          toast.error(validation.message);
        } else {
          toast.error("Erreur lors de la mise à jour (voir console)");
        }
      } else {
        toast.error(
          error?.message || "Erreur lors de la mise à jour du profil"
        );
      }
    },
  });

  // Note: La gestion des spécialités multiples a été supprimée

  //     if (!response.ok)
  //       throw new Error("Erreur lors de la mise à jour des spécialités");
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
  //     toast.success("Spécialités mises à jour avec succès !");
  //   },
  //   onError: (error) => {
  //     toast.error("Erreur lors de la mise à jour des spécialités");
  //   },
  // });

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // Validation basique
      if (!form.city.trim()) {
        toast.error("La ville est obligatoire");
        return;
      }
      if (!form.address.trim()) {
        toast.error("L'adresse est obligatoire");
        return;
      }

      // Construire un payload propre selon le schéma exact de doctor_profiles
      const payload = {
        city: (form.city || "").trim(),
        address: (form.address || "").trim(),
        phone: (form.phone || "").trim(),
        fees: form.fees === "" || form.fees == null ? null : Number(form.fees),
        bio: (form.bio || "").trim(),
        primary_specialty:
          form.primary_specialty === "" || form.primary_specialty == null
            ? null
            : String(form.primary_specialty),
        professional_document: form.professional_document,
        // Note: Les spécialités multiples ont été supprimées
      }; // Mettre à jour le profil
      await updateProfileMutation.mutateAsync(payload);

      // Mettre à jour les spécialités (désactivé pour l'instant)
      // await updateSpecialtiesMutation.mutateAsync(selectedSpecialties);
    } catch (error) {
      // Les erreurs sont gérées dans les mutations
    } finally {
      setIsUpdating(false);
    }
  };

  if (profileLoading) {
    return (
      <ProLayout title="Profil professionnel">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Chargement de votre profil professionnel...
            </p>
          </div>
        </div>
      </ProLayout>
    );
  }

  return (
    <ProLayout title="Profil professionnel">
      <div className="space-y-6">
        {/* En-tête avec bouton sauvegarder */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Save className="w-4 h-4 animate-spin" />
                Sauvegarde...
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {/* Section Informations générales */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ville *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="input-field"
                placeholder="Ville de pratique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input-field"
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Adresse *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="input-field pl-10"
                  placeholder="Adresse complète de votre cabinet"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Honoraires (FCFA)
              </label>
              <input
                type="number"
                value={form.fees}
                onChange={(e) => update("fees", e.target.value)}
                className="input-field"
                placeholder="25000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Spécialité principale
              </label>
              <select
                value={form.primary_specialty}
                onChange={(e) => update("primary_specialty", e.target.value)}
                className="input-field"
              >
                <option value="">Sélectionner une spécialité</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.name}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Biographie
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                className="input-field"
                rows="4"
                placeholder="Présentez-vous et votre parcours professionnel..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Document professionnel
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) =>
                  update("professional_document", e.target.files[0])
                }
                className="input-field"
              />
              {form.professional_document && (
                <p className="text-sm text-gray-600 mt-1">
                  Fichier sélectionné: {form.professional_document.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section Statistiques (si disponible) */}
        {profile && (
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.rating || "0.0"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Note moyenne
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.total_consultations || "0"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Consultations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {profile.years_experience || "0"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Années d'expérience
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProLayout>
  );
}

