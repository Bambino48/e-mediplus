import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

// Composant simple pour mini-chart (sparkline)
const MiniChart = ({ data, color = "blue" }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const colorClasses = {
    blue: "stroke-blue-500",
    cyan: "stroke-cyan-500",
    emerald: "stroke-emerald-500",
    amber: "stroke-amber-500",
    rose: "stroke-rose-500",
    purple: "stroke-purple-500",
  };

  return (
    <svg className="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        strokeWidth="2"
        className={`${colorClasses[color]} opacity-60`}
        points={points}
      />
    </svg>
  );
};

export default function AdminCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = "cyan",
  isLoading = false,
  chartData,
  ...rest
}) {
  const colorClasses = {
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "border-cyan-200 dark:border-cyan-800",
      text: "text-cyan-600 dark:text-cyan-400",
      icon: "text-cyan-600",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-600 dark:text-blue-400",
      icon: "text-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-600",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-200 dark:border-rose-800",
      text: "text-rose-600 dark:text-rose-400",
      icon: "text-rose-600",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-600",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-600 dark:text-purple-400",
      icon: "text-purple-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.cyan;

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border ${colors.border} p-6 shadow-sm bg-white dark:bg-slate-900`}
        {...rest}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
              <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </div>
            <div className="flex-1">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-2"></div>
              <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border ${colors.border} p-6 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 cursor-pointer`}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 truncate">
              {title}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {typeof value === "number"
                ? value.toLocaleString("fr-FR")
                : value}
            </div>
            {trend && trendValue !== undefined && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                  trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : trend === "down"
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {trend === "up" && <TrendingUp className="w-3 h-3" />}
                {trend === "down" && <TrendingDown className="w-3 h-3" />}
                {trend === "stable" && <Minus className="w-3 h-3" />}
                <span>{Math.abs(trendValue)}%</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">
                  ce mois
                </span>
              </div>
            )}
          </div>
        </div>
        {chartData && (
          <div className="ml-4">
            <MiniChart data={chartData} color={color} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
