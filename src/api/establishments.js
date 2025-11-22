import api from "./axiosInstance.js";

// Dictionnaire intelligent pour mapper les termes de recherche vers les spécialités
const SEARCH_MAPPING = {
  // Infirmeries et soins
  infirmerie: ["infirmier", "soins infirmiers", "nursing", "infirmière"],
  infirmier: ["infirmier", "soins infirmiers", "nursing", "infirmière"],
  soins: ["infirmier", "soins infirmiers", "nursing", "soins"],

  // Pharmacies
  pharmacie: ["pharmacien", "pharmacie", "médicament", "officine"],
  pharmacien: ["pharmacien", "pharmacie", "médicament", "officine"],
  médicament: ["pharmacien", "pharmacie", "médicament"],

  // Laboratoires
  laboratoire: ["biologiste", "analyses", "biologie médicale", "laboratoire"],
  analyses: ["biologiste", "analyses", "biologie médicale", "laboratoire"],
  biologie: ["biologiste", "analyses", "biologie médicale"],

  // Centres médicaux
  "centre médical": ["centre", "clinique", "polyclinique", "centre médical"],
  clinique: ["centre", "clinique", "polyclinique", "centre médical"],
  hôpital: ["hôpital", "centre hospitalier", "chu"],

  // Spécialités médicales courantes
  cardio: ["cardiologie", "cardiologue", "cœur"],
  dermato: ["dermatologie", "dermatologue", "peau"],
  gyneco: ["gynécologie", "gynécologue", "obstétrique"],
  ophtamo: ["ophtalmologie", "ophtalmologue", "oeil", "yeux"],
  dentaire: ["dentiste", "dentaire", "stomatologie"],
  pédiatrie: ["pédiatre", "pédiatrie", "enfant"],
  psychiatrie: ["psychiatre", "psychiatrie", "psychologue"],
  radiologie: ["radiologue", "radiologie", "imagerie"],
  urgence: ["urgentiste", "urgences", "samu"],
};

// Fonction pour analyser l'intention de recherche
const analyzeSearchIntent = (query) => {
  if (!query || query.trim().length === 0) return [];

  const lowerQuery = query.toLowerCase().trim();
  const matchedTerms = new Set();

  // Recherche directe dans le mapping
  Object.entries(SEARCH_MAPPING).forEach(([key, specialties]) => {
    if (lowerQuery.includes(key)) {
      specialties.forEach((spec) => matchedTerms.add(spec));
    }
  });

  // Si aucun mapping trouvé, utiliser le terme original
  if (matchedTerms.size === 0) {
    matchedTerms.add(lowerQuery);
  }

  return Array.from(matchedTerms);
};

// Fonction pour calculer la distance entre deux points (formule de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Fonction pour classifier le type d'établissement
const classifyEstablishment = (item) => {
  const specialty = (item.specialty || "").toLowerCase();
  const name = (item.name || "").toLowerCase();

  // Classification par spécialité et nom
  if (
    specialty.includes("infirmier") ||
    specialty.includes("soins") ||
    name.includes("infirmerie")
  ) {
    return { type: "medical_center", emoji: "🏥", color: "#EF4444" };
  }

  if (
    specialty.includes("pharmacien") ||
    specialty.includes("pharmacie") ||
    name.includes("pharmacie")
  ) {
    return { type: "pharmacy", emoji: "💊", color: "#8B5CF6" };
  }

  if (
    specialty.includes("biologiste") ||
    specialty.includes("analyses") ||
    specialty.includes("laboratoire") ||
    name.includes("laboratoire")
  ) {
    return { type: "laboratory", emoji: "🔬", color: "#F59E0B" };
  }

  if (
    specialty.includes("centre") ||
    specialty.includes("clinique") ||
    name.includes("centre") ||
    name.includes("clinique")
  ) {
    return { type: "medical_center", emoji: "🏥", color: "#EF4444" };
  }

  // Par défaut : docteur
  return { type: "doctor", emoji: "👨‍⚕️", color: "#10B981" };
};

// API intelligente pour rechercher tous types d'établissements
export const searchAllEstablishments = async (params = {}) => {
  try {
    // Analyser l'intention de recherche
    const searchTerms = analyzeSearchIntent(params.q);
    console.log("🔍 Analyse de recherche:", params.q, "→", searchTerms);

    // Faire une recherche large pour avoir plus de résultats
    const response = await api.get("/doctors", {
      params: {
        per_page: 100, // Augmenter pour avoir plus de choix
        q: params.q || "",
        city: params.city,
        specialty: params.specialty,
        sort_by: "rating",
        sort_order: "desc",
      },
    });

    let allItems = response.data?.data?.doctors || response.data?.doctors || [];

    console.log("🏥 Structure des données reçues:", {
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      hasDoctors: !!response.data?.data?.doctors,
      fullResponse: response.data,
      firstItem: allItems[0],
      count: allItems.length,
      coords: allItems[0]
        ? {
            lat: allItems[0].lat,
            lng: allItems[0].lng,
            latitude: allItems[0].latitude,
            longitude: allItems[0].longitude,
          }
        : null,
    });

    // Filtrage intelligent basé sur les termes analysés
    if (searchTerms.length > 0 && params.q) {
      allItems = allItems.filter((item) => {
        const specialty = (item.specialty || "").toLowerCase();
        const name = (item.name || "").toLowerCase();

        return searchTerms.some(
          (term) =>
            specialty.includes(term.toLowerCase()) ||
            name.includes(term.toLowerCase())
        );
      });
    }

    // Ajouter les classifications et distances
    const userLat = params.lat;
    const userLng = params.lng;

    const processedItems = allItems.map((item) => {
      const classification = classifyEstablishment(item);
      let distance = null;

      // Calculer la distance si position utilisateur disponible
      if (userLat && userLng && item.lat && item.lng) {
        distance = calculateDistance(userLat, userLng, item.lat, item.lng);
      }

      return {
        ...item,
        establishmentType: classification.type,
        emoji: classification.emoji,
        color: classification.color,
        distance_km: distance ? Math.round(distance * 10) / 10 : null,
        // Garder les propriétés originales ET ajouter les uniformisées
        latitude: item.lat || item.latitude,
        longitude: item.lng || item.longitude,
        lat: item.lat || item.latitude, // Pour compatibilité
        lng: item.lng || item.longitude, // Pour compatibilité
      };
    });

    // Filtrer par rayon si spécifié
    let filteredItems = processedItems;
    if (params.radius_km && userLat && userLng) {
      filteredItems = processedItems.filter(
        (item) => !item.distance_km || item.distance_km <= params.radius_km
      );
    }

    // Trier par distance (les plus proches en premier)
    filteredItems.sort((a, b) => {
      if (!a.distance_km) return 1;
      if (!b.distance_km) return -1;
      return a.distance_km - b.distance_km;
    });

    console.log(
      `📍 Trouvé ${filteredItems.length} établissements correspondants`,
      {
        totalItems: allItems.length,
        filteredCount: filteredItems.length,
        searchTerms,
        userPosition:
          userLat && userLng ? { lat: userLat, lng: userLng } : null,
        firstFiltered: filteredItems[0],
        sampleItems: allItems.slice(0, 3).map((item) => ({
          name: item.name,
          specialty: item.specialty,
          coordinates: {
            lat: item.lat,
            lng: item.lng,
            latitude: item.latitude,
            longitude: item.longitude,
          },
        })),
      }
    );

    return {
      items: filteredItems,
      total: filteredItems.length,
      searchTerms,
      userPosition: userLat && userLng ? { lat: userLat, lng: userLng } : null,
    };
  } catch (error) {
    console.error("❌ Erreur recherche établissements:", error);
    return {
      items: [],
      total: 0,
      error: error.message,
    };
  }
};
