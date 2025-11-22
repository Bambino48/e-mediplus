/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  Activity,
  Bone,
  Brain,
  Calendar,
  Eye,
  Heart,
  MapPin,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDoctorAvailabilitiesById } from "/src/hooks/useDoctorAvailabilities";
import {
  calculateDistance,
  correctText,
  getNextAvailableSlot,
  getSpecialtyInfo,
  renderStars,
  resolvePhotoUrl,
} from "/src/utils/doctorCardUtils.jsx";

const DoctorCard = ({ doctor, user, userLocation, onBooking }) => {
  const navigate = useNavigate();

  // Extraction des données du médecin avec fallbacks
  const doctorName = doctor?.name || doctor?.profile?.name || "Médecin";
  const specialty =
    doctor?.profile?.specialty ||
    doctor?.specialty ||
    doctor?.profile?.primary_specialty ||
    "Médecine générale";
  const rating = doctor?.profile?.rating || doctor?.rating || 0;
  const fee = doctor?.profile?.fees || doctor?.fees || null;
  const city = doctor?.location?.city || doctor?.city || "";
  const bio = doctor?.profile?.bio || doctor?.bio || "";
  const doctorLat = doctor?.location?.latitude || doctor?.lat;
  const doctorLng = doctor?.location?.longitude || doctor?.lng;

  // Hook pour récupérer les disponibilités du médecin
  const {
    data: availabilityData,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useDoctorAvailabilitiesById(doctor.id);

  // Résoudre l'URL de la photo
  const photoUrl = resolvePhotoUrl(doctor?.photo || doctor?.profile?.photo);

  // Calculs dérivés
  const shortBio = bio.length > 80 ? bio.substring(0, 80) + "..." : bio;
  const hasRating = rating > 0;

  // Calcul de la distance
  const distance =
    userLocation && doctorLat && doctorLng
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          doctorLat,
          doctorLng
        )
      : null;

  const distanceText = distance
    ? `${distance < 1 ? "< 1 km" : `${distance.toFixed(1)} km`}`
    : "";

  // Informations de spécialité avec corrections
  const correctedSpecialty = correctText(specialty);
  const specialtyInfo = getSpecialtyInfo(correctedSpecialty);

  // Appliquer les corrections au bio
  const correctedBio = correctText(bio);

  // Prochain créneau disponible
  const nextSlot = getNextAvailableSlot(availabilityData);

  // Gestionnaires d'événements
  const handleProfileClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate(`/login?redirect=/doctor/${doctor.id}`);
      return;
    }
  };

  const handleBookingClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate(`/login?redirect=/booking/${doctor.id}`);
      return;
    }
    if (!nextSlot) {
      e.preventDefault();
      return;
    }
    // Si onBooking est fourni, l'utiliser au lieu de naviguer
    if (onBooking) {
      e.preventDefault();
      onBooking(doctor);
      return;
    }
  };

  // Mapping des icônes par nom de chaîne
  const iconMap = {
    Stethoscope,
    Heart,
    Eye,
    User,
    Bone,
    Brain,
    Activity,
  };

  const SpecialtyIcon = iconMap[specialtyInfo.icon] || Stethoscope;

  return (
    <motion.div
      className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer w-full max-w-sm mx-auto sm:max-w-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
      whileHover={{ y: -4 }}
    >
      {/* Photo de profil */}
      <div className="aspect-square bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden relative shadow-sm group">
        {/* État de chargement */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 animate-pulse">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-2 animate-pulse"></div>
            <div className="w-16 h-3 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Image principale */}
        <img
          src={photoUrl}
          alt={`Photo de profil de ${doctorName}`}
          className="w-full h-full object-cover object-center transition-all duration-300 ease-out group-hover:scale-105 opacity-0 animate-in fade-in-0"
          loading="lazy"
          decoding="async"
          fetchPriority="high"
          onLoad={(e) => {
            e.target.classList.remove("opacity-0");
            e.target.classList.add("opacity-100");
            const loader =
              e.target.parentElement.querySelector(".animate-pulse");
            if (loader) loader.style.display = "none";
          }}
          onError={(e) => {
            e.target.style.display = "none";
            const loader =
              e.target.parentElement.querySelector(".animate-pulse");
            if (loader) loader.style.display = "none";
            const fallback =
              e.target.parentElement.querySelector(".photo-fallback");
            if (fallback) {
              fallback.style.display = "flex";
              fallback.classList.add("animate-in", "fade-in-0", "duration-300");
            }
          }}
        />

        {/* Fallback avec icône spécialisée */}
        <div
          className="photo-fallback absolute inset-0 flex items-center justify-center bg-linear-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 transition-all duration-300"
          style={{ display: "none" }}
        >
          <div className="text-center transform transition-transform duration-200 hover:scale-110">
            <div className="w-16 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg border border-white/20 dark:border-slate-700/20">
              <SpecialtyIcon className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {correctedSpecialty}
            </div>
          </div>
        </div>

        {/* Rating en overlay */}
        {hasRating && (
          <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 shadow-lg border border-white/20 dark:border-slate-700/20">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-slate-700 dark:text-slate-200">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 rounded-xl pointer-events-none"></div>
      </div>

      {/* Informations */}
      <div className="mt-3 space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100">
        <div className="font-medium text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
          {doctorName}
        </div>
        <div
          className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 group-hover:scale-105 ${specialtyInfo.color}`}
        >
          <SpecialtyIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{correctedSpecialty}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-200">
          {city ? (
            <div className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200">
              <MapPin className="h-3 w-3" />
              <span>{city}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3" />
              <span>Localisation non précisée</span>
            </div>
          )}
          {distanceText && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {distanceText}
              </span>
            </>
          )}
        </div>

        {/* Rating avec étoiles */}
        {hasRating && (
          <div className="flex items-center gap-1 mt-2 animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-300">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {renderStars(rating)}
            </span>
            <span className="text-xs text-slate-500">
              ({rating.toFixed(1)})
            </span>
          </div>
        )}

        {/* Biographie courte */}
        {shortBio && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-400 leading-relaxed">
            {correctedBio.length > 80
              ? correctedBio.substring(0, 80) + "..."
              : correctedBio}
          </p>
        )}

        {/* Prix et disponibilité */}
        <div className="text-sm text-slate-500 mt-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-500">
          {fee ? (
            <span className="font-medium text-green-600 dark:text-green-400 transition-colors duration-200 hover:scale-105 inline-block">
              {fee.toLocaleString()} FCFA
            </span>
          ) : (
            <span className="text-slate-400 italic">Prix sur demande</span>
          )}
          <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
          {availabilityLoading ? (
            <span className="text-slate-400 animate-pulse inline-flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </span>
          ) : availabilityError ? (
            <span className="text-slate-400 italic">Sur RDV</span>
          ) : nextSlot ? (
            <span className="font-medium text-green-600 dark:text-green-400 transition-colors duration-200 hover:scale-105 inline-block">
              {nextSlot.formatted}
            </span>
          ) : (
            <span className="text-slate-400 italic">Sur RDV</span>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="mt-4 flex gap-2 sm:gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-600">
        <Link
          className="btn-secondary flex-1 text-sm sm:text-base py-2 px-3 sm:px-4 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-700 group"
          to={`/doctor/${doctor.id}`}
          onClick={handleProfileClick}
          title="Voir le profil complet du médecin"
          aria-label={`Voir les détails de ${doctorName}`}
        >
          <Eye className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
          Voir profil
        </Link>
        {onBooking ? (
          <button
            className={`flex-1 text-sm sm:text-base py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 group ${
              nextSlot
                ? "btn-primary hover:bg-cyan-600 dark:hover:bg-cyan-500"
                : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            }`}
            onClick={handleBookingClick}
            disabled={!nextSlot}
            title={
              nextSlot
                ? `Réserver un rendez-vous - Prochain créneau: ${nextSlot.formatted}`
                : "Aucun créneau disponible actuellement"
            }
            aria-label={
              nextSlot
                ? `Réserver un rendez-vous avec ${doctorName} - Disponible ${nextSlot.formatted}`
                : `Aucun créneau disponible pour ${doctorName}`
            }
          >
            <Calendar className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
            {nextSlot ? "Réserver RDV" : "Indisponible"}
          </button>
        ) : (
          <Link
            className={`flex-1 text-sm sm:text-base py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 group ${
              nextSlot
                ? "btn-primary hover:bg-cyan-600 dark:hover:bg-cyan-500"
                : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            }`}
            to={nextSlot ? `/booking/${doctor.id}` : "#"}
            onClick={handleBookingClick}
            title={
              nextSlot
                ? `Réserver un rendez-vous - Prochain créneau: ${nextSlot.formatted}`
                : "Aucun créneau disponible actuellement"
            }
            aria-label={
              nextSlot
                ? `Réserver un rendez-vous avec ${doctorName} - Disponible ${nextSlot.formatted}`
                : `Aucun créneau disponible pour ${doctorName}`
            }
          >
            <Calendar className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
            {nextSlot ? "Réserver RDV" : "Indisponible"}
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorCard;
