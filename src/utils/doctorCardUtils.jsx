// Utilitaires pour le composant DoctorCard

// Mapping des spécialités médicales avec icônes et couleurs
export const getSpecialtyInfo = (specialty) => {
  const specialtyMap = {
    // Médecine générale et variantes
    "Médecine générale": {
      icon: "Stethoscope",
      color: "text-blue-600 dark:text-blue-400",
    },
    "Médecin general": {
      icon: "Stethoscope",
      color: "text-blue-600 dark:text-blue-400",
    },
    "Médecine general": {
      icon: "Stethoscope",
      color: "text-blue-600 dark:text-blue-400",
    },
    "Médecine Generale": {
      icon: "Stethoscope",
      color: "text-blue-600 dark:text-blue-400",
    },

    // Cardiologie
    Cardiologie: { icon: "Heart", color: "text-red-600 dark:text-red-400" },
    Cardiologue: { icon: "Heart", color: "text-red-600 dark:text-red-400" },

    // Dermatologie
    Dermatologie: {
      icon: "Stethoscope",
      color: "text-purple-600 dark:text-purple-400",
    },
    Dermatologue: {
      icon: "Stethoscope",
      color: "text-purple-600 dark:text-purple-400",
    },

    // Ophtalmologie
    Ophtalmologie: {
      icon: "Eye",
      color: "text-green-600 dark:text-green-400",
    },
    Ophtalmologue: {
      icon: "Eye",
      color: "text-green-600 dark:text-green-400",
    },

    // Pédiatrie
    Pédiatrie: { icon: "User", color: "text-pink-600 dark:text-pink-400" },
    Pédiatre: { icon: "User", color: "text-pink-600 dark:text-pink-400" },

    // Gynécologie
    Gynécologie: { icon: "User", color: "text-rose-600 dark:text-rose-400" },
    Gynécologue: { icon: "User", color: "text-rose-600 dark:text-rose-400" },

    // Orthopédie
    Orthopédie: { icon: "Bone", color: "text-orange-600 dark:text-orange-400" },
    Orthopédiste: {
      icon: "Bone",
      color: "text-orange-600 dark:text-orange-400",
    },

    // Neurologie
    Neurologie: {
      icon: "Brain",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    Neurologue: {
      icon: "Brain",
      color: "text-indigo-600 dark:text-indigo-400",
    },

    // Psychiatrie
    Psychiatrie: {
      icon: "Brain",
      color: "text-violet-600 dark:text-violet-400",
    },
    Psychiatre: {
      icon: "Brain",
      color: "text-violet-600 dark:text-violet-400",
    },

    // Dentisterie
    Dentisterie: {
      icon: "Activity",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    Dentiste: { icon: "Activity", color: "text-cyan-600 dark:text-cyan-400" },
  };

  return (
    specialtyMap[specialty] || {
      icon: "Stethoscope",
      color: "text-slate-600 dark:text-slate-400",
    }
  );
};

// Fonction pour corriger les fautes courantes dans les textes
export const correctText = (text) => {
  if (!text) return text;
  return text
    .replace(/pluseurs/g, "plusieurs")
    .replace(/expericences/g, "expériences")
    .replace(/experiance/g, "expérience")
    .replace(/disponible/g, "disponible")
    .replace(/professionel/g, "professionnel")
    .replace(/professionelle/g, "professionnelle")
    .replace(/specialiste/g, "spécialiste")
    .replace(/general/g, "général")
    .replace(/generale/g, "générale");
};

// Calcul de la distance entre deux points géographiques
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;

  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Résolution de l'URL de la photo
export const resolvePhotoUrl = (photoSource) => {
  const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  if (!photoSource) return DEFAULT_AVATAR;
  if (typeof photoSource !== "string") return DEFAULT_AVATAR;
  if (photoSource.startsWith("http")) return photoSource;
  if (photoSource.startsWith("data:image")) return photoSource;

  // Si c'est un chemin relatif renvoyé par l'API (ex: "avatars/.."), construire l'URL complète
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${API_URL}/storage/${photoSource}`;
};

// Fonction pour trouver le prochain créneau disponible
export const getNextAvailableSlot = (availabilityData) => {
  if (!availabilityData?.slots) return null;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Format HHMM

  const dates = Object.keys(availabilityData.slots).sort();

  for (const date of dates) {
    const slots = availabilityData.slots[date];
    if (!slots || slots.length === 0) continue;

    // Si c'est aujourd'hui, filtrer les slots passés
    let availableSlots = slots;
    if (date === today) {
      availableSlots = slots.filter((slot) => {
        const [hours, minutes] = slot.split(":").map(Number);
        const slotTime = hours * 100 + minutes;
        return slotTime > currentTime;
      });
    }

    if (availableSlots.length > 0) {
      const nextSlotTime = availableSlots[0];
      return {
        date,
        time: nextSlotTime,
        formatted: `${nextSlotTime}`,
      };
    }
  }

  return null;
};

// Fonction pour afficher les étoiles
export const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 fill-yellow-400 text-yellow-400 inline"
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 fill-yellow-400/50 text-yellow-400 inline"
        />
      );
    } else {
      stars.push(<Star key={i} className="h-3 w-3 text-gray-300 inline" />);
    }
  }
  return <span className="flex items-center gap-0.5">{stars}</span>;
};
