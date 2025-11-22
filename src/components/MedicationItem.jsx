// src/components/MedicationItem.jsx
export default function MedicationItem({ med, onTake, disabled = false }) {
  const totalTaken = med.adherence?.length || 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-3">
      <div>
        <div className="font-medium">{med.name}</div>
        <div className="text-sm text-slate-500">
          {med.dosage} • {med.frequency}/j • {med.duration_days} j
        </div>
        {med.instructions && (
          <div className="text-sm mt-1">{med.instructions}</div>
        )}
        <div className="mt-1 text-xs text-slate-500">
          Prises enregistrées : {totalTaken}
        </div>
      </div>

      <button
        className="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onTake?.(med.id)}
        disabled={disabled}
      >
        Marquer comme pris
      </button>
    </div>
  );
}
