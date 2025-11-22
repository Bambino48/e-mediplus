// src/pages/patient/Prescriptions.jsx
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  Pill,
  RefreshCw,
  Search,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPatientPrescriptions
} from "../../api/prescriptions.js";
import PrescriptionCard from "../../components/PrescriptionCard.jsx";
import { useAppToast } from "../../hooks/useAppToast";
import { usePrescriptionsStore } from "../../store/prescriptionsStore.js";

function getPrescriptionStatus(prescription) {
  if (!prescription?.created_at) return "unknown";
  const createdDate = new Date(prescription.created_at);
  const now = new Date();
  const daysSinceCreated = Math.floor(
    (now - createdDate) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated > 30) return "expired";
  const allCompleted = prescription.medications?.every((med) => {
    const durationDays = med.duration_days || 30;
    return daysSinceCreated >= durationDays;
  });
  if (allCompleted) return "completed";
  return "active";
}

function getStatusBadge(status) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      };
    case "expired":
      return {
        label: "Expirée",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    case "completed":
      return {
        label: "Terminée",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      };
    default:
      return {
        label: "Inconnue",
        icon: <Clock className="h-3.5 w-3.5" />,
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      };
  }
}

export default function PatientPrescriptions() {
  const navigate = useNavigate();
  const toast = useAppToast();
  const setItems = usePrescriptionsStore((s) => s.setItems);
  const items = usePrescriptionsStore((s) => s.items);
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: getPatientPrescriptions,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data?.items) setItems(data.items);
  }, [data, setItems]);

  const prescriptionsWithStatus = useMemo(() => {
    return items.map((p) => ({
      ...p,
      status: getPrescriptionStatus(p),
    }));
  }, [items]);

  const filteredByTab = useMemo(() => {
    if (activeTab === "active") {
      return prescriptionsWithStatus.filter((p) => p.status === "active");
    }
    return prescriptionsWithStatus.filter(
      (p) => p.status === "expired" || p.status === "completed"
    );
  }, [prescriptionsWithStatus, activeTab]);

  const filteredPrescriptions = useMemo(() => {
    let result = [...filteredByTab];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.medications?.some((m) => m.name?.toLowerCase().includes(query))
      );
    }
    if (filterDoctor !== "all") {
      result = result.filter((p) => String(p.doctor_id) === filterDoctor);
    }
    return result;
  }, [filteredByTab, searchQuery, filterDoctor]);

  const doctors = useMemo(() => {
    const doctorSet = new Map();
    prescriptionsWithStatus.forEach((p) => {
      if (p.doctor_id && !doctorSet.has(p.doctor_id)) {
        doctorSet.set(p.doctor_id, {
          id: p.doctor_id,
          name: p.doctor_name || `Dr ${p.doctor_id}`,
        });
      }
    });
    return Array.from(doctorSet.values());
  }, [prescriptionsWithStatus]);

  const handleDownloadPDF = (prescriptionId) => {
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL
      }/patient/prescriptions/${prescriptionId}/download`;
    window.open(downloadUrl, "_blank");
    toast.success("Téléchargement du PDF...");
  };

  const handleRenewPrescription = () => {
    toast(
      "Pour renouveler cette ordonnance, consultez un médecin en téléconsultation",
      { icon: "💊", duration: 4000 }
    );
    setTimeout(() => navigate("/teleconsult"), 1500);
  };

  const handleSharePrescription = async (prescription) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ordonnance médicale",
          text: `Ordonnance du ${new Date(
            prescription.created_at
          ).toLocaleDateString("fr-FR")}`,
          url: window.location.href,
        });
        toast.success("Ordonnance partagée ✅");
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Erreur lors du partage");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="card bg-white dark:bg-slate-900 p-12 text-center">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Chargement de vos ordonnances...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-8">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>Erreur lors du chargement des ordonnances</span>
          </div>
        </div>
      </main>
    );
  }

  const activeCount = prescriptionsWithStatus.filter(
    (p) => p.status === "active"
  ).length;
  const historyCount = prescriptionsWithStatus.filter(
    (p) => p.status === "expired" || p.status === "completed"
  ).length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-500" />
          Mes ordonnances
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consultez vos prescriptions médicales et suivez vos traitements
        </p>
      </div>

      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === "active"
            ? "text-cyan-600 dark:text-cyan-400"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          <span className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Ordonnances actives
            <span className="ml-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-semibold">
              {activeCount}
            </span>
          </span>
          {activeTab === "active" && (
            <Motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === "history"
            ? "text-cyan-600 dark:text-cyan-400"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historique
            <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold">
              {historyCount}
            </span>
          </span>
          {activeTab === "history" && (
            <Motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
            />
          )}
        </button>
      </div>

      <div className="mb-6 grid md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un médicament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tous les médecins</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredPrescriptions.length === 0 ? (
          <Motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-white dark:bg-slate-900 p-12 text-center"
          >
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              {activeTab === "active"
                ? "Aucune ordonnance active pour le moment"
                : "Aucune ordonnance dans l'historique"}
            </p>
            {activeTab === "active" && (
              <button
                onClick={() => navigate("/teleconsult")}
                className="btn-primary mt-4"
              >
                Consulter un médecin
              </button>
            )}
          </Motion.div>
        ) : (
          <Motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {filteredPrescriptions.map((prescription, index) => {
              const statusBadge = getStatusBadge(prescription.status);
              return (
                <Motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card bg-white dark:bg-slate-900 p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                          Ordonnance #{String(prescription.id)?.slice(0, 8)}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}
                        >
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(prescription.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                        {prescription.doctor_name && (
                          <div className="text-slate-500">
                            Prescrit par {prescription.doctor_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPDF(prescription.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      {prescription.status === "active" && (
                        <button
                          onClick={() => handleRenewPrescription()}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Renouveler"
                        >
                          <RefreshCw className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleSharePrescription(prescription)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Partager"
                      >
                        <Share2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <PrescriptionCard prescription={prescription} />
                </Motion.div>
              );
            })}
          </Motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

