import {
  Activity,
  AlertTriangle,
  Ambulance,
  Building2,
  Clock,
  Globe,
  Heart,
  Hospital,
  Info,
  Loader2,
  MapPin,
  Phone,
  Pill,
  Scan,
  Search as SearchIcon,
  Smile,
  Stethoscope,
  TestTube,
  User
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DoctorCard from "../../components/DoctorCard.jsx";
import MapWithMarkers from "../../components/MapWithMarkers.jsx";

import { getDoctorsList } from "../../api/doctors.js";
import { useAuth } from "../../hooks/useAuth";
import { useGeo } from "../../hooks/useGeo.js";
import { useFavoritesStore } from "../../store/favoritesStore.js";

// Fonction helper pour rendre l'icône appropriée
const renderIcon = (iconName, className = "w-8 h-8") => {
  const iconProps = { className };
  switch (iconName) {
    case "Hospital":
      return <Hospital {...iconProps} />;
    case "Pill":
      return <Pill {...iconProps} />;
    case "TestTube":
      return <TestTube {...iconProps} />;
    case "Stethoscope":
      return <Stethoscope {...iconProps} />;
    case "Building2":
      return <Building2 {...iconProps} />;
    case "Scan":
      return <Scan {...iconProps} />;
    case "Ambulance":
      return <Ambulance {...iconProps} />;
    case "Activity":
      return <Activity {...iconProps} />;
    case "Smile":
      return <Smile {...iconProps} />;
    default:
      return <Hospital {...iconProps} />;
  }
};

export default function Search() {
  const { coords, detect, setCoords, loading } = useGeo();
  const { user } = useAuth();

  // État de recherche
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [radius, setRadius] = useState(10);
  const [realTimeItems, setRealTimeItems] = useState([]); // Items provenant d'Overpass
  const [isLoading, setIsLoading] = useState(false);
  const [searchFunction, setSearchFunction] = useState(null);
  const [infoMessage, setInfoMessage] = useState(""); // Message d'information pour l'utilisateur

  // État pour les filtres avancés
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);

  // État pour afficher tous les médecins
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allDoctorsLoading, setAllDoctorsLoading] = useState(false);

  // Fonction pour charger tous les médecins (avec protection contre les appels multiples)
  const fetchAllDoctors = useCallback(async () => {
    if (allDoctorsLoading || allDoctors.length > 0) {
      return; // Éviter les appels multiples
    }

    try {
      setAllDoctorsLoading(true);

      const response = await getDoctorsList({
        per_page: 100, // Charger beaucoup de médecins
        has_profile: true,
        sort_by: "name",
        sort_order: "asc",
      });

      const doctorsArray = response.data?.doctors || [];
      setAllDoctors(doctorsArray);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des médecins:", error);
      setAllDoctors([]);
    } finally {
      setAllDoctorsLoading(false);
    }
  }, [allDoctorsLoading, allDoctors.length]);

  // Initialiser les valeurs depuis les paramètres URL
  useEffect(() => {
    // Lire les paramètres d'URL pour pré-remplir la recherche
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");
    const locationParam = urlParams.get("location");
    const latParam = urlParams.get("lat");
    const lngParam = urlParams.get("lng");
    const showAllParam = urlParams.get("show_all_doctors");

    // Vérifier si on doit afficher tous les médecins
    if (showAllParam === "true" && !showAllDoctors) {
      setShowAllDoctors(true);
      fetchAllDoctors();
      return; // Ne pas continuer avec les autres paramètres
    }

    // Définir la requête de recherche
    if (queryParam) {
      setQ(queryParam);
    }

    // Définir la localisation manuelle
    if (locationParam) {
      setCoords((prev) => ({ ...prev, manual: locationParam }));
    }

    // Définir les coordonnées GPS si présentes
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoords({ lat, lng });
      }
    }
  }, [setCoords, fetchAllDoctors, showAllDoctors]);

  // Détection automatique de la position GPS au chargement de la page de recherche
  useEffect(() => {
    // Ne déclencher la détection que si on n'a pas de coordonnées (ni depuis URL ni déjà détectées)
    if (!coords) {
      detect();
    }
  }, [coords, detect]);

  // Fonction pour géocoder une adresse manuelle
  const geocodeLocation = async (locationString) => {
    if (!locationString || locationString.trim().length < 2) {
      return null;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationString + ", Côte d'Ivoire"
        )}&limit=1&countrycodes=ci`
      );

      if (!response.ok) {
        throw new Error("Erreur de géocodage");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }

      return null;
    } catch (error) {
      console.error("Erreur lors du géocodage:", error);
      return null;
    }
  };

  // Suppression de la recherche automatique pour éviter les boucles infinies
  // La recherche se fait uniquement manuellement maintenant

  // Fonction pour déclencher la recherche manuellement
  const handleManualSearch = useCallback(() => {
    if (!searchFunction) {
      console.warn("❌ Fonction de recherche non disponible");
      return;
    }

    searchFunction();
  }, [searchFunction]);

  // Callback pour recevoir la fonction de recherche du composant Map
  const handleSearchFunctionUpdate = (searchFunc) => {
    setSearchFunction(() => searchFunc);
  };

  // Callback pour recevoir les items du composant Map
  const handleItemsUpdate = (items) => {
    setRealTimeItems(items);
  };

  // Callback pour synchroniser l'état de chargement
  const handleLoadingStateUpdate = (loading) => {
    setIsLoading(loading);
  };

  // Suppression de la recherche automatique - tout se fait manuellement maintenant

  // Utiliser realTimeItems au lieu de data
  const items = realTimeItems ?? [];
  const itemsWithoutCoords = []; // Pas nécessaire avec Overpass car on a les coordonnées
  const allItems = realTimeItems ?? [];
  const totalAll = realTimeItems?.length ?? 0;

  // Si on affiche tous les médecins, utiliser une vue différente
  if (showAllDoctors) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête pour tous les médecins */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Tous les médecins
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {allDoctorsLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Chargement des médecins...
              </span>
            ) : (
              <span>
                {`${allDoctors.length} médecin${allDoctors.length > 1 ? "s" : ""
                  } trouvé${allDoctors.length > 1 ? "s" : ""}`}
              </span>
            )}
          </div>
        </div>

        {/* Liste de tous les médecins */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {allDoctorsLoading ? (
            // Squelettes de chargement
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
                </div>
              </div>
            ))
          ) : allDoctors.length > 0 ? (
            allDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                user={user}
                userLocation={coords}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 mb-4">
                Aucun médecin disponible pour le moment
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <div>
      {/* En-tête avec compteur */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Recherche d'établissements de santé
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Recherche en cours...
              </span>
            ) : (
              <>
                {`${totalAll} établissement${totalAll > 1 ? "s" : ""} trouvé${totalAll > 1 ? "s" : ""
                  }`}
                <span className="text-blue-600">
                  ({items.length} sur la carte)
                </span>
                {itemsWithoutCoords.length > 0 && (
                  <span className="text-amber-600">
                    {" • "}
                    {itemsWithoutCoords.length} sans coordonnées
                  </span>
                )}
              </>
            )}
          </span>
          {coords && (
            <span className="text-blue-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Position détectée
            </span>
          )}
          {!coords && (
            <span className="text-amber-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              Position par défaut (Abidjan)
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Colonne gauche : Filtres + Liste */}
        <div className="space-y-4">
          <div className="card">
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Champ de recherche avec bouton intégré */}
              <div className="relative flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 transition-colors">
                <SearchIcon className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nom, symptôme, spécialité..."
                  className="bg-transparent outline-none w-full text-sm placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && q.trim().length >= 3 && coords) {
                      handleManualSearch();
                    }
                  }}
                  aria-label="Rechercher un établissement de santé"
                />
                <button
                  type="button"
                  onClick={handleManualSearch}
                  disabled={isLoading || !coords || q.trim().length < 3}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    flex items-center gap-1 shrink-0 min-w-10 justify-center
                    ${isLoading || !coords || q.trim().length < 3
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
                    }
                  `}
                  title={
                    !coords
                      ? "Activez la localisation pour effectuer une recherche"
                      : q.trim().length < 3
                        ? "Tapez au moins 3 caractères"
                        : "Lancer la recherche autour de votre position"
                  }
                  aria-label={
                    !coords
                      ? "Activez la localisation pour effectuer une recherche"
                      : q.trim().length < 3
                        ? "Tapez au moins 3 caractères pour rechercher"
                        : "Lancer la recherche autour de votre position"
                  }
                >
                  {isLoading ? (
                    <div
                      className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"
                      aria-hidden="true"
                    />
                  ) : (
                    "Go"
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                <MapPin className="h-5 w-5 text-slate-400" />
                <input
                  onChange={async (e) => {
                    const locationString = e.target.value;
                    if (locationString.trim().length >= 3) {
                      // Essayer de géocoder l'adresse
                      const geocodedCoords = await geocodeLocation(
                        locationString
                      );
                      if (geocodedCoords) {
                        setCoords(geocodedCoords);
                      } else {
                        // Si le géocodage échoue, stocker la chaîne pour référence
                        setCoords({ manual: locationString });
                      }
                    } else {
                      setCoords({ manual: locationString });
                    }
                  }}
                  placeholder="Localisation (ex: Abobo, Plateau, Yopougon)"
                  className="bg-transparent outline-none w-full text-sm"
                />
                <button
                  onClick={detect}
                  disabled={loading}
                  className="btn-ghost text-xs disabled:opacity-50"
                >
                  {loading ? "..." : "Me localiser"}
                </button>
              </div>
            </div>

            {/* Message informatif sur la recherche */}
            <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : coords ? (
                    <MapPin className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </span>
                <span>
                  {loading ? (
                    <strong>Détection de votre position en cours...</strong>
                  ) : coords ? (
                    <>
                      <strong>Position détectée :</strong> Les recherches afficheront les centres de santé proches de chez vous.
                    </>
                  ) : (
                    <>
                      <strong>Localisation requise :</strong> Activez votre localisation pour trouver les centres de santé proches de chez vous.
                      {" Cliquez sur \"Me localiser\" ou autorisez la géolocalisation dans votre navigateur."}
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-3 grid sm:grid-cols-4 gap-3">
              <select
                className="input"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">Tous les établissements</option>
                <optgroup label="Centres médicaux">
                  <option value="hospital">Hôpital</option>
                  <option value="clinic">Clinique</option>
                  <option value="medical_center">Centre médical</option>
                </optgroup>
                <optgroup label="Médecins par spécialité">
                  <option value="general_practitioner">
                    Médecine générale
                  </option>
                  <option value="cardiologist">Cardiologie</option>
                  <option value="pediatrician">Pédiatrie</option>
                  <option value="gynecologist">Gynécologie</option>
                  <option value="dermatologist">Dermatologie</option>
                  <option value="ophthalmologist">Ophtalmologie</option>
                  <option value="orthopedic">Orthopédie</option>
                  <option value="neurologist">Neurologie</option>
                  <option value="psychiatrist">Psychiatrie</option>
                  <option value="dentist">Dentiste</option>
                  <option value="surgeon">Chirurgie</option>
                </optgroup>
                <optgroup label="Pharmacies & Laboratoires">
                  <option value="pharmacy">Pharmacie</option>
                  <option value="laboratory">Laboratoire d'analyses</option>
                </optgroup>
                <optgroup label="Soins spécialisés">
                  <option value="physiotherapist">Kinésithérapie</option>
                  <option value="radiology">Radiologie</option>
                  <option value="emergency">Urgences</option>
                </optgroup>
              </select>
              <select
                className="input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Langue</option>
                <option value="FR">Français</option>
                <option value="EN">English</option>
              </select>
              <select
                className="input"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value={0}>Note minimale</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={4.5}>4.5+</option>
              </select>
              <select
                className="input"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            {/* Filtres avancés */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                Filtres avancés (OSM)
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={wheelchairAccessible}
                    onChange={(e) => setWheelchairAccessible(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <User className="h-4 w-4" />
                  Accessible aux fauteuils roulants
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={openNow}
                    onChange={(e) => setOpenNow(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Clock className="h-4 w-4" />
                  Ouvert maintenant
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasPhone}
                    onChange={(e) => setHasPhone(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Phone className="h-4 w-4" />
                  Avec numéro de téléphone
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasWebsite}
                    onChange={(e) => setHasWebsite(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Globe className="h-4 w-4" />
                  Avec site web
                </label>
              </div>
            </div>
          </div>

          {/* Message d'information */}
          {infoMessage && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">{infoMessage}</p>
              </div>
            </div>
          )}

          <ResultsList items={allItems} isLoading={isLoading} />
        </div>

        {/* Colonne droite : Carte */}
        <div className="sticky top-20 space-y-4">
          <MapWithMarkers
            center={coords ? [coords.lat, coords.lng] : [5.3456, -4.0237]} // Position par défaut temporaire pour l'affichage
            items={items}
            itemsWithoutCoords={itemsWithoutCoords}
            userPosition={coords}
            searchQuery={q}
            specialty={specialty}
            wheelchairAccessible={wheelchairAccessible}
            openNow={openNow}
            hasPhone={hasPhone}
            hasWebsite={hasWebsite}
            onItemsUpdate={handleItemsUpdate}
            onSearchRequest={handleSearchFunctionUpdate}
            onLoadingStateUpdate={handleLoadingStateUpdate}
            onInfoMessageUpdate={setInfoMessage}
            onSelect={(it) => {
              const el = document.getElementById(`card-${it.id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />

          {/* Légende des marqueurs */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Légende de la carte
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-white">
                  <MapPin className="h-2 w-2" />
                </div>
                <span>Votre position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center text-white">
                  <Stethoscope className="h-2 w-2" />
                </div>
                <span>Médecins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center text-white">
                  <div className="text-[8px] font-bold">+</div>
                </div>
                <span>Hôpitaux/Cliniques</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center text-white">
                  <Pill className="h-2 w-2" />
                </div>
                <span>Pharmacies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center text-white">
                  <TestTube className="h-2 w-2" />
                </div>
                <span>Laboratoires</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyan-500 rounded flex items-center justify-center text-white">
                  <Smile className="h-2 w-2" />
                </div>
                <span>Dentistes</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <strong className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Source temps réel:
              </strong> OpenStreetMap
              <br />
              Les données sont mises à jour automatiquement depuis la base
              mondiale d'OpenStreetMap.
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Cliquez sur un marqueur pour voir les détails
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

function ResultsList({ items, loading }) {
  if (loading) {
    return (
      <div className="card grid place-items-center py-16 text-sm text-slate-500">
        Chargement des résultats…
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="card">
        <div className="text-sm text-slate-500">
          Aucun résultat. Essayez d'élargir le rayon ou de retirer un filtre.
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <ResultCard key={it.id || Math.random()} item={it} />
      ))}
    </div>
  );
}

function ResultCard({ item }) {
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggle = useFavoritesStore((s) => s.toggle);

  // Validation des données d'entrée
  if (!item || typeof item !== 'object') {
    console.error("❌ ResultCard: item invalide reçu:", item);
    return null;
  }

  const isFav = item.id ? favorites.has(item.id) : false;

  // Debug logs removed for production

  return (
    <div id={`card-${item.id || 'unknown'}`} className="card">
      <div className="flex gap-3">
        <div
          className="h-16 w-16 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: (item.color || '#6B7280') + "20",
            color: item.color || '#6B7280'
          }}
        >
          {renderIcon(item.emoji, "w-8 h-8")}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{item.name || 'Établissement sans nom'}</div>
            {item.id && (
              <button
                onClick={() => toggle(item.id)}
                className="btn-ghost"
                aria-label="Favori"
              >
                <Heart
                  className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : ""}`}
                />
              </button>
            )}
          </div>
          <div className="text-sm text-slate-500">
            {item.specialty || item.type || 'Type inconnu'} • {item.distance_km || 0} km
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {item.phone && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                <Phone className="h-3 w-3" />
                {item.phone}
              </span>
            )}
            {item.website && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                <Globe className="h-3 w-3" />
                Site web
              </span>
            )}
            {item.wheelchair && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                <User className="h-3 w-3" />
                Accessible
              </span>
            )}
            {item.opening_hours && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded">
                <Clock className="h-3 w-3" />
                Horaires
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-slate-600">{item.address || 'Adresse non disponible'}</div>
          <div className="mt-3 flex gap-2">
            <button className="btn-secondary text-xs">Voir sur la carte</button>
            {item.phone && (
              <a href={`tel:${item.phone}`} className="btn-primary text-xs">
                Appeler
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
