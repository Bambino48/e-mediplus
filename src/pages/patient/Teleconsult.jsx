import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
 
import {
  AlertCircle,
  Calendar,
  Clock,
  History as HistoryIcon,
  PlayCircle,
  Plus,
  Video,
} from "lucide-react";
import { useState } from "react";
import {
  createTeleconsultRoom,
  getActiveTeleconsults,
  getTeleconsultHistory,
  getTeleconsultToken,
} from "../../api/teleconsultations.js";
import VideoRoom from "../../components/VideoRoom.jsx";
import { useAppToast } from "../../hooks/useAppToast";

export default function Teleconsult() {
  const [activeTab, setActiveTab] = useState("active"); // "active" | "history"
  const [selectedRoom, setSelectedRoom] = useState(null);
  const queryClient = useQueryClient();
  const toast = useAppToast();

  // ✅ Récupération des téléconsultations actives
  const { data: activeSessions = [], isLoading: loadingActive } = useQuery({
    queryKey: ["active-teleconsults"],
    queryFn: getActiveTeleconsults,
  });

  // ✅ Récupération de l'historique
  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["teleconsult-history"],
    queryFn: getTeleconsultHistory,
    enabled: activeTab === "history",
  });

  // ✅ Mutation pour créer une nouvelle téléconsultation
  const createRoomMutation = useMutation({
    mutationFn: createTeleconsultRoom,
    onSuccess: (data) => {
      toast.success("Salle de téléconsultation créée ✅");
      queryClient.invalidateQueries(["active-teleconsults"]);
      // Rejoindre automatiquement la salle
      joinRoom(data.room_id);
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de créer la salle");
    },
  });

  // ✅ Rejoindre une salle
  const joinRoom = async (roomId) => {
    try {
      const tokenData = await getTeleconsultToken(roomId);
      setSelectedRoom({ ...tokenData, room_id: roomId });
    } catch {
      toast.error("Impossible de rejoindre la salle");
    }
  };

  const isLoading = loadingActive || loadingHistory;

  if (selectedRoom) {
    return (
      <div className="h-screen bg-slate-950">
        <VideoRoom
          roomId={selectedRoom.room_id}
          token={selectedRoom.token}
          appId={selectedRoom.appId}
          channel={selectedRoom.channel}
          uid={selectedRoom.uid}
          onLeave={() => {
            setSelectedRoom(null);
            queryClient.invalidateQueries(["active-teleconsults"]);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Téléconsultation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Consultez un médecin en ligne depuis chez vous
          </p>
        </div>
        <button
          onClick={() => createRoomMutation.mutate()}
          disabled={createRoomMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
        >
          <Plus size={18} />
          <span>Nouvelle consultation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 font-medium transition ${activeTab === "active"
              ? "text-cyan-600 border-b-2 border-cyan-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
        >
          <div className="flex items-center gap-2">
            <Video size={18} />
            <span>Sessions actives ({activeSessions.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition ${activeTab === "history"
              ? "text-cyan-600 border-b-2 border-cyan-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
        >
          <div className="flex items-center gap-2">
            <HistoryIcon size={18} />
            <span>Historique</span>
          </div>
        </button>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === "active" ? (
            <div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeSessions.length === 0 ? (
                <EmptyState
                  icon={<Video className="h-16 w-16 text-slate-400" />}
                  title="Aucune téléconsultation active"
                  description="Créez une nouvelle session pour consulter un médecin en ligne"
                  action={{
                    label: "Démarrer une consultation",
                    onClick: () => createRoomMutation.mutate(),
                    loading: createRoomMutation.isPending,
                  }}
                />
              ) : (
                <div className="grid gap-4">
                  {activeSessions.map((session) => (
                    <TeleconsultCard
                      key={session.id}
                      session={session}
                      onJoin={() => joinRoom(session.room_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {history.length === 0 ? (
                <EmptyState
                  icon={<HistoryIcon className="h-16 w-16 text-slate-400" />}
                  title="Aucune consultation passée"
                  description="Votre historique de téléconsultations apparaîtra ici"
                />
              ) : (
                <div className="grid gap-4">
                  {history.map((session) => (
                    <HistoryCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * ✅ Carte de téléconsultation active
 */
function TeleconsultCard({ session, onJoin }) {
  const scheduledDate = new Date(session.scheduled_at);

  return (
    <div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {session.doctor?.name || "Médecin disponible"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {session.doctor?.specialization || "Médecine générale"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar size={16} />
              <span>
                {scheduledDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock size={16} />
              <span>
                {scheduledDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {session.reason && (
            <div className="mt-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{session.reason}</span>
            </div>
          )}
        </div>

        <button
          onClick={onJoin}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <PlayCircle size={18} />
          <span>Rejoindre</span>
        </button>
      </div>
    </div>
  );
}

/**
 * ✅ Carte d'historique
 */
function HistoryCard({ session }) {
  const scheduledDate = new Date(session.scheduled_at);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 opacity-75">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full">
          <Video className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {session.doctor?.name || "Consultation terminée"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {session.doctor?.specialization || "Médecine générale"}
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>
                {scheduledDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>
                {scheduledDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
          Terminée
        </span>
      </div>
    </div>
  );
}

/**
 * ✅ État vide
 */
function EmptyState({ icon, title, description, action }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-12 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.loading}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}


