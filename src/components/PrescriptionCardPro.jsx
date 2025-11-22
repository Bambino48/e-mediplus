// src/components/PrescriptionCardPro.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { deletePrescription } from "../api/prescriptions.js";
import { useAppToast } from "../hooks/useAppToast";
import PrescriptionCard from "./PrescriptionCard.jsx";

export default function PrescriptionCardPro({ prescription, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const toast = useAppToast();

  const deleteMutation = useMutation({
    mutationFn: deletePrescription,
    onSuccess: () => {
      toast.success("Ordonnance supprimée avec succès ✅");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleDelete = () => {
    if (prescription.id) {
      deleteMutation.mutate(prescription.id);
    }
  };

  const actions = (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>

      {showActions && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowActions(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-[140px]">
            <button
              onClick={() => {
                setShowActions(false);
                onEdit(prescription);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={() => {
                setShowActions(false);
                setShowDeleteConfirm(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-left"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <PrescriptionCard
        prescription={prescription}
        showPatientInfo={true}
        actions={actions}
      />

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confirmer la suppression
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Êtes-vous sûr de vouloir supprimer cette ordonnance ? Cette
                  action est irréversible.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
                disabled={deleteMutation.isPending}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 inline-block" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


