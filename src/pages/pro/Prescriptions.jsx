// src/pages/pro/Prescriptions.jsx
import { FileText, Plus, RefreshCw, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrescriptionCardPro from "../../components/PrescriptionCardPro.jsx";
import { usePatients } from "../../hooks/usePatients.js";
import { usePrescriptions } from "../../hooks/usePrescriptions.js";
import ProLayout from "../../layouts/ProLayout.jsx";

export default function Prescriptions() {
  const { data: prescriptions, isLoading, error, refetch } = usePrescriptions();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const [showPatientModal, setShowPatientModal] = useState(false);
  const navigate = useNavigate();

  const handleCreatePrescription = (patientId = null) => {
    if (patientId) {
      // Naviguer vers l'éditeur avec le patient pré-sélectionné
      navigate(`/pro/prescriptions/editor?patientId=${patientId}`);
    } else {
      // Ouvrir la modal de sélection de patient
      setShowPatientModal(true);
    }
  };

  const handlePatientSelect = (patient) => {
    setShowPatientModal(false);
    navigate(`/pro/prescriptions/editor?patientId=${patient.id}`);
  };

  const handleEditPrescription = (prescription) => {
    navigate(`/pro/prescriptions/editor/${prescription.id}`);
  };

  return (
    <ProLayout title="Mes prescriptions">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {prescriptions.length} prescription
            {prescriptions.length !== 1 ? "s" : ""} émise
            {prescriptions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="btn-secondary text-xs"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin mr-2" />
                Actualisation...
              </>
            ) : (
              <>
                <RefreshCw size={14} className="mr-2" />
                Actualiser
              </>
            )}
          </button>
          <button
            onClick={() => handleCreatePrescription()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvelle ordonnance
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card grid place-items-center py-16">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <span>Chargement des prescriptions...</span>
          </div>
        </div>
      ) : error ? (
        <div className="card text-center py-16">
          <div className="text-red-500 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Erreur de chargement
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Impossible de charger les prescriptions. Veuillez réessayer.
          </p>
          <button onClick={() => refetch()} className="btn-primary">
            Réessayer
          </button>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Aucune prescription
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Vous n'avez pas encore émis de prescriptions.
          </p>
          <button
            className="btn-primary"
            onClick={() => handleCreatePrescription()}
          >
            Créer une prescription
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCardPro
              key={prescription.id}
              prescription={prescription}
              onEdit={handleEditPrescription}
            />
          ))}
        </div>
      )}

      {/* Modal de sélection de patient */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sélectionner un patient
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {patientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 rounded-full border-2 border-cyan-500 border-t-transparent mr-2"></div>
                  <span>Chargement des patients...</span>
                </div>
              ) : patients && patients.length > 0 ? (
                <div className="space-y-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      <div className="shrink-0">
                        <User size={20} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {patient.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {patient.totalAppointments} rendez-vous
                          {patient.upcomingAppointments > 0 && (
                            <span className="ml-2 text-cyan-600 dark:text-cyan-400">
                              • {patient.upcomingAppointments} à venir
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Aucun patient trouvé
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Vous devez avoir des rendez-vous planifiés pour voir vos
                    patients ici
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowPatientModal(false)}
                className="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowPatientModal(false);
                  navigate("/pro/prescriptions/editor");
                }}
                className="flex-1 btn-primary"
              >
                Créer sans patient
              </button>
            </div>
          </div>
        </div>
      )}
    </ProLayout>
  );
}
