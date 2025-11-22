// src/pages/pro/Patients.jsx
import { Calendar, Mail, MapPin, Phone, User, X } from "lucide-react";
import { useState } from "react";
import { useDoctorPatients } from "../../hooks/useDoctorPatients.js";
import ProLayout from "../../layouts/ProLayout.jsx";

export default function Patients() {
  const { data: patients, isLoading, refetch } = useDoctorPatients();

  // État pour la modal de détails du patient
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fonctions pour la modal
  const openPatientModal = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setSelectedPatient(null);
    setShowPatientModal(false);
  };

  return (
    <ProLayout title="Mes patients">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} suivi
            {patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary text-xs"
          disabled={isLoading}
        >
          {isLoading ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      {isLoading ? (
        <div className="card grid place-items-center py-16">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <span>Chargement des patients...</span>
          </div>
        </div>
      ) : patients.length > 0 ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {patient.photo_url ? (
                      <img
                        src={patient.photo_url}
                        alt={`Photo de ${patient.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <User
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                      style={{ display: patient.photo_url ? "none" : "block" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {patient.name}
                    </h3>
                    {patient.phone && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {patient.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {patient.stats?.total_appointments || 0} RDV
                  </span>
                </div>
                {patient.stats?.upcoming_appointments > 0 && (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                    {patient.stats.upcoming_appointments} à venir
                  </span>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => openPatientModal(patient)}
                  className="btn-primary text-xs px-6"
                >
                  Voir dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <User size={48} className="mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Aucun patient
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Vous n'avez pas encore de patients inscrits à vos rendez-vous.
          </p>
          <button className="btn-primary">Voir les disponibilités</button>
        </div>
      )}

      {/* Modal de détails du patient */}
      {showPatientModal &&
        selectedPatient &&
        selectedPatient.medical_profile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Dossier médical - {selectedPatient.first_name || ""}{" "}
                      {selectedPatient.last_name || selectedPatient.name || ""}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {selectedPatient.birth_date ? (
                        <>
                          Né(e) le {formatDate(selectedPatient.birth_date)} •{" "}
                          {selectedPatient.age || "?"} ans
                        </>
                      ) : (
                        "Date de naissance non renseignée"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={closePatientModal}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">
                      Informations personnelles
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {selectedPatient.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {selectedPatient.phone || "Non renseigné"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {selectedPatient.address || "Non renseigné"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profil médical */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">
                      Profil médical
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedPatient.medical_profile?.blood_group && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Groupe sanguin
                          </div>
                          <div className="font-semibold text-red-700 dark:text-red-300">
                            {selectedPatient.medical_profile.blood_group}
                          </div>
                        </div>
                      )}

                      {selectedPatient.medical_profile?.height && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Taille
                          </div>
                          <div className="font-semibold text-blue-700 dark:text-blue-300">
                            {selectedPatient.medical_profile.height} cm
                          </div>
                        </div>
                      )}

                      {selectedPatient.medical_profile?.weight && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Poids
                          </div>
                          <div className="font-semibold text-green-700 dark:text-green-300">
                            {selectedPatient.medical_profile.weight} kg
                          </div>
                        </div>
                      )}

                      {selectedPatient.medical_profile?.emergency_contact && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg col-span-2">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Contact d'urgence
                          </div>
                          <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                            {selectedPatient.medical_profile.emergency_contact}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedPatient.medical_profile?.allergies && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Allergies
                        </div>
                        <div className="font-semibold text-red-700 dark:text-red-300">
                          {selectedPatient.medical_profile.allergies}
                        </div>
                      </div>
                    )}

                    {selectedPatient.medical_profile?.chronic_conditions && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Maladies chroniques
                        </div>
                        <div className="font-semibold text-orange-700 dark:text-orange-300">
                          {selectedPatient.medical_profile.chronic_conditions}
                        </div>
                      </div>
                    )}

                    {selectedPatient.medical_profile?.current_medications && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Médicaments actuels
                        </div>
                        <div className="font-semibold text-purple-700 dark:text-purple-300">
                          {selectedPatient.medical_profile.current_medications}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques des rendez-vous */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Historique des rendez-vous
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedPatient.stats?.total_appointments || 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Rendez-vous total
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {selectedPatient.stats?.upcoming_appointments || 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        À venir
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedPatient.stats?.completed_appointments || 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Terminés
                      </div>
                    </div>
                  </div>

                  {selectedPatient.stats.last_appointment && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        Dernier rendez-vous
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {formatDate(
                          selectedPatient.stats.last_appointment.scheduled_at
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {selectedPatient.stats.last_appointment.status ===
                        "completed"
                          ? "Terminé"
                          : "Programmé"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                  <button
                    onClick={closePatientModal}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Fermer
                  </button>
                  <button className="btn-primary">Nouveau rendez-vous</button>
                  <button className="btn-ghost">Modifier le dossier</button>
                </div>
              </div>
            </div>
          </div>
        )}
    </ProLayout>
  );
}
