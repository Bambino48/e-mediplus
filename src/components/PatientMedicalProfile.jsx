/* eslint-disable react-hooks/exhaustive-deps */
import {
  Activity,
  AlertTriangle,
  Calendar,
  Droplets,
  Edit,
  Heart,
  MapPin,
  Phone,
  Pill,
  Ruler,
  Save,
  Stethoscope,
  User,
  UserCircle,
  Weight,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAppToast } from "../hooks/useAppToast";
import { useAuth } from "../hooks/useAuth";

export default function PatientMedicalProfile() {
  const { token } = useAuth();
  const toast = useAppToast();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: "",
    gender: "",
    blood_group: "",
    height: "",
    weight: "",
    allergies: "",
    chronic_diseases: "",
    medications: "",
    emergency_contact: "",
    address: "",
    city: "",
    country: "",
  });

  // API Base URL - Utilise la même base URL que axiosInstance
  const API_BASE_URL = "https://lightsalmon-elk-292300.hostingersite.com/backend/public/api";

  const loadProfile = useCallback(async () => {
    try {
      console.log("🔄 PatientMedicalProfile: Démarrage du chargement du profil");
      setIsLoading(true);
      console.log("🔄 PatientMedicalProfile: API_BASE_URL:", API_BASE_URL);
      console.log("🔄 PatientMedicalProfile: Endpoint complet:", `${API_BASE_URL}/patient/profile`);

      const response = await fetch(`${API_BASE_URL}/patient/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("🔄 PatientMedicalProfile: Réponse reçue, status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ PatientMedicalProfile: Données brutes reçues:", JSON.stringify(data, null, 2));

        // La vraie structure: data.patient_profile contient les données
        const profileData = data.patient_profile || data.data || data;
        console.log("✅ PatientMedicalProfile: Données extraites:", JSON.stringify(profileData, null, 2));
        console.log("✅ PatientMedicalProfile: Type de profileData:", typeof profileData);
        console.log("✅ PatientMedicalProfile: Clés disponibles:", Object.keys(profileData || {}));
        console.log("✅ PatientMedicalProfile: profileData est vide?", !profileData || Object.keys(profileData).length === 0);

        // Vérifier si le profil a du contenu réel
        const hasProfileData = profileData && Object.keys(profileData).length > 0 && Object.values(profileData).some(value => value !== null && value !== undefined && value !== "");

        if (hasProfileData) {
          setProfile(profileData);
          setFormData({
            date_of_birth: profileData?.date_of_birth || "",
            gender: profileData?.gender || "",
            blood_group: profileData?.blood_group || "",
            height: profileData?.height || "",
            weight: profileData?.weight || "",
            allergies: profileData?.allergies || "",
            chronic_diseases: profileData?.chronic_diseases || "",
            medications: profileData?.medications || "",
            emergency_contact: profileData?.emergency_contact || "",
            address: profileData?.address || "",
            city: profileData?.city || "",
            country: profileData?.country || "",
          });
        } else {
          console.log("ℹ️ PatientMedicalProfile: Profil vide ou inexistant, affichage du message de création");
          setProfile(null);
        }
      } else if (response.status === 404) {
        // Cas normal : pas de profil existant, l'utilisateur peut en créer un
        console.log("ℹ️ PatientMedicalProfile: Aucun profil trouvé (404), c'est normal pour un nouveau patient");
        setProfile(null);
      } else {
        // Autres erreurs HTTP
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ PatientMedicalProfile: Erreur HTTP:", response.status, errorData);
        toast.error("Erreur lors du chargement du profil");
      }
    } catch (error) {
      console.error("❌ PatientMedicalProfile: Erreur réseau:", error);
      toast.error("Problème de connexion. Vérifiez votre réseau.");
    } finally {
      console.log("🔄 PatientMedicalProfile: Fin du chargement, isLoading = false");
      setIsLoading(false);
    }
  }, [token, API_BASE_URL, toast]);

  // Chargement du profil
  useEffect(() => {
    console.log("🔄 PatientMedicalProfile: useEffect déclenché, token disponible:", !!token);
    if (!token) {
      console.log("❌ PatientMedicalProfile: Aucun token, arrêt du chargement");
      setIsLoading(false);
      return;
    }

    loadProfile();
  }, [token]); // loadProfile omis pour éviter la boucle infinie car il change à chaque render

  const handleSave = async () => {
    if (!token) return;

    try {
      const method = profile ? "PUT" : "POST";
      const response = await fetch(`${API_BASE_URL}/patient/profile`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data || data);
        setIsEditing(false);
        toast.success(profile ? "Profil mis à jour !" : "Profil créé !");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        blood_group: profile.blood_group || "",
        height: profile.height || "",
        weight: profile.weight || "",
        allergies: profile.allergies || "",
        chronic_diseases: profile.chronic_diseases || "",
        medications: profile.medications || "",
        emergency_contact: profile.emergency_contact || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="card bg-white dark:bg-slate-900 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton Modifier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl shadow-sm">
            <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Profil Médical
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {profile
                ? "Vos informations médicales"
                : "Créer votre profil médical"}
            </p>
          </div>
        </div>

        {!isEditing && profile && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        )}

        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleCancel}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Contenu */}
      {!profile && !isEditing ? (
        <div className="text-center py-12 px-6 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <div className="p-5 bg-linear-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center shadow-lg">
            <Heart className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            Aucun profil médical
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Créez votre profil médical pour une meilleure prise en charge et un
            suivi personnalisé
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
          >
            <Heart className="h-5 w-5" />
            Créer mon profil médical
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informations personnelles */}
          <div className="p-5 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Informations personnelles
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Field
                icon={<Calendar className="h-4 w-4" />}
                label="Date de naissance"
                value={formData.date_of_birth}
                isEditing={isEditing}
                type="date"
                onChange={(value) =>
                  setFormData({ ...formData, date_of_birth: value })
                }
              />

              <Field
                icon={<User className="h-4 w-4" />}
                label="Sexe"
                value={formData.gender}
                isEditing={isEditing}
                type="select"
                options={["Masculin", "Féminin", "Autre"]}
                onChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              />

              <Field
                icon={<Droplets className="h-4 w-4" />}
                label="Groupe sanguin"
                value={formData.blood_group}
                isEditing={isEditing}
                type="select"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                onChange={(value) =>
                  setFormData({ ...formData, blood_group: value })
                }
              />

              <Field
                icon={<Ruler className="h-4 w-4" />}
                label="Taille (cm)"
                value={formData.height}
                isEditing={isEditing}
                type="number"
                onChange={(value) =>
                  setFormData({ ...formData, height: value })
                }
              />

              <Field
                icon={<Weight className="h-4 w-4" />}
                label="Poids (kg)"
                value={formData.weight}
                isEditing={isEditing}
                type="number"
                onChange={(value) =>
                  setFormData({ ...formData, weight: value })
                }
              />
            </div>
          </div>

          {/* Informations médicales */}
          <div className="p-5 bg-linear-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Informations médicales
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Field
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Allergies"
                value={formData.allergies}
                isEditing={isEditing}
                type="textarea"
                onChange={(value) =>
                  setFormData({ ...formData, allergies: value })
                }
              />

              <Field
                icon={<Pill className="h-4 w-4" />}
                label="Maladies chroniques"
                value={formData.chronic_diseases}
                isEditing={isEditing}
                type="textarea"
                onChange={(value) =>
                  setFormData({ ...formData, chronic_diseases: value })
                }
              />

              <Field
                icon={<Pill className="h-4 w-4" />}
                label="Médicaments actuels"
                value={formData.medications}
                isEditing={isEditing}
                type="textarea"
                onChange={(value) =>
                  setFormData({ ...formData, medications: value })
                }
              />

              <Field
                icon={<Phone className="h-4 w-4" />}
                label="Contact d'urgence"
                value={formData.emergency_contact}
                isEditing={isEditing}
                onChange={(value) =>
                  setFormData({ ...formData, emergency_contact: value })
                }
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="p-5 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Field
                icon={<MapPin className="h-4 w-4" />}
                label="Adresse"
                value={formData.address}
                isEditing={isEditing}
                onChange={(value) =>
                  setFormData({ ...formData, address: value })
                }
              />
              <Field
                icon={<MapPin className="h-4 w-4" />}
                label="Ville"
                value={formData.city}
                isEditing={isEditing}
                onChange={(value) => setFormData({ ...formData, city: value })}
              />
              <Field
                icon={<MapPin className="h-4 w-4" />}
                label="Pays"
                value={formData.country}
                isEditing={isEditing}
                onChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Field amélioré avec meilleure lisibilité
function Field({
  icon,
  label,
  value,
  isEditing,
  type = "text",
  options = [],
  onChange,
}) {
  if (!isEditing) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200">
        <div className="p-2 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {value || (
              <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                Non renseigné
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="p-2 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-800 rounded-lg shadow-sm mt-6">
        {icon}
      </div>
      <div className="flex-1">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
          {label}
        </label>
        {type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
          >
            <option value="">Sélectionner...</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none hover:border-slate-300 dark:hover:border-slate-600"
            placeholder={`Entrez ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
            placeholder={
              type === "number" ? "0" : `Entrez ${label.toLowerCase()}...`
            }
          />
        )}
      </div>
    </div>
  );
}

