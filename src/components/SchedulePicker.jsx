/* eslint-disable no-unused-vars */
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isPast,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export default function SchedulePicker({
  value, // { date: Date, time: "HH:mm" }
  onChange,
  slots = {}, // { 'YYYY-MM-DD': ['09:00','09:30',...] }
  // Support pour les anciennes props d'InlineBooking
  selection,
  onSelect,
  mode,
  onModeChange,
}) {
  // Utiliser les nouvelles props si disponibles, sinon les anciennes
  const currentSelection = value || selection;
  const currentOnChange = onChange || onSelect;
  const currentMode = mode;
  const currentOnModeChange = onModeChange;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    currentSelection?.date || null
  );

  // Calculer les jours du mois avec indicateurs de disponibilité
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Vérifier si un jour a des créneaux disponibles
  const hasSlots = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return slots[dateKey] && slots[dateKey].length > 0;
  };

  // Gérer la sélection d'un jour
  const handleDateSelect = (date) => {
    if (hasSlots(date) && !isPast(date)) {
      setSelectedDate(date);
      // Si onChange est fourni, on peut l'appeler avec la date seulement
      // Les créneaux horaires seront affichés dans la section détaillée
    }
  };

  // Navigation mois
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-4">
      {/* En-tête du calendrier avec navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const hasAvailability = hasSlots(date);
          const isPastDate = isPast(date) && !isToday(date);

          return (
            <motion.button
              key={date.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateSelect(date)}
              disabled={!hasAvailability || isPastDate}
              className={`
                                relative h-12 w-full rounded-lg border text-sm font-medium transition-all
                                ${
                                  !isCurrentMonth
                                    ? "text-slate-300 dark:text-slate-600"
                                    : "text-slate-900 dark:text-slate-100"
                                }
                                ${
                                  isSelected
                                    ? "bg-cyan-500 text-white border-cyan-500"
                                    : hasAvailability && !isPastDate
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/30"
                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                }
                                ${
                                  isPastDate || !hasAvailability
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer hover:shadow-md"
                                }
                            `}
            >
              <span className="relative z-10">{format(date, "d")}</span>

              {/* Indicateur de disponibilité */}
              {hasAvailability && !isPastDate && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
              )}

              {/* Indicateur aujourd'hui */}
              {isToday(date) && (
                <div className="absolute top-1 right-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span>Aujourd'hui</span>
        </div>
      </div>

      {/* Sélection du mode de consultation */}
      {currentMode !== undefined && currentOnModeChange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
        >
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            Mode de consultation
          </h4>
          <div className="flex gap-3">
            <button
              onClick={() => currentOnModeChange("presentiel")}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                currentMode === "presentiel"
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-current flex items-center justify-center">
                  {currentMode === "presentiel" && (
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  )}
                </div>
                <span className="text-sm font-medium">Présentiel</span>
              </div>
            </button>
            <button
              onClick={() => currentOnModeChange("teleconsult")}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                currentMode === "teleconsult"
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-current flex items-center justify-center">
                  {currentMode === "teleconsult" && (
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  )}
                </div>
                <span className="text-sm font-medium">Téléconsultation</span>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Section des créneaux horaires pour le jour sélectionné */}
      {selectedDate && hasSlots(selectedDate) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
        >
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            Créneaux disponibles le {format(selectedDate, "EEEE d MMMM")}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {slots[format(selectedDate, "yyyy-MM-dd")].map((time) => (
              <motion.button
                key={time}
                whileTap={{ scale: 0.95 }}
                onClick={() => currentOnChange?.({ date: selectedDate, time })}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  currentSelection &&
                  isSameDay(currentSelection.date, selectedDate) &&
                  currentSelection.time === time
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
