// src/components/PrescriptionCard.jsx
import { Calendar, Download, FileText, Pill, User } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function PrescriptionCard({
  prescription,
  showPatientInfo = false,
  actions = null,
}) {
  const {
    id,
    created_at,
    pdf_url,
    qr_data,
    medications = [],
    doctor_name,
    patient_name,
  } = prescription || {};

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Header avec informations principales */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-cyan-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Ordonnance #{String(id)?.slice(0, 8)}
            </h3>
          </div>

          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Émise le {formatDate(created_at)}</span>
            </div>

            {showPatientInfo && patient_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Patient: {patient_name}</span>
              </div>
            )}

            {doctor_name && !showPatientInfo && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Prescrit par: {doctor_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code et actions */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <QRCodeSVG value={qr_data || id || ""} size={80} />
          </div>

          <div className="flex flex-col gap-2">
            {pdf_url && (
              <a
                href={pdf_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                PDF
              </a>
            )}

            {actions && <div className="flex gap-1">{actions}</div>}
          </div>
        </div>
      </div>

      {/* Médicaments */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="h-4 w-4 text-cyan-500" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Médicaments ({medications.length})
          </span>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
            Aucun médicament prescrit
          </div>
        ) : (
          <div className="grid gap-3">
            {medications.map((medication, index) => (
              <div
                key={medication.id || index}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-1">
                      {medication.name}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Dosage:</span>
                        <span>{medication.dosage}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-medium">Fréquence:</span>
                        <span>{medication.frequency}/jour</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-medium">Durée:</span>
                        <span>{medication.duration_days} jours</span>
                      </div>

                      {medication.intake && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Prise:</span>
                          <span>{medication.intake}</span>
                        </div>
                      )}
                    </div>

                    {medication.instructions && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm text-amber-800 dark:text-amber-200">
                        <strong>Instructions:</strong> {medication.instructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
