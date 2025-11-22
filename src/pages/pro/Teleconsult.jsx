// src/pages/pro/Teleconsult.jsx
import {
  Calendar,
  Clock,
  Phone,
  PhoneOff,
  RefreshCw,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useTeleconsultations } from "../../hooks/useTeleconsultations.js";
import ProLayout from "../../layouts/ProLayout.jsx";

export default function Teleconsult() {
  const { activeTeleconsults, teleconsultHistory, isLoading, error, refetch } =
    useTeleconsultations();
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const handleJoinSession = (teleconsult) => {
    setCurrentRoom(teleconsult);
    setConnected(true);
  };

  const handleEndSession = () => {
    setConnected(false);
    setCurrentRoom(null);
  };

  if (connected && currentRoom) {
    return (
      <ProLayout title="Salle de téléconsultation">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                Consultation avec{" "}
                {currentRoom.patient || `Patient #${currentRoom.patient_id}`}
              </h3>
              <p className="text-sm text-slate-500">
                Salle: {currentRoom.room_id || currentRoom.id}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                currentRoom.status
              )}`}
            >
              {currentRoom.status === "in_progress" ? "En cours" : "Confirmée"}
            </div>
          </div>

          <div className="aspect-video bg-slate-900 rounded-xl grid place-items-center text-slate-400 relative">
            <div className="text-center">
              <Video size={48} className="mx-auto mb-4" />
              <p className="text-lg font-medium">Flux vidéo simulé</p>
              <p className="text-sm">Agora/WebRTC sera intégré ici</p>
            </div>
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                En direct
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button className="btn-ghost">
              <Phone size={16} className="mr-2" />
              Muet
            </button>
            <button className="btn-ghost">
              <Video size={16} className="mr-2" />
              Caméra
            </button>
            <button className="btn-danger" onClick={handleEndSession}>
              <PhoneOff size={16} className="mr-2" />
              Terminer
            </button>
          </div>
        </div>
      </ProLayout>
    );
  }

  return (
    <ProLayout title="Téléconsultations">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {activeTeleconsults.length} consultation
            {activeTeleconsults.length !== 1 ? "s" : ""} active
            {activeTeleconsults.length !== 1 ? "s" : ""}
          </p>
        </div>
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
      </div>

      {isLoading ? (
        <div className="card grid place-items-center py-16">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <span>Chargement des téléconsultations...</span>
          </div>
        </div>
      ) : error ? (
        <div className="card text-center py-16">
          <div className="text-red-500 mb-4">
            <Video size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Erreur de chargement
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Impossible de charger les téléconsultations. Veuillez réessayer.
          </p>
          <button onClick={() => refetch()} className="btn-primary">
            Réessayer
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Téléconsultations actives */}
          {activeTeleconsults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Video size={20} className="text-cyan-600" />
                Consultations actives
              </h3>
              <div className="grid gap-4">
                {activeTeleconsults.map((teleconsult) => (
                  <div
                    key={teleconsult.id}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                          <User
                            size={24}
                            className="text-cyan-600 dark:text-cyan-400"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {teleconsult.patient ||
                              `Patient #${teleconsult.patient_id}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(teleconsult.scheduled_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            teleconsult.status
                          )}`}
                        >
                          {teleconsult.status === "in_progress"
                            ? "En cours"
                            : "Confirmée"}
                        </div>
                        <button
                          onClick={() => handleJoinSession(teleconsult)}
                          className="btn-primary"
                        >
                          <Video size={16} className="mr-2" />
                          Rejoindre
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique des téléconsultations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-slate-600" />
              Historique ({teleconsultHistory.length})
            </h3>

            {teleconsultHistory.length > 0 ? (
              <div className="grid gap-4">
                {teleconsultHistory.map((teleconsult) => (
                  <div key={teleconsult.id} className="card opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <User
                            size={20}
                            className="text-slate-600 dark:text-slate-400"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {teleconsult.patient ||
                              `Patient #${teleconsult.patient_id}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(teleconsult.scheduled_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              Terminée
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {teleconsult.duration
                          ? `${teleconsult.duration} min`
                          : "Durée inconnue"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Clock size={48} className="mx-auto mb-4 text-slate-400" />
                <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Aucun historique
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Les téléconsultations terminées apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </ProLayout>
  );
}
