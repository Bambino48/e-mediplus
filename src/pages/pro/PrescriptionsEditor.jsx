// src/pages/pro/PrescriptionsEditor.jsx
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  createPrescription,
  getPrescription,
  updatePrescription,
} from "../../api/prescriptions.js";
import { useAppToast } from "../../hooks/useAppToast";
import { useAuth } from "../../hooks/useAuth.js";
import { usePatients } from "../../hooks/usePatients.js";
import ProLayout from "../../layouts/ProLayout.jsx";

export default function PrescriptionsEditor() {
  const navigate = useNavigate();
  const { prescriptionId } = useParams();
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState("");
  const toast = useAppToast();
  const [meds, setMeds] = useState([
    {
      name: "",
      dosage: "",
      intake: "",
      frequency: 1,
      duration_days: 3,
      instructions: "",
    },
  ]);

  const isEditing = !!prescriptionId;

  // Récupérer le docteur connecté et la liste des patients
  const { user: doctor } = useAuth();
  const { data: patients, isLoading: patientsLoading } = usePatients();

  // Récupérer la prescription existante si en mode édition
  const { data: existingPrescription, isLoading: prescriptionLoading } =
    useQuery({
      queryKey: ["prescription", prescriptionId],
      queryFn: () => getPrescription(prescriptionId),
      enabled: isEditing,
    });

  // Pré-remplir les données
  useEffect(() => {
    if (isEditing && existingPrescription) {
      setPatientId(existingPrescription.patient_id || "");
      setMeds(
        (existingPrescription.medications || []).map((med) => ({
          name: med.name || "",
          dosage: med.dosage || "",
          intake: Array.isArray(med.times)
            ? med.times.join(", ")
            : med.intake || "",
          frequency: med.frequency || 1,
          duration_days: med.duration_days || 3,
          instructions: med.instructions || "",
        })) || [
          {
            name: "",
            dosage: "",
            intake: "",
            frequency: 1,
            duration_days: 3,
            instructions: "",
          },
        ]
      );
    } else {
      const patientIdFromUrl = searchParams.get("patientId");
      if (patientIdFromUrl) {
        setPatientId(patientIdFromUrl);
      }
    }
  }, [isEditing, existingPrescription, searchParams]);

  const addMed = () =>
    setMeds((m) => [
      ...m,
      {
        name: "",
        dosage: "",
        intake: "",
        frequency: 1,
        duration_days: 3,
        instructions: "",
      },
    ]);
  const removeMed = (idx) => setMeds((m) => m.filter((_, i) => i !== idx));
  const setField = (idx, key, val) =>
    setMeds((m) => m.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));

  const createMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      toast.success("Ordonnance créée avec succès ✅");
      navigate("/pro/prescriptions");
    },
    onError: (e) => toast.error(e.message || "Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updatePrescription(prescriptionId, data),
    onSuccess: () => {
      toast.success("Ordonnance mise à jour avec succès ✅");
      navigate("/pro/prescriptions");
    },
    onError: (e) => toast.error(e.message || "Erreur lors de la mise à jour"),
  });

  const submit = (e) => {
    e.preventDefault();
    const valid =
      patientId && meds.every((m) => m.name && m.dosage && m.intake);
    if (!valid)
      return toast.error(
        "Veuillez remplir le patient et chaque médicament (nom, dosage, prise)"
      );

    const payload = {
      patient_id: patientId,
      content: meds,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = patientsLoading || (isEditing && prescriptionLoading);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <ProLayout
        title={isEditing ? "Modifier l'ordonnance" : "Créer une ordonnance"}
      >
        <div className="card grid place-items-center py-16">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <span>
              {isEditing ? "Chargement de l'ordonnance..." : "Chargement..."}
            </span>
          </div>
        </div>
      </ProLayout>
    );
  }

  return (
    <ProLayout
      title={isEditing ? "Modifier l'ordonnance" : "Créer une ordonnance"}
    >
      <div className="card">
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-500">Patient</label>
              <select
                className="input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={patientsLoading}
              >
                <option value="">Sélectionner un patient</option>
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-500">Docteur</label>
              <input
                className="input"
                value={doctor?.name || "Docteur non connecté"}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Médicaments</div>
            {meds.map((m, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-3"
              >
                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    className="input"
                    placeholder="Nom (ex: Amoxicilline)"
                    value={m.name}
                    onChange={(e) => setField(idx, "name", e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Dosage (ex: 500 mg)"
                    value={m.dosage}
                    onChange={(e) => setField(idx, "dosage", e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Prise (ex: matin, midi, soir)"
                    value={m.intake}
                    onChange={(e) => setField(idx, "intake", e.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min="1"
                    placeholder="Fréquence/jour"
                    value={m.frequency}
                    onChange={(e) => setField(idx, "frequency", e.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min="1"
                    placeholder="Durée (jours)"
                    value={m.duration_days}
                    onChange={(e) =>
                      setField(idx, "duration_days", e.target.value)
                    }
                  />
                  <input
                    className="input sm:col-span-3"
                    placeholder="Instructions"
                    value={m.instructions}
                    onChange={(e) =>
                      setField(idx, "instructions", e.target.value)
                    }
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => removeMed(idx)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addMed}>
              Ajouter un médicament
            </button>
          </div>

          <div className="pt-2 flex gap-2">
            <button className="btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Mise à jour..."
                  : "Création..."
                : isEditing
                  ? "Mettre à jour l'ordonnance"
                  : "Créer l'ordonnance"}
            </button>
            <button type="button" className="btn-ghost">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </ProLayout>
  );
}
