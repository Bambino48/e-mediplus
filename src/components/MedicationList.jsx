// src/components/MedicationList.jsx
import { Pill } from "lucide-react";
import MedicationItem from "./MedicationItem.jsx";

/**
 * Composant réutilisable pour afficher une liste de médicaments
 *
 * @param {Object} props
 * @param {Array} props.medications - Liste des médicaments à afficher
 * @param {Function} props.onTakeMedication - Callback appelé quand un médicament est marqué comme pris
 * @param {boolean} props.disabled - Si true, désactive les actions sur les médicaments
 * @param {boolean} props.showHeader - Si true, affiche l'en-tête avec le titre et le compteur
 * @param {string} props.headerTitle - Titre personnalisé de l'en-tête (défaut: "Médicaments prescrits")
 * @param {string} props.gridCols - Classes Tailwind pour la grille (défaut: "sm:grid-cols-2")
 * @param {string} props.emptyMessage - Message affiché quand la liste est vide
 */
export default function MedicationList({
  medications = [],
  onTakeMedication,
  disabled = false,
  showHeader = true,
  headerTitle = "Médicaments prescrits",
  gridCols = "sm:grid-cols-2",
  emptyMessage = "Aucun médicament prescrit",
}) {
  // Si pas de médicaments et pas d'affichage du header, ne rien afficher
  if (!medications || medications.length === 0) {
    if (!showHeader) return null;

    return (
      <div className="space-y-3">
        {showHeader && (
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Pill className="h-4 w-4" />
            {headerTitle} (0)
          </h4>
        )}
        <div className="text-sm text-slate-500 dark:text-slate-400 italic">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Pill className="h-4 w-4" />
          {headerTitle} ({medications.length})
        </h4>
      )}

      <div className={`grid ${gridCols} gap-3`}>
        {medications.map((med) => (
          <MedicationItem
            key={med.id}
            med={med}
            onTake={onTakeMedication}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
