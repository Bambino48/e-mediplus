import { useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  updateProfileRequest,
} from "../api/auth.js";
import { useAuthStore } from "../store/authStore.js";
import {
  getErrorMessage,
  isTemporaryError,
  logError,
} from "../utils/errorHandler.js";

/**
 * Vérifie si un token est valide (Sanctum tokens sont des chaînes aléatoises, pas des JWT)
 */
function isValidToken(token) {
  // Pour Laravel Sanctum, le token est une chaîne aléatoire, pas un JWT
  return token && typeof token === "string" && token.length > 10;
}

export function useAuth() {
  // ✅ Gestion du state global (Zustand)
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clear = useAuthStore((state) => state.clear);

  // ✅ Récupération du token depuis localStorage
  const token = localStorage.getItem("token");

  /**
   * 🔹 Récupérer l'utilisateur connecté
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) return; // Pas de token → pas d'appel

      // Tentative de récupération via l'API
      const me = await getCurrentUser(token);
      const userData = me.user || me;

      setUser(userData);
    } catch (e) {
      logError("fetchCurrentUser", e);

      // Si c'est une erreur temporaire du serveur, on affiche un message et
      // ne restaure pas d'état depuis le stockage local (aucune donnée
      // persistée côté client).
      if (isTemporaryError(e)) {
        console.warn(
          "Erreur serveur temporaire - aucune donnée locale utilisée"
        );
        toast.error(
          "Erreur temporaire du serveur. Certaines fonctionnalités peuvent être limitées."
        );
      } else {
        // Pour les autres erreurs (401, 403, etc.), on efface la session
        clear(); // Pas connecté ou token invalide
        localStorage.removeItem("token");
        toast.error(getErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  }, [token, setUser, setLoading, clear]);

  /**
   * 🔹 Connexion
   */
  const login = useCallback(
    async (form) => {
      setLoading(true);
      try {
        const res = await loginRequest(form);
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        setUser(res.user);
        toast.success("Connexion réussie !");
        return res.user;
      } catch (e) {
        toast.error(e.response?.data?.message || "Échec de connexion");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading]
  );

  /**
   * 🔹 Inscription
   */
  const register = useCallback(
    async (form) => {
      setLoading(true);
      try {
        const res = await registerRequest(form);

        // Si un token est fourni, connecter automatiquement l'utilisateur
        if (res.token) {
          localStorage.setItem("token", res.token);
          setUser(res.user);
          toast.success("Compte créé avec succès !");
          return res.user;
        } else {
          // Pas de connexion automatique - rediriger vers login
          toast.success("Compte créé avec succès ! Veuillez vous connecter.");
          return { redirect_to: "login", user: res.user };
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Échec d'inscription");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading]
  );

  /**
   * 🔹 Déconnexion
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) await logoutRequest(token);
      localStorage.removeItem("token");
      clear();
      toast.success("Déconnecté");
    } catch (e) {
      toast.error(e.response?.data?.message || "Échec de déconnexion");
    } finally {
      setLoading(false);
    }
  }, [token, clear, setLoading]);

  /**
   * 🔹 Mise à jour du profil utilisateur (optionnelle)
   */
  const updateProfile = useCallback(
    async (form) => {
      if (!token) return toast.error("Non connecté");
      setLoading(true);
      try {
        const res = await updateProfileRequest(token, form);

        let userData = res?.user || res?.data?.user || res?.data || res;

        if (!userData || typeof userData !== "object") {
          const fresh = await getCurrentUser(token);
          userData = fresh.user || fresh;
        }

        if (!userData?.photo && !userData?.photo_url) {
          try {
            const fresh = await getCurrentUser(token);
            userData = fresh.user || fresh;
          } catch (refreshError) {
            logError("updateProfile.refresh", refreshError);
          }
        }

        // Mettre à jour l'état utilisateur (pas de cache local `cachedUser`)
        if (userData) {
          setUser(userData);
        }

        // Retourner les données pour utilisation dans le composant
        return userData;
      } catch (e) {
        logError("updateProfile", e);
        toast.error(
          getErrorMessage(e) || "Erreur lors de la mise à jour du profil"
        );
        throw e; // Re-lancer l'erreur pour gestion dans le composant
      } finally {
        setLoading(false);
      }
    },
    [token, setUser, setLoading]
  );

  return {
    user,
    isLoading,
    token,
    fetchCurrentUser,
    login,
    register,
    logout,
    updateProfile,
  };
}
