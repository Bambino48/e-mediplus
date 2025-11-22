import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute({ roles = [], children }) {
  const { user, isLoading, token, fetchCurrentUser } = useAuth();
  const location = useLocation();

  // ✅ Vérifie au montage si l'utilisateur est toujours connecté (lazy loading)
  useEffect(() => {
    if (!user && token && !isLoading) {
      fetchCurrentUser(); // récupère l'utilisateur depuis le backend seulement si nécessaire
    }
  }, [user, token, isLoading, fetchCurrentUser]); // ✅ Affichage de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="animate-spin h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"></span>
          <span className="animate-pulse text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  // ✅ Si pas connecté ou token inexistant → redirection vers login
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Si un rôle est requis et que l'utilisateur n'a pas le bon → redirection accueil
  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Sinon, on autorise l'accès à la page protégée
  return children;
}
