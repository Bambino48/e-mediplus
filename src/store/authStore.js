import { create } from "zustand";

// Nous n'utilisons plus de cache utilisateur côté client : toujours démarrer
// avec null pour forcer la récupération depuis l'API (pas de données persistées).
const getInitialUser = () => null;

export const useAuthStore = create((set) => ({
  user: getInitialUser(), // Initialiser avec les données du localStorage
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, isLoading: false }),
}));
