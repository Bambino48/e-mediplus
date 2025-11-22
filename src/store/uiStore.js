// src/store/uiStore.js
import { create } from "zustand";

const initialTheme = localStorage.getItem("theme") || "light";
const initialLocale = localStorage.getItem("locale") || "fr";

export const useUIStore = create((set) => ({
  // Layout
  sidebarOpen: true, // Toujours ouvert par défaut pour la visibilité
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: !!open }),

  // Thème
  theme: initialTheme, // 'light' | 'dark'
  setTheme: (t) => set({ theme: t }),

  // Langue
  locale: initialLocale, // 'fr' | 'en'
  setLocale: (l) => set({ locale: l }),

  // Notifications
  notifications: [
    {
      id: "n1",
      type: "info",
      title: "Bienvenue 👋",
      message: "Heureux de vous revoir sur MediPlus.",
      read: false,
      ts: Date.now(),
    },
  ],
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        { id: crypto.randomUUID(), read: false, ts: Date.now(), ...n },
        ...s.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((x) =>
        x.id === id ? { ...x, read: true } : x
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
