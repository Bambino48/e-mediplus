/* eslint-disable no-unused-vars */
import { getDoctorsList } from "./doctors.js";
import { dualIntelligentSearch } from "./dualSearch.js";

export async function searchProviders(params) {
  console.log("🔍 Recherche avec système dual intelligent");

  try {
    // 🧠 Utilisation du nouveau système de recherche dual
    const result = await dualIntelligentSearch(params);
    console.log("📊 Résultat recherche dual:", result);

    return {
      items: result.items || [],
      total: result.total || 0,
      source: result.source || "dual",
      meta: {
        searchTerms: result.searchTerms || [],
        databaseCount: result.databaseCount || 0,
        geoFilteredCount: result.geoFilteredCount || 0,
      },
    };
  } catch (error) {
    console.warn("❌ Erreur système dual, fallback vers doctors:", error);
    return searchDoctorsOnly(params); // Fallback vers l'ancienne méthode
  }
}

// Fonction de fallback qui utilise seulement l'API doctors
async function searchDoctorsOnly(params) {
  try {
    // 👉 Utilisation de la vraie API doctors
    const searchParams = {
      per_page: params.limit || 20,
      city: params.city,
      specialty: params.specialty,
      has_profile: true,
      sort_by: params.sort_by || "nom",
      sort_order: params.sort_order || "asc",
    };
    const data = await getDoctorsList(searchParams);

    // Transformation des données pour correspondre au format attendu par le frontend
    const items =
      data.data?.doctors
        ?.filter((doctor) => doctor.latitude && doctor.longitude) // Seulement les docteurs avec coordonnées réelles
        ?.map((doctor) => {
          const item = {
            id: doctor.id,
            name: doctor.name || `Dr ${doctor.first_name} ${doctor.last_name}`,
            specialty: doctor.specialty || doctor.specialization,
            type: doctor.type || "doctor", // doctor, clinic, hospital, pharmacy
            rating: doctor.rating || 4.5,
            languages: doctor.languages || ["FR"],
            fees: doctor.consultation_fee || 15000,
            lat: doctor.latitude,
            lng: doctor.longitude,
            nextSlot: doctor.next_availability || "10:30",
            distance_km: doctor.distance_km || 0,
            phone: doctor.phone,
            email: doctor.email,
            address: doctor.address,
            bio: doctor.bio,
            experience_years: doctor.experience_years,
            is_available: doctor.is_available,
          };

          console.log(
            `📍 Docteur ${doctor.name}: lat=${item.lat}, lng=${item.lng}`
          );
          return item;
        }) || [];

    return {
      items,
      meta: data.pagination || {},
      links: data.links || {},
    };
  } catch (error) {
    console.warn("Erreur API doctors, utilisation du mock:", error);
    return mockSearch(params); // Fallback vers le mock en cas d'erreur
  }
}

// -------- MOCK ---------
const MOCK = [
  {
    id: 1,
    name: "Dr Marie Kouassi",
    specialty: "Cardiologie",
    rating: 4.7,
    languages: ["FR", "EN"],
    fees: 15000,
    lat: 5.3456,
    lng: -4.0237,
    nextSlot: "10:30",
    distance_km: 2.1,
  },
  {
    id: 2,
    name: "Clinique Santé Plus",
    specialty: "Centre médical",
    rating: 4.4,
    languages: ["FR"],
    fees: 10000,
    lat: 5.3556,
    lng: -4.0137,
    nextSlot: "11:15",
    distance_km: 3.8,
  },
  {
    id: 3,
    name: "Dr Mamadou Keita",
    specialty: "Pédiatrie",
    rating: 4.9,
    languages: ["FR"],
    fees: 12000,
    lat: 5.3256,
    lng: -4.0537,
    nextSlot: "09:45",
    distance_km: 4.5,
  },
];

function mockSearch(params) {
  const {
    q = "",
    specialty = "",
    minRating = 0,
    language = "",
    radius_km = 50,
    lat,
    lng,
  } = params || {};
  let res = [...MOCK];
  if (q)
    res = res.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  if (specialty)
    res = res.filter((x) =>
      x.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  if (language) res = res.filter((x) => x.languages.includes(language));
  if (minRating) res = res.filter((x) => x.rating >= Number(minRating));
  if (lat && lng)
    res = res.map((x) => ({
      ...x,
      distance_km: haversine(lat, lng, x.lat, x.lng),
    }));
  return Promise.resolve({ items: res });
}

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // km
}
