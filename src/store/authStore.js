import { create } from "zustand";

// Fonction pour récupérer l'utilisateur depuis le localStorage
const getInitialUser = () => {
  try {
    const cachedUser = localStorage.getItem("cachedUser");
    if (!cachedUser) return null;

    // Vérifier si c'est du JSON valide
    const parsed = JSON.parse(cachedUser);

    // Vérifier que c'est un objet avec les propriétés attendues
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      parsed.id &&
      parsed.email
    ) {
      return parsed;
    }

    // Si ce n'est pas valide, supprimer le cache corrompu
    localStorage.removeItem("cachedUser");
    return null;
  } catch (error) {
    // En cas d'erreur de parsing, supprimer le cache corrompu
    console.warn("Cache utilisateur corrompu, suppression:", error);
    localStorage.removeItem("cachedUser");
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(), // Initialiser avec les données du localStorage
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, isLoading: false }),
}));
