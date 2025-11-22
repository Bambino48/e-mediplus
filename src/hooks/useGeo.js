import { useCallback, useEffect, useRef, useState } from "react";

export function useGeo() {
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false); // Éviter les tentatives multiples
  const autoDetectionDone = useRef(false); // Référence pour éviter la redétection

  const detect = useCallback(() => {
    if (loading || hasAttempted) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Géolocalisation non supportée");
      setHasAttempted(true);
      return;
    }

    setLoading(true);
    setHasAttempted(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Validation des coordonnées : vérifier si elles sont dans la région de la Côte d'Ivoire
        // Limites larges pour inclure toute la région ivoirienne et zones adjacentes
        const isInIvoryCoastRegion =
          lat >= 4.0 && lat <= 11.0 && lng >= -9.0 && lng <= -2.0;

        // Accepter toutes les coordonnées valides dans la région
        // La gestion des zones avec peu de données sera faite côté API
        if (isInIvoryCoastRegion) {
          setCoords({ lat, lng });
        } else {
          console.warn(
            `⚠️ Coordonnées hors région ivoirienne détectées (${lat}, ${lng}), utilisation de la position par défaut`
          );
          setCoords(null); // Utiliser le fallback
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Impossible d'obtenir la position");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [loading, hasAttempted]);

  useEffect(() => {
    // Auto-détection au chargement - seulement une fois
    if (!autoDetectionDone.current && !hasAttempted && !coords && !loading) {
      autoDetectionDone.current = true;
      detect();
    }
  }, [detect, hasAttempted, coords, loading]);

  return { coords, setCoords, loading, error, detect };
}
