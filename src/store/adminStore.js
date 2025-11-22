import { create } from "zustand";

export const useAdminStore = create((set) => ({
    users: [],
    pharmacies: [],
    setUsers: (items) => set({ users: items }),
    setPharmacies: (items) => set({ pharmacies: items }),
}));
