// src/components/dashboard/CardSection.jsx
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Composant de carte réutilisable pour les sections du dashboard
 *
 * @param {Object} props
 * @param {string} props.title - Titre de la section
 * @param {React.Component} props.icon - Composant d'icône Lucide React
 * @param {React.ReactNode} props.children - Contenu principal de la carte
 * @param {string} props.link - Lien de la section (optionnel) - pour navigation externe
 * @param {string} props.view - Vue interne (optionnel) - pour setActiveView
 * @param {Function} props.onLinkClick - Fonction appelée au clic (reçoit la view)
 * @param {string} props.linkText - Texte du lien (défaut: "Voir plus")
 * @param {boolean} props.isLoading - État de chargement
 * @param {string} props.emptyMessage - Message si pas de données
 * @param {boolean} props.isEmpty - Indique si la section est vide
 * @param {React.ReactNode} props.emptyAction - Action à afficher si vide (bouton CTA)
 * @param {string} props.className - Classes CSS additionnelles
 */
export default function CardSection({
  title,
  icon: IconComponent,
  children,
  link,
  view,
  onLinkClick,
  linkText = "Voir plus",
  isLoading = false,
  emptyMessage,
  isEmpty = false,
  emptyAction,
  className = "",
}) {
  const hasLink = link || view;

  const handleLinkClick = (e) => {
    if (view && onLinkClick) {
      e.preventDefault();
      onLinkClick(view);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {IconComponent && (
            <IconComponent className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          )}
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {title}
          </h3>
        </div>
        {hasLink &&
          !isEmpty &&
          !isLoading &&
          (view && onLinkClick ? (
            <button
              onClick={handleLinkClick}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              {linkText}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <Link
              to={link}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              {linkText}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
      </div>

      {/* Contenu */}
      <div className="min-h-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
            <span className="ml-2 text-sm text-slate-500">Chargement...</span>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              {emptyMessage || "Aucune donnée disponible"}
            </p>
            {emptyAction}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
