// src/components/dashboard/InfoRow.jsx

/**
 * Composant pour afficher une ligne d'information label: valeur
 *
 * @param {Object} props
 * @param {string} props.label - Libellé de l'information
 * @param {string|React.ReactNode} props.value - Valeur à afficher
 * @param {React.ReactNode} props.icon - Icône optionnelle
 * @param {string} props.valueClassName - Classes CSS pour la valeur
 */
export default function InfoRow({
  label,
  value,
  icon,
  valueClassName = "text-slate-800 dark:text-slate-100",
}) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={`text-sm font-medium ${valueClassName}`}>{value}</div>
    </div>
  );
}
