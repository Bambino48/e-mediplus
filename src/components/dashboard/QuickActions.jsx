// src/components/dashboard/QuickActions.jsx
import { motion as Motion } from "framer-motion";

/**
 * Composant pour afficher les actions rapides / raccourcis
 *
 * @param {Object} props
 * @param {Array} props.actions - Liste des actions [{title, icon (Component), view, color, description}]
 * @param {Function} props.onActionClick - Fonction appelée au clic (reçoit la view)
 */
export default function QuickActions({ actions = [], onActionClick }) {
  if (!actions || actions.length === 0) return null;

  const handleClick = (view) => {
    if (onActionClick) {
      onActionClick(view);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Actions rapides
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => handleClick(action.view)}
                className="block group w-full text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-xl"
              >
                <div
                  className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${action.color} text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-5 w-5" />
                        <h4 className="font-semibold text-sm">
                          {action.title}
                        </h4>
                      </div>
                      {action.description && (
                        <p className="text-xs text-white/80 line-clamp-2">
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                </div>
              </button>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
}
