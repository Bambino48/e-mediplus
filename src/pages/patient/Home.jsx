 
import {
  AlertTriangle,
  MapPin,
  Search,
  Shield,
  Star,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDoctorsList } from "../../api/doctors.js";
import DoctorCard from "../../components/DoctorCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useGeo } from "../../hooks/useGeo.js";

export default function PatientHome() {
  // État local pour gérer les docteurs
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour le formulaire de recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // Hooks pour la navigation et la géolocalisation
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords, detect } = useGeo();

  // Fonction pour charger les docteurs
  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Chargement des docteurs...");
      const response = await getDoctorsList({
        per_page: 6,
        has_profile: true,
        sort_by: "rating",
        sort_order: "desc",
      });

      // La structure est : response.data.doctors (et non response.data.data.doctors)
      const doctorsArray = response.data?.doctors || [];
      setDoctors(doctorsArray);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des docteurs:", err);
      console.error("📋 Détails de l'erreur:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err);
      // Fallback vers une liste vide
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupération des docteurs au chargement du composant
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fonction pour gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();

    // Paramètres de recherche à passer
    const searchParams = new URLSearchParams();

    if (searchQuery.trim()) {
      searchParams.set("q", searchQuery.trim());
    }

    if (locationQuery.trim()) {
      searchParams.set("location", locationQuery.trim());
    }

    // Si on a des coordonnées GPS, les inclure
    if (coords) {
      searchParams.set("lat", coords.lat.toString());
      searchParams.set("lng", coords.lng.toString());
    }

    // Redirection vers la page de recherche avec les paramètres
    const queryString = searchParams.toString();
    navigate(`/search${queryString ? "?" + queryString : ""}`);
  };

  // Fonction pour détecter la localisation
  const handleLocationDetect = () => {
    detect();
  };

  return (
    <main className="pt-4 pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold tracking-tight"
              >
                Trouvez, réservez, consultez —
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-teal-500">
                  {" "}
                  en quelques clics
                </span>
              </motion.h1>
              {/* Badge de confiance */}
              <div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 mb-4"
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
                  <Shield className="w-4 h-4 mr-2" />
                  Plateforme certifiée & sécurisée
                </span>
              </div>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Plateforme e‑Santé intelligente pour patients et professionnels
                : RDV, téléconsultation, ordonnances numériques et rappels
                médicaments.
              </p>
              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm"
              >
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Symptômes, spécialité, nom"
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>
                  <div className="relative flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder={
                        coords
                          ? `Position détectée (${coords.lat.toFixed(
                              4
                            )}, ${coords.lng.toFixed(4)})`
                          : "Abobo, Treichville…"
                      }
                      className="bg-transparent outline-none w-full text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleLocationDetect}
                      className="text-blue-500 hover:text-blue-600 text-xs shrink-0"
                      title="Détecter ma position"
                    >
                      📍
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      disabled={
                        !searchQuery.trim() && !locationQuery.trim() && !coords
                      }
                    >
                      🔍 Trouver un médecin
                    </button>
                  </div>
                </div>
              </form>{" "}
              {/* Quick CTAs */}
              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <CTA icon={<Stethoscope />} title="Prendre RDV" to="/search" />
                <CTA
                  icon={<Video />}
                  title="Téléconsultation maintenant"
                  to="/teleconsult"
                />
                <CTA
                  icon={<AlertTriangle />}
                  title="Besoin d'urgence ?"
                  to="/triage"
                  variant="warning"
                />
              </div>
            </div>

            <div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="aspect-4/3 rounded-3xl bg-linear-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/20 border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Téléconsultation médicale moderne et accessible"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">
                    Soins de santé accessibles à tous
                  </p>
                </div>
              </div>
              <div className="absolute inset-6 rounded-3xl border border-dashed border-cyan-300/50 dark:border-cyan-700/40 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Des milliers de patients trouvent chaque jour les soins dont ils
              ont besoin grâce à notre plateforme
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-cyan-600 mb-2">
                  5000+
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Patients soignés
                </div>
                <div className="text-sm text-slate-500 mt-1">Ce mois-ci</div>
              </div>
            </div>

            <div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  98%
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Satisfaction
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Taux de recommandation
                </div>
              </div>
            </div>

            <div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  24/7
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Support
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Disponible en permanence
                </div>
              </div>
            </div>

            <div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  150+
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Médecins
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Partenaires certifiés
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ce que disent nos patients
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Découvrez les expériences de patients satisfaits qui ont trouvé
              les soins dont ils avaient besoin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "Une plateforme exceptionnelle ! J'ai pu prendre rendez-vous
                avec un cardiologue en moins de 5 minutes. Le service de
                téléconsultation m'a évité un déplacement inutile."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Marie Dubois
                  </div>
                  <div className="text-sm text-slate-500">
                    Consultation cardiologie
                  </div>
                </div>
              </div>
            </div>

            <div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "Le Dr. Martin a été très professionnel et à l'écoute. Les
                rappels de médicaments intégrés à l'app m'ont beaucoup aidé à
                suivre mon traitement."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Pierre Leroy
                  </div>
                  <div className="text-sm text-slate-500">Suivi diabète</div>
                </div>
              </div>
            </div>

            <div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "Service rapide et efficace. J'ai pu obtenir une ordonnance
                numérique immédiatement après ma consultation. Plus besoin
                d'attendre à la pharmacie !"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Sophie Bernard
                  </div>
                  <div className="text-sm text-slate-500">
                    Consultation générale
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Near me cards */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Près de moi</h2>
            <Link
              to="/search?show_all_doctors=true"
              className="text-sm text-cyan-600"
            >
              Voir tout
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                Erreur lors du chargement des docteurs
              </p>
              <button
                onClick={fetchDoctors}
                className="btn-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Réessayer"}
              </button>
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  user={user}
                  userLocation={coords}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                Aucun docteur disponible pour le moment
              </p>
              <Link to="/search" className="btn-primary">
                Explorer tous les professionnels
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CTA({ icon, title, to, variant }) {
  const base = "flex items-center gap-2 px-4 py-2 rounded-xl text-sm";
  const styles =
    variant === "warning"
      ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800"
      : "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-100 dark:border-slate-700";
  return (
    <Link to={to} className={`${base} ${styles}`}>
      <span className="shrink-0">{icon}</span>
      <span className="font-medium">{title}</span>
    </Link>
  );
}

