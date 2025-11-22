import { useAuth } from "../hooks/useAuth";

/**
 * Composant de debug pour afficher l'état du user en temps réel
 * À ajouter temporairement dans Profile.jsx pour diagnostiquer
 */
export default function ProfileDebugger() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-xl max-w-md text-xs font-mono overflow-auto max-h-96 z-50">
      <h3 className="font-bold text-sm mb-2 text-cyan-400">
        🔍 Debug User State
      </h3>

      <div className="space-y-2">
        <div>
          <span className="text-slate-400">ID:</span>{" "}
          <span className="text-green-400">{user.id}</span>
        </div>

        <div>
          <span className="text-slate-400">Name:</span>{" "}
          <span className="text-green-400">{user.name}</span>
        </div>

        <div>
          <span className="text-slate-400">Email:</span>{" "}
          <span className="text-green-400">{user.email}</span>
        </div>

        <div className="border-t border-slate-700 pt-2 mt-2">
          <div className="font-bold text-yellow-400 mb-1">Photo Info:</div>

          <div>
            <span className="text-slate-400">user.photo:</span>{" "}
            <span className="text-green-400 break-all">
              {user.photo || (
                <span className="text-red-400">null/undefined</span>
              )}
            </span>
          </div>

          <div>
            <span className="text-slate-400">user.photo_url:</span>{" "}
            <span className="text-green-400 break-all">
              {user.photo_url || (
                <span className="text-red-400">null/undefined</span>
              )}
            </span>
          </div>

          <div>
            <span className="text-slate-400">user.photo_path:</span>{" "}
            <span className="text-green-400 break-all">
              {user.photo_path || (
                <span className="text-red-400">null/undefined</span>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-2 mt-2">
          <div className="font-bold text-purple-400 mb-1">
            LocalStorage Cache:
          </div>
          <pre className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32">
            {(() => {
              try {
                const cachedUser = localStorage.getItem("cachedUser") || "{}";
                return JSON.stringify(JSON.parse(cachedUser), null, 2);
              } catch (error) {
                return `Erreur de parsing JSON: ${
                  error.message
                }\nValeur brute: ${
                  localStorage.getItem("cachedUser")?.substring(0, 100) ||
                  "null"
                }`;
              }
            })()}
          </pre>
        </div>

        <div className="border-t border-slate-700 pt-2 mt-2">
          <div className="font-bold text-blue-400 mb-1">Full User Object:</div>
          <pre className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
