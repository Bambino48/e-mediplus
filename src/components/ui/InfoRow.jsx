// Composant InfoRow réutilisable
export default function InfoRow({ label, value, icon: Icon, className = "" }) {
  return (
    <div className={`flex items-center gap-3 py-1 ${className}`}>
      {Icon && <Icon className="h-5 w-5 text-cyan-500" />}
      <span className="font-medium text-gray-700 dark:text-gray-200 min-w-[120px]">
        {label}
      </span>
      <span className="text-gray-600 dark:text-gray-300">{value}</span>
    </div>
  );
}
