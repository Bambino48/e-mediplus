// Composant Button réutilisable
export default function Button({
  children,
  icon: Icon,
  variant = "primary", // primary, secondary, danger, success
  className = "",
  ...props
}) {
  const base =
    "px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-400";
  const variants = {
    primary:
      "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-200/20 hover:shadow-cyan-300/20",
    secondary:
      "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </button>
  );
}
