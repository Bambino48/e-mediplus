import L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import overpassApi, {
  searchHealthcareEstablishments,
} from "../api/overpassApi";

// ✅ Fix des icônes Leaflet (Vite)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: marker1x,
  iconRetinaUrl: marker2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Fonction pour créer une icône personnalisée avec nom
const createCustomIcon = (name, color, emoji) => {
  const truncatedName = name.length > 15 ? name.substring(0, 12) + "..." : name;

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 2px;
      ">
        <span>${emoji}</span>
        <span>${truncatedName}</span>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [null, 28],
    iconAnchor: [0, 28],
  });
};

// Icône pour l'utilisateur (vous êtes ici)
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #3B82F6;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-align: center;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        border: 3px solid white;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span style="font-size: 14px;">📍</span>
        <span>Votre position</span>
      </div>
    `,
    className: "custom-user-icon",
    iconSize: [null, 32],
    iconAnchor: [0, 32],
  });
};

L.Marker.prototype.options.icon = DefaultIcon;

function FlyTo({ center }) {
  const map = useMap();
  const lastCenterRef = useRef(null);

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;

    // Éviter les mises à jour si la position n'a pas beaucoup changé
    if (lastCenterRef.current) {
      const distance = Math.sqrt(
        Math.pow(center[0] - lastCenterRef.current[0], 2) +
          Math.pow(center[1] - lastCenterRef.current[1], 2)
      );

      // Ne voler que si la distance est significative (plus de 100m environ)
      if (distance < 0.001) return;
    }

    lastCenterRef.current = center;
    map.flyTo(center, 13, { duration: 0.6 });
  }, [center, map]);
  return null;
}

export default function MapWithMarkers({
  center = [5.3456, -4.0237],
  items = [],
  itemsWithoutCoords = [], // Nouveaux établissements sans coordonnées
  onSelect,
  userPosition = null, // Position de l'utilisateur
  searchQuery = "", // Requête de recherche
  specialty = "", // Spécialité sélectionnée
  wheelchairAccessible = false, // Filtre accessibilité
  openNow = false, // Filtre horaires d'ouverture
  hasPhone = false, // Filtre numéro de téléphone
  hasWebsite = false, // Filtre site web
  onItemsUpdate, // Callback pour mettre à jour les éléments trouvés
  onSearchRequest, // Nouvelle prop pour exposer la fonction de recherche
  onLoadingStateUpdate, // Callback pour l'état de chargement
  onInfoMessageUpdate, // Callback pour les messages d'information
}) {
  const [realTimeItems, setRealTimeItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [canSearch, setCanSearch] = useState(false);
  const [infoMessage, setInfoMessage] = useState(""); // Message d'information pour l'utilisateur
  const onItemsUpdateRef = useRef(onItemsUpdate);
  const isLoadingRef = useRef(isLoading); // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    onItemsUpdateRef.current = onItemsUpdate;
  }, [onItemsUpdate]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    // Synchroniser l'état de chargement avec le parent
    if (onLoadingStateUpdate) {
      onLoadingStateUpdate(isLoading);
    }
  }, [isLoading, onLoadingStateUpdate]); // Mise à jour de l'état de recherche (utilise searchQuery original pour la réactivité du bouton)
  useEffect(() => {
    const canPerformSearch = searchQuery && searchQuery.trim().length >= 3;

    setCanSearch(canPerformSearch);
  }, [searchQuery, isLoading]);

  const handleManualSearch = useCallback(() => {
    // Prévenir les clics multiples pendant le chargement
    if (isLoadingRef.current) {
      return;
    }

    if (!canSearch) {
      return;
    }

    const trimmedQuery = searchQuery.trim();

    // Éviter les recherches redondantes
    if (trimmedQuery === lastSearchQuery) {
      return;
    }

    setIsLoading(true);
    setLastSearchQuery(trimmedQuery);

    // Utiliser la position de l'utilisateur ou une position par défaut (Abidjan)
    const searchPosition =
      userPosition && userPosition.lat && userPosition.lng
        ? userPosition
        : { lat: 5.3167, lng: -4.0333 }; // Position par défaut : Abidjan

    searchHealthcareEstablishments(
      searchPosition,
      20000, // Augmenter temporairement le rayon à 20km
      trimmedQuery,
      specialty
    )
      .then((establishments) => {
        console.log(
          `🗺️ MapWithMarkers - ${establishments.length} établissements reçus:`,
          establishments.slice(0, 3).map((est) => ({
            name: est.name,
            type: est.type,
            lat: est.lat,
            lng: est.lng,
          }))
        );

        // Définir un message d'information selon les résultats
        if (establishments.length === 0) {
          const message =
            "Aucun établissement de santé trouvé dans votre zone. Essayez d'élargir votre recherche ou vérifiez votre position.";
          setInfoMessage(message);
          if (onInfoMessageUpdate) {
            onInfoMessageUpdate(message);
          }
        } else {
          setInfoMessage(""); // Effacer le message si des résultats sont trouvés
          if (onInfoMessageUpdate) {
            onInfoMessageUpdate("");
          }
        }

        // Appliquer les filtres avancés
        let filteredEstablishments = establishments;

        if (wheelchairAccessible) {
          filteredEstablishments = filteredEstablishments.filter(
            (est) => est.wheelchair === true
          );
        }

        if (hasPhone) {
          filteredEstablishments = filteredEstablishments.filter(
            (est) => est.phone && est.phone.trim() !== ""
          );
        }

        if (hasWebsite) {
          filteredEstablishments = filteredEstablishments.filter(
            (est) => est.website && est.website.trim() !== ""
          );
        }

        if (openNow) {
          filteredEstablishments = filteredEstablishments.filter((est) => {
            if (!est.opening_hours) return false;
            // Utiliser la fonction isOpenNow de overpassApi
            return overpassApi.isOpenNow(est.opening_hours);
          });
        }
        setRealTimeItems(filteredEstablishments);
        if (onItemsUpdateRef.current) {
          onItemsUpdateRef.current(filteredEstablishments);
        }
      })
      .catch(() => {
        setRealTimeItems([]);
        if (onItemsUpdateRef.current) {
          onItemsUpdateRef.current([]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    canSearch,
    searchQuery,
    lastSearchQuery,
    userPosition,
    specialty,
    wheelchairAccessible,
    openNow,
    hasPhone,
    hasWebsite,
  ]); // Exposer la fonction de recherche au parent (après sa définition)
  useEffect(() => {
    if (onSearchRequest) {
      onSearchRequest(handleManualSearch);
    }
  }, [handleManualSearch, onSearchRequest]);

  // Nettoyer les résultats quand la requête est trop courte
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setRealTimeItems([]);
      setLastSearchQuery("");
      if (onItemsUpdateRef.current) {
        onItemsUpdateRef.current([]);
      }
    }
  }, [searchQuery]);

  // Combinaison des items statiques et des items temps réel
  const allItems = [...items, ...realTimeItems];

  return (
    <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
      {/* Styles pour les icônes personnalisées */}
      <style>{`
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .custom-div-icon:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease-in-out;
        }
        .custom-user-icon {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .custom-user-icon:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FlyTo center={center} />

        {/* Marqueur pour l'utilisateur */}
        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">📍 Votre position</div>
                <div className="text-slate-500">Vous êtes ici</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs pour les docteurs et centres */}
        {allItems
          .filter((it) => {
            // Valider que les coordonnées existent et sont valides
            const lat = it.lat || it.latitude;
            const lng = it.lng || it.longitude;
            return lat && lng && !isNaN(lat) && !isNaN(lng);
          })
          .map((it, index) => {
            // Utiliser les coordonnées disponibles
            const lat = it.lat || it.latitude;
            const lng = it.lng || it.longitude;

            // Utiliser les couleurs et emojis de l'API Overpass si disponibles
            let emoji = it.emoji || "👨‍⚕️";
            let color = it.color || "#10B981"; // Vert pour docteurs par défaut

            // Fallback pour les anciens items sans emoji/color
            if (!it.emoji || !it.color) {
              // Détermine le type selon les données
              if (
                it.type === "medical_center" ||
                it.type === "clinic" ||
                it.type === "hospital" ||
                it.specialty?.toLowerCase().includes("centre") ||
                it.specialty?.toLowerCase().includes("clinique") ||
                it.specialty?.toLowerCase().includes("hopital") ||
                it.name?.toLowerCase().includes("centre") ||
                it.name?.toLowerCase().includes("clinique") ||
                it.name?.toLowerCase().includes("hopital")
              ) {
                emoji = "🏥";
                color = "#EF4444"; // Rouge pour centres médicaux
              } else if (
                it.type === "pharmacy" ||
                it.specialty?.toLowerCase().includes("pharmacie") ||
                it.name?.toLowerCase().includes("pharmacie")
              ) {
                emoji = "💊";
                color = "#8B5CF6"; // Violet pour pharmacies
              } else if (
                it.type === "laboratory" ||
                it.specialty?.toLowerCase().includes("laboratoire") ||
                it.specialty?.toLowerCase().includes("analyses") ||
                it.name?.toLowerCase().includes("laboratoire") ||
                it.name?.toLowerCase().includes("lab")
              ) {
                emoji = "🔬";
                color = "#F59E0B"; // Orange pour laboratoires
              }
            }

            return (
              <Marker
                key={`${it.id}-${index}`} // Clé unique avec index
                position={[lat, lng]}
                icon={createCustomIcon(it.name, color, emoji)}
                eventHandlers={{ click: () => onSelect?.(it) }}
              >
                <Popup>
                  <div className="text-sm max-w-52">
                    <div className="font-medium text-base mb-2">
                      {emoji} {it.name}
                    </div>

                    {/* Informations spécifiques selon le type */}
                    {it.specialty && (
                      <div className="text-slate-600 mb-1">
                        🩺 {it.specialty}
                      </div>
                    )}

                    {it.address && (
                      <div className="text-slate-600 mb-1">📍 {it.address}</div>
                    )}

                    {it.phone && (
                      <div className="text-slate-600 mb-1">📞 {it.phone}</div>
                    )}

                    {/* Affichage de la distance si disponible */}
                    {it.distance_km && (
                      <div className="text-blue-600 mb-1">
                        📏 {it.distance_km} km
                      </div>
                    )}

                    {/* Informations d'ouverture si disponibles */}
                    {it.opening_hours && (
                      <div className="text-green-600 text-xs mb-1">
                        🕒 {it.opening_hours}
                      </div>
                    )}

                    {/* Site web si disponible */}
                    {it.website && (
                      <div className="text-blue-500 text-xs mb-1">
                        🌐{" "}
                        <a
                          href={it.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Site web
                        </a>
                      </div>
                    )}

                    {/* Accessibilité handicap */}
                    {it.wheelchair && (
                      <div className="text-purple-600 text-xs">
                        ♿ Accessible PMR
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      {it.rating && (
                        <span className="text-yellow-500">
                          ⭐ {it.rating}/5
                        </span>
                      )}
                      {it.fees && (
                        <span className="text-green-600 font-medium">
                          � {it.fees.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>

                    {it.services && it.services.length > 0 && (
                      <div className="mt-1 text-purple-600 text-xs">
                        🔧 {it.services.join(", ")}
                      </div>
                    )}

                    {/* Badge source des données */}
                    <div className="mt-2 text-xs text-slate-400">
                      {it.id?.startsWith("osm_")
                        ? "🌍 OpenStreetMap"
                        : "💾 Base locale"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
      {/* Panel pour les établissements sans coordonnées */}
      {itemsWithoutCoords.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-10 border border-slate-200">
          <h4 className="font-semibold text-sm mb-2 text-slate-700">
            📝 Établissements trouvés ({itemsWithoutCoords.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {itemsWithoutCoords.map((item) => (
              <div
                key={item.id}
                className="p-2 bg-slate-50 rounded text-xs cursor-pointer hover:bg-slate-100"
                onClick={() => onSelect?.(item)}
              >
                <div className="font-medium text-slate-700">{item.name}</div>
                {item.specialty && (
                  <div className="text-slate-500">{item.specialty}</div>
                )}
                <div className="text-amber-600 mt-1">
                  📍 Position à localiser
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Coordonnées en cours de localisation...
          </div>
        </div>
      )}
      {/* Statistiques en temps réel */}
      {realTimeItems.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 z-10 border border-slate-200">
          <div className="text-xs text-slate-600">
            🌍 <strong>{realTimeItems.length}</strong> établissements temps réel
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Source: OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
}
