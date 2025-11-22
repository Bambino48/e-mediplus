import { motion } from "framer-motion";
import {
  Activity,
  Award,
  Bone,
  Brain,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Heart,
  Languages,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../components/Card.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useDoctor, useDoctorAvailabilities } from "../../hooks/useDoctors.js";

export default function Doctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useDoctor(id);
  const { data: availabilityData, isLoading: availabilityLoading } =
    useDoctorAvailabilities(id);

  // Transformation des données
  const doctor = data?.doctor
    ? {
        id: data.doctor.id,
        name: data.doctor.name || "Dr. Nom Inconnu",
        specialty:
          data.doctor.doctor_profile?.primary_specialty || "Médecine générale",
        experience: data.doctor.experience_years || 5,
        address:
          data.doctor.doctor_profile?.address || "Adresse non disponible",
        phone:
          data.doctor.doctor_profile?.phone ||
          data.doctor.phone ||
          "Téléphone non disponible",
        rating: data.doctor.doctor_profile?.rating || 4.5,
        bio:
          data.doctor.doctor_profile?.bio ||
          "Professionnel de santé expérimenté.",
        fees: data.doctor.doctor_profile?.fees || 15000,
        languages: data.doctor.languages || ["Français"],
        reviews: data.doctor.reviews || [],
        photo: data.doctor.photo_url || data.doctor.photo,
        city: data.doctor.doctor_profile?.city,
        email: data.doctor.email,
      }
    : null;

  const [showAllReviews, setShowAllReviews] = useState(false);

  // Fonction pour gérer la réservation avec vérification d'authentification
  const handleBookingClick = (e) => {
    if (!user) {
      e.preventDefault();
      // Rediriger vers la page de connexion avec le paramètre de redirection
      navigate(`/login?redirect=/booking/${id}`);
      return;
    }
    // Si l'utilisateur est connecté, continuer vers la page de réservation
  };

  // Fonction pour obtenir l'icône de spécialité
  const getSpecialtyInfo = (specialty) => {
    const specialtyMap = {
      "Médecine générale": {
        icon: Stethoscope,
        color: "text-blue-600 dark:text-blue-400",
      },
      Cardiologie: { icon: Heart, color: "text-red-600 dark:text-red-400" },
      Pédiatrie: {
        icon: Activity,
        color: "text-green-600 dark:text-green-400",
      },
      Orthopédie: { icon: Bone, color: "text-orange-600 dark:text-orange-400" },
      Neurologie: {
        icon: Brain,
        color: "text-indigo-600 dark:text-indigo-400",
      },
      Psychiatrie: {
        icon: Brain,
        color: "text-violet-600 dark:text-violet-400",
      },
    };
    return (
      specialtyMap[specialty] || {
        icon: Stethoscope,
        color: "text-slate-600 dark:text-slate-400",
      }
    );
  };

  // Fonction pour trouver le prochain créneau disponible
  const getNextAvailableSlot = (availabilityData) => {
    if (!availabilityData?.slots) return null;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const dates = Object.keys(availabilityData.slots).sort();

    for (const date of dates) {
      const slots = availabilityData.slots[date];
      if (!slots || slots.length === 0) continue;

      let availableSlots = slots;
      if (date === today) {
        availableSlots = slots.filter((slot) => {
          const [hours, minutes] = slot.split(":").map(Number);
          const slotTime = hours * 100 + minutes;
          return slotTime > currentTime;
        });
      }

      if (availableSlots.length > 0) {
        const nextSlot = availableSlots[0];
        return {
          date,
          time: nextSlot,
          formatted: formatAvailability(date, nextSlot),
        };
      }
    }
    return null;
  };

  // Fonction pour formater l'affichage de la disponibilité
  const formatAvailability = (date, time) => {
    const now = new Date();
    const slotDate = new Date(date);
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    let dateText = "";
    if (date === today) {
      dateText = "Aujourd'hui";
    } else if (date === tomorrowStr) {
      dateText = "Demain";
    } else {
      const options = { weekday: "short", day: "numeric", month: "short" };
      dateText = slotDate.toLocaleDateString("fr-FR", options);
    }

    return `${dateText} à ${time}`;
  };

  // Calculer le prochain slot disponible
  const nextSlot = getNextAvailableSlot(availabilityData);

  // Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="h-4 w-4 fill-yellow-400 text-yellow-400 inline"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="h-4 w-4 fill-yellow-400/50 text-yellow-400 inline"
          />
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300 inline" />);
      }
    }
    return <span className="flex items-center gap-0.5">{stars}</span>;
  };

  const specialtyInfo = getSpecialtyInfo(doctor?.specialty);

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="card grid place-items-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="w-48 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="card grid place-items-center py-20 text-red-600">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-red-600" />
            </div>
            <p className="font-medium mb-2">
              Erreur lors du chargement du profil
            </p>
            <p className="text-sm text-gray-500">{error?.message}</p>
            <Link to="/search" className="btn-secondary mt-4 inline-block">
              Retour à la recherche
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="card grid place-items-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-medium mb-2">Médecin non trouvé</p>
            <p className="text-sm text-gray-500 mb-4">
              Ce profil n'existe pas ou a été supprimé.
            </p>
            <Link to="/search" className="btn-primary">
              Rechercher un médecin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const d = doctor;
  const SpecialtyIcon = specialtyInfo.icon;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header avec photo et informations principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6"
      >
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Photo de profil avec fallback amélioré */}
          <div className="shrink-0">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden shadow-lg">
                {d.photo ? (
                  <img
                    src={d.photo}
                    alt={`Photo de ${d.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="h-12 w-12 text-slate-400" />
                  </div>
                )}
              </div>
              {/* Badge de spécialité */}
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-slate-200 dark:border-slate-700">
                <SpecialtyIcon className={`h-5 w-5 ${specialtyInfo.color}`} />
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {d.name}
              </h1>
              <div className="flex items-center gap-2 mb-3">
                <SpecialtyIcon className={`h-5 w-5 ${specialtyInfo.color}`} />
                <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  {d.specialty}
                </span>
              </div>

              {/* Rating avec étoiles */}
              <div className="flex items-center gap-2 mb-3">
                {renderStars(d.rating)}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  ({d.rating.toFixed(1)})
                </span>
              </div>
            </div>

            {/* Informations rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Award className="h-4 w-4 text-cyan-600" />
                <span>{d.experience} ans d'expérience</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Languages className="h-4 w-4 text-cyan-600" />
                <span>{d.languages.join(", ")}</span>
              </div>
            </div>

            {/* Prix et disponibilité */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Tarif
                  </div>
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                    {d.fees.toLocaleString()} FCFA
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Prochaine dispo
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {availabilityLoading ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    ) : nextSlot ? (
                      nextSlot.formatted
                    ) : (
                      "Sur RDV"
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <Link
                  to={`/booking/${d.id}`}
                  className={`btn-primary flex items-center gap-2 ${
                    !nextSlot ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleBookingClick}
                >
                  <Calendar className="h-4 w-4" />
                  {nextSlot ? "Prendre RDV" : "Indisponible"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Biographie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader title="À propos" icon={MessageSquare} />
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {d.bio}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact et localisation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader title="Contact & Localisation" icon={MapPin} />
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white mb-1">
                    Adresse
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {d.address}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white mb-1">
                    Téléphone
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {d.phone}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disponibilités */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader title="Disponibilités" icon={CalendarCheck} />
          <CardContent>
            {availabilityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700 last:border-0"
                  >
                    <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : availabilityData?.slots &&
              Object.keys(availabilityData.slots).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(availabilityData.slots)
                  .slice(0, 7)
                  .map(([date, slots]) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString("fr-FR", {
                      weekday: "long",
                    });
                    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <div
                        key={date}
                        className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-cyan-600" />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white capitalize">
                              {dayName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formattedDate}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {slots.length > 0
                            ? `${slots[0]} - ${slots[slots.length - 1]}`
                            : "Fermé"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Aucune disponibilité définie</p>
                <p className="text-sm mt-1">Contactez directement le médecin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Avis patients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader
            title={`Avis patients (${d.reviews.length})`}
            icon={Star}
            action={
              d.reviews.length > 2 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  {showAllReviews ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Réduire
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Voir tout
                    </>
                  )}
                </button>
              )
            }
          />
          <CardContent>
            {d.reviews.length > 0 ? (
              <div className="space-y-4">
                {d.reviews
                  .slice(0, showAllReviews ? d.reviews.length : 2)
                  .map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {review.patient}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-slate-500">
                            ({review.rating})
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Aucun avis pour le moment</p>
                <p className="text-sm mt-1">
                  Soyez le premier à donner votre avis après une consultation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
