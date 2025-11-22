import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useAuth } from "../../hooks/useAuth";

// ✅ Icône personnalisée pour la position du patient
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

export default function PatientProfile() {
  const { user, updateProfile } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    latitude: "",
    longitude: "",
    photo: "",
    photoFile: null,
  });

  const [preview, setPreview] = useState(DEFAULT_AVATAR); // ✅ prévisualisation locale
  const [showMap, setShowMap] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const resolvePhotoPreview = useCallback(
    (photoSource, photoUrl) => {
      if (photoUrl && photoUrl.startsWith("http")) return photoUrl;
      if (photoSource && photoSource.startsWith("data:image"))
        return photoSource;
      if (photoSource && photoSource.startsWith("http")) return photoSource;
      if (photoSource) return `${API_URL}/storage/${photoSource}`;
      return DEFAULT_AVATAR;
    },
    [API_URL, DEFAULT_AVATAR]
  );

  // ✅ Préremplir les données
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        latitude: user.latitude || "",
        longitude: user.longitude || "",
        photo: user.photo || user.photo_url || "",
        photoFile: null,
      });

      const nextPreview = resolvePhotoPreview(user.photo, user.photo_url);
      setPreview(nextPreview);
    }
  }, [user, resolvePhotoPreview]);

  // ✅ Géolocalisation (non intrusive)
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({ ...prev, latitude, longitude }));
      },
      (err) => {
        console.warn("Erreur géolocalisation :", err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ✅ Gestion du téléchargement et prévisualisation
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB max
      toast.error("La taille de l'image ne doit pas dépasser 5MB");
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result,
        photoFile: file,
      }));
      setPreview(reader.result); // ✅ Affiche directement l'image
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      setUploadingPhoto(false);
      toast.error("Impossible de lire le fichier sélectionné");
    };
    reader.readAsDataURL(file);
  };

  // ✅ Soumission du formulaire
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };
      if (!payload.photoFile) {
        delete payload.photoFile;
      }

      await updateProfile(payload);

      // ✅ Le useEffect va automatiquement mettre à jour la preview
      // quand le store Zustand sera mis à jour - pas besoin de setPreview manuel
      setForm((prev) => ({
        ...prev,
        photoFile: null, // Réinitialiser le fichier après upload
      }));

      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("❌ Erreur mise à jour profil:", error);
      toast.error("Erreur lors de la mise à jour du profil.");
    }
  };

  // ✅ Si non connecté
  if (!user) {
    return (
      <div className="text-center mt-16 text-slate-500">
        Vous devez être connecté pour voir cette page.
      </div>
    );
  }

  // ✅ Interface principale
  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
        Mon profil
      </h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* ✅ Section photo de profil */}
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <div className="relative">
            <img
              src={preview}
              alt="Profil"
              className={`h-28 w-28 rounded-full object-cover border-4 border-cyan-500 shadow-md ${uploadingPhoto ? "opacity-60" : ""
                }`}
            />
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <label
              htmlFor="photo"
              className={`absolute bottom-0 right-0 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full transition ${uploadingPhoto
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-cyan-600"
                }`}
            >
              {uploadingPhoto ? "Chargement..." : "Changer"}
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Cliquez sur “Changer” pour mettre à jour votre photo
          </p>
        </div>

        {/* ✅ Infos utilisateur */}
        <div className="space-y-4">
          <input
            className="input"
            type="text"
            placeholder="Nom complet"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            type="text"
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* ✅ Position GPS (readonly) */}
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            type="text"
            placeholder="Latitude"
            value={form.latitude || ""}
            readOnly
          />
          <input
            className="input"
            type="text"
            placeholder="Longitude"
            value={form.longitude || ""}
            readOnly
          />
        </div>

        {/* ✅ Bouton Voir / Masquer carte */}
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="btn-secondary w-full mt-2"
        >
          {showMap ? "Masquer la carte" : "Voir ma position"}
        </button>

        {/* ✅ Carte Leaflet */}
        {showMap && form.latitude && form.longitude && (
          <div className="mt-4 rounded-lg overflow-hidden shadow border border-slate-200 dark:border-slate-800">
            <MapContainer
              center={[form.latitude, form.longitude]}
              zoom={15}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[form.latitude, form.longitude]}
                icon={userIcon}
              >
                <Popup>Vous êtes ici 📍</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <button type="submit" className="btn-primary w-full mt-4">
          Mettre à jour
        </button>
      </form>
    </div>
  );
}

