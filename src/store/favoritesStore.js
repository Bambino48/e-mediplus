import { create } from "zustand";


export const useFavoritesStore = create((set, get) => ({
    favorites: new Set(),
    toggle: (id) =>
        set(() => {
            const next = new Set(get().favorites);
            next.has(id) ? next.delete(id) : next.add(id);
            return { favorites: next };
        }),
}));