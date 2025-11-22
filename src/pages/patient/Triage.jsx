/* eslint-disable no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Send,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTriageSession,
  formatTriageDate,
  getTriageSessions,
  getUrgencyBadgeClasses,
  parseUrgencyLevel,
} from "../../api/triage";

export default function Triage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [symptoms, setSymptoms] = useState("");
  const [activeTab, setActiveTab] = useState("new"); // "new" | "history"
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // Récupération de l'historique des sessions
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["triage-sessions"],
    queryFn: getTriageSessions,
    refetchOnMount: true,
  });

  // Mutation pour créer une nouvelle session
  const createMutation = useMutation({
    mutationFn: createTriageSession,
    onSuccess: (data) => {
      setCurrentAnalysis(data);
      setSymptoms("");
      queryClient.invalidateQueries({ queryKey: ["triage-sessions"] });
    },
    onError: (error) => {
      console.error("Erreur triage:", error);
      alert("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    },
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert("Veuillez décrire vos symptômes avant de lancer l'analyse.");
      return;
    }
    createMutation.mutate(symptoms);
  };

  const handleNavigateToBooking = () => {
    navigate("/patient/booking");
  };

  const handleNavigateToTeleconsult = () => {
    navigate("/patient/teleconsult");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Triage IA
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assistant médical intelligent pour analyser vos symptômes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("new")}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "new"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Activity className="inline w-4 h-4 mr-2" />
          Nouvelle Analyse
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "history"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Clock className="inline w-4 h-4 mr-2" />
          Historique ({sessions.length})
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "new" ? (
          <motion.div
            key="new-analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Formulaire de saisie */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Décrivez vos symptômes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Soyez le plus précis possible : quand ont-ils commencé, leur
                    intensité, leur évolution...
                  </p>
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Ex : J'ai de la fièvre (38.5°C) et je tousse depuis 3 jours. Je ressens aussi de la fatigue."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows="5"
                  disabled={createMutation.isPending}
                />

                <button
                  type="submit"
                  disabled={createMutation.isPending || !symptoms.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Analyser les symptômes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Résultat de l'analyse */}
            {currentAnalysis && (
              <AnalysisResult
                analysis={currentAnalysis}
                onBooking={handleNavigateToBooking}
                onTeleconsult={handleNavigateToTeleconsult}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune analyse disponible
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Commencez par décrire vos symptômes pour obtenir une analyse
                  IA.
                </p>
                <button
                  onClick={() => setActiveTab("new")}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Nouvelle analyse
                </button>
              </div>
            ) : (
              sessions.map((session) => (
                <HistoryCard key={session.id} session={session} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Composant pour afficher le résultat de l'analyse
function AnalysisResult({ analysis, onBooking, onTeleconsult }) {
  const result =
    typeof analysis.result === "string"
      ? JSON.parse(analysis.result)
      : analysis.result;
  const urgency = result.urgency || "basse";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-linear-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700 p-6 space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Résultat de l'analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyse effectuée le {formatTriageDate(analysis.created_at)}
            </p>
          </div>
        </div>
        <span className={getUrgencyBadgeClasses(urgency)}>
          {urgency === "haute"
            ? "🔴 Urgent"
            : urgency === "modérée"
            ? "🟠 Modéré"
            : "🟢 Faible"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Diagnostic
          </p>
          <p className="text-gray-900 dark:text-white font-medium">
            {result.triage}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Recommandation
          </p>
          <p className="text-gray-900 dark:text-white">
            {result.recommendation}
          </p>
        </div>
      </div>

      {/* Actions contextuelles */}
      <div className="pt-4 border-t border-purple-200 dark:border-purple-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Actions recommandées :
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onTeleconsult}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Video className="w-4 h-4" />
            Téléconsultation immédiate
          </button>
          <button
            onClick={onBooking}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Calendar className="w-4 h-4" />
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Composant pour afficher une session dans l'historique
function HistoryCard({ session }) {
  const result =
    typeof session.result === "string"
      ? JSON.parse(session.result)
      : session.result;
  const urgency = parseUrgencyLevel(session.result);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTriageDate(session.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
            <span className="font-medium">Symptômes :</span> {session.symptoms}
          </p>
        </div>
        <span className={getUrgencyBadgeClasses(urgency)}>
          {urgency === "haute"
            ? "Urgent"
            : urgency === "modérée"
            ? "Modéré"
            : "Faible"}
        </span>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {result.triage}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {result.recommendation}
        </p>
      </div>
    </motion.div>
  );
}
