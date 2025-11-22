// src/components/DoctorCarousel.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useUIStore } from "../store/uiStore.js";

/**
 * Carrousel horizontal pour docteurs, 3 visibles, flèches sur hover
 * @param {Object} props
 * @param {Array} props.doctors - Liste des docteurs à afficher
 * @param {function} props.renderCard - Fonction pour rendre une card docteur
 * @param {string} props.title - Titre du carrousel
 */
export default function DoctorCarousel({
  doctors = [],
  renderCard,
  title = "Nos médecins",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { sidebarOpen } = useUIStore();
  const cardsPerView = 3;
  const totalSlides = Math.ceil(doctors.length / cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const startIndex = currentIndex * cardsPerView;
  const visibleDoctors = doctors.slice(startIndex, startIndex + cardsPerView);

  if (!doctors || doctors.length === 0) return null;

  return (
    <section className="mb-8">
      {title && (
        <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      )}
      <div className="relative group" style={{ minHeight: 260 }}>
        {/* Flèche gauche */}
        {doctors.length > cardsPerView && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow transition-opacity opacity-0 group-hover:opacity-100 hover:bg-cyan-100 dark:hover:bg-cyan-900/40"
            style={{ pointerEvents: "auto" }}
            onClick={prevSlide}
            aria-label="Précédent"
          >
            <ChevronLeft className="h-6 w-6 text-cyan-600" />
          </button>
        )}
        {/* Carrousel - Affichage de seulement 3 cartes */}
        <div
          className={`flex gap-2 sm:gap-4 justify-center px-2 sm:px-4 ${
            sidebarOpen ? "lg:px-6" : "lg:px-12"
          }`}
        >
          {visibleDoctors.map((doctor, i) => (
            <div
              key={doctor.id || i}
              className={`shrink-0 ${
                sidebarOpen ? "w-64 sm:w-72" : "w-72 sm:w-80"
              }`}
            >
              {renderCard ? renderCard(doctor) : null}
            </div>
          ))}
          {/* Remplir avec des espaces vides si moins de 3 docteurs */}
          {visibleDoctors.length < cardsPerView &&
            Array.from({ length: cardsPerView - visibleDoctors.length }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className={`shrink-0 ${
                    sidebarOpen ? "w-64 sm:w-72" : "w-72 sm:w-80"
                  }`}
                />
              )
            )}
        </div>
        {/* Flèche droite */}
        {doctors.length > cardsPerView && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow transition-opacity opacity-0 group-hover:opacity-100 hover:bg-cyan-100 dark:hover:bg-cyan-900/40"
            style={{ pointerEvents: "auto" }}
            onClick={nextSlide}
            aria-label="Suivant"
          >
            <ChevronRight className="h-6 w-6 text-cyan-600" />
          </button>
        )}
      </div>
    </section>
  );
}
