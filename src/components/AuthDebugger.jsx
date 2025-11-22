// src/components/AuthDebugger.jsx
import { useAuth } from "../hooks/useAuth";

export default function AuthDebugger() {
  const { user, isLoading, token } = useAuth();

  // Affichage uniquement en mode développement
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded text-xs max-w-xs">
      <h3 className="font-bold text-green-400">🔍 Auth Debug</h3>
      <div className="mt-1 space-y-1">
        <div>
          <span className="text-blue-300">Chargement:</span>{" "}
          {isLoading ? "Oui" : "Non"}
        </div>
        <div>
          <span className="text-blue-300">Token:</span>{" "}
          {token ? "✅ Présent" : "❌ Absent"}
        </div>
        <div>
          <span className="text-blue-300">Utilisateur:</span>{" "}
          {user ? "✅ Connecté" : "❌ Non connecté"}
        </div>
        {user && (
          <div className="text-xs text-gray-300">
            <div>ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Rôle: {user.role}</div>
          </div>
        )}
      </div>
    </div>
  );
}
