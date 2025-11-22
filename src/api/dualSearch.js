import axiosInstance from "./axiosInstance";

// Mapping intelligent pour comprendre les intentions de recherche
const INTELLIGENT_MAPPING = {
  docteur: ["médecin", "dr", "doc", "praticien", "professionnel"],
  médecin: ["docteur", "dr", "doc", "praticien", "professionnel"],
  pharmacie: ["pharma", "médicament", "officine"],
  centre: ["clinique", "hôpital", "centre médical", "établissement"],
  laboratoire: ["labo", "analyse", "biologie", "prélèvement"],
  infirmerie: ["infirmier", "soin", "cabinet infirmier"],
  dentiste: ["dentaire", "orthodontiste", "chirurgien dentaire"],
  kiné: ["kinésithérapeute", "physiothérapeute", "rééducation"],
  cardiologue: ["cœur", "cardiologie"],
  dermatologue: ["peau", "dermatologie"],
  psychiatre: ["psychologue", "mental", "psychiatrie"],
  gynécologue: ["femme", "gynécologie"],
  pédiatre: ["enfant", "pédiatrie"],
  ophtalmologue: ["yeux", "vue", "ophtalmologie"],
  urgence: ["urgences", "emergency", "secours"],
};

// Fonction d'analyse d'intention de recherche INTELLIGENTE
const analyzeSearchIntent = (query) => {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = query.toLowerCase().trim();
  const searchTerms = new Set([cleanQuery]);

  console.log("🔍 Analyse d'intention pour:", cleanQuery);

  // Recherche directe et synonymes
  Object.keys(INTELLIGENT_MAPPING).forEach((key) => {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      searchTerms.add(key);
      INTELLIGENT_MAPPING[key].forEach((synonym) => searchTerms.add(synonym));
    }
  });

  // Recherche partielle intelligente
  if (cleanQuery.length >= 3) {
    Object.keys(INTELLIGENT_MAPPING).forEach((key) => {
      if (
        key.startsWith(cleanQuery) ||
        cleanQuery.startsWith(key.substring(0, 3))
      ) {
        searchTerms.add(key);
        INTELLIGENT_MAPPING[key].forEach((synonym) => searchTerms.add(synonym));
      }
    });
  }

  // Ajout des termes génériques pour recherche large
  if (cleanQuery.length >= 2) {
    searchTerms.add("médecin");
    searchTerms.add("docteur");
    searchTerms.add("dr");
  }

  const terms = Array.from(searchTerms);
  console.log("🎯 Termes de recherche générés:", terms);
  return terms;
};

// Fonction de recherche dans la base de données avec termes intelligents
const searchInDatabase = async (searchTerms) => {
  console.log("🔍 Recherche DB avec termes:", searchTerms);

  try {
    // Recherche avec tous les termes (large)
    const allTermsQuery = searchTerms.join(" ");
    const response = await axiosInstance.get("/api/doctors", {
      params: { search: allTermsQuery },
    });

    const doctors = response.data?.data || [];
    console.log("📊 Docteurs trouvés:", doctors.length);

    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty || "Médecin généraliste",
      type: "docteur",
      address: doctor.address,
      latitude: doctor.latitude ? parseFloat(doctor.latitude) : null,
      longitude: doctor.longitude ? parseFloat(doctor.longitude) : null,
      phone: doctor.phone,
      email: doctor.email,
    }));
  } catch (error) {
    console.error("❌ Erreur recherche DB:", error);
    return [];
  }
};

// Fonction de filtrage géographique
const geographicFiltering = (establishments, bounds) => {
  if (!bounds) return establishments;

  return establishments.filter((establishment) => {
    if (!establishment.latitude || !establishment.longitude) return false;

    const lat = establishment.latitude;
    const lng = establishment.longitude;

    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    );
  });
};

// Fonction de fusion intelligente AMÉLIORÉE
const intelligentFusion = (dbResults, searchTerms, bounds) => {
  console.log("🧩 Fusion intelligente:", {
    dbResults: dbResults.length,
    searchTerms,
    bounds: !!bounds,
  });

  // Tous les établissements trouvés (pour la liste)
  const allItems = [...dbResults];

  // Filtrage géographique pour la carte
  const mapItems = bounds ? geographicFiltering(dbResults, bounds) : dbResults;

  console.log("✅ Fusion terminée:", {
    allItems: allItems.length,
    mapItems: mapItems.length,
  });

  return {
    allItems,
    mapItems,
  };
};

// Fonction principale de recherche dual intelligente
export const dualIntelligentSearch = async (query, bounds = null) => {
  console.log("🚀 Recherche dual intelligente:", { query, bounds: !!bounds });

  if (!query || query.trim().length === 0) {
    return { allItems: [], mapItems: [] };
  }

  try {
    // 1. Analyse d'intention
    const searchTerms = analyzeSearchIntent(query);

    // 2. Recherche dans la base de données
    const dbResults = await searchInDatabase(searchTerms);

    // 3. Fusion intelligente des résultats
    const finalResults = intelligentFusion(dbResults, searchTerms, bounds);

    console.log("🎉 Recherche dual terminée:", {
      query,
      allItems: finalResults.allItems.length,
      mapItems: finalResults.mapItems.length,
    });

    return finalResults;
  } catch (error) {
    console.error("❌ Erreur recherche dual:", error);
    return { allItems: [], mapItems: [] };
  }
};

export default dualIntelligentSearch;
