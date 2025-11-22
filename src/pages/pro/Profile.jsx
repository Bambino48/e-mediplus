/* eslint-disable no-unused-vars */
import { useQueryClient } from "@tanstack/react-query";
import { Camera, MapPin, RefreshCw, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppToast } from "../../hooks/useAppToast";
import { useProfile } from "../../hooks/useProfile";
import ProLayout from "../../layouts/ProLayout.jsx";

export default function Profile() {
  const queryClient = useQueryClient();
  const {
    profile,
    isLoading: profileLoading,
    updateProfile,
    isUpdating,
  } = useProfile();
  const toast = useAppToast();

  const [form, setForm] = useState({
    // Champs de base (table users)
    name: "",
    phone: "",
    email: "",
    photo: "",
    latitude: "",
    longitude: "",
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef(null);

  // Mettre à jour le formulaire quand les données arrivent
  useEffect(() => {
    if (profile && profile.user) {
      setForm({
        name: profile.user.name || "",
        phone: profile.user.phone || "",
        email: profile.user.email || "",
        photo: profile.user.photo_url || profile.user.photo || "",
        latitude: profile.user.latitude || "",
        longitude: profile.user.longitude || "",
      });
    }
  }, [profile]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Fonction pour récupérer la position actuelle
  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par ce navigateur");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        update("latitude", latitude.toFixed(6));
        update("longitude", longitude.toFixed(6));
        toast.success("Position récupérée avec succès !");
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        let errorMessage = "Erreur lors de la récupération de la position";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position indisponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Timeout de géolocalisation";
            break;
        }
        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Fonction pour gérer la sélection d'image
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide");
      return;
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2MB");
      return;
    }

    // Convertir en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      update("photo", e.target.result);
      toast.success("Image sélectionnée avec succès !");
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier");
    };
    reader.readAsDataURL(file);
  };

  // Fonction pour déclencher la sélection d'image
  const triggerImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      // Validation basique
      if (!form.name.trim()) {
        toast.error("Le nom est obligatoire");
        return;
      }
      if (!form.email.trim()) {
        toast.error("L'email est obligatoire");
        return;
      }

      await updateProfile(form);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  if (profileLoading) {
    return (
      <ProLayout title="Profil professionnel">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Chargement de votre profil...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Récupération des données depuis la base de données
            </p>
          </div>
        </div>
      </ProLayout>
    );
  }

  return (
    <ProLayout title="Profil utilisateur">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
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

        <div className="card">
          <h2 className="text-lg font-medium mb-4">Photo de profil</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  form.photo ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="Photo de profil"
                className="h-20 w-20 rounded-full object-cover border-4 border-cyan-500"
              />
              <button
                type="button"
                onClick={triggerImageSelect}
                className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1 rounded-full hover:bg-cyan-600 transition-colors"
                title="Changer la photo"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Formats acceptés : JPG, PNG (max 2MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerImageSelect}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                Choisir une image
              </button>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-medium">Informations personnelles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nom complet
              </label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Téléphone
              </label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+225 XX XX XX XX XX"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-slate-800 dark:text-slate-200">
                Localisation géographique
              </h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="btn-secondary flex items-center gap-2 text-sm"
                title="Utiliser ma position actuelle"
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? "Localisation..." : "Position actuelle"}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Latitude
                </label>
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => update("latitude", e.target.value)}
                  placeholder="ex: 5.3167"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Longitude
                </label>
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => update("longitude", e.target.value)}
                  placeholder="ex: -4.0333"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Ces coordonnées GPS permettent de localiser votre cabinet sur la
              carte. Cliquez sur "Position actuelle" pour utiliser votre
              localisation ou saisissez-les manuellement.
            </p>
          </div>
        </div>
      </div>
    </ProLayout>
  );
}
