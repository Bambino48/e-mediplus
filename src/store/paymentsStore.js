import { create } from "zustand";

export const usePaymentsStore = create((set) => ({
    payments: [],
    setPayments: (items) => set({ payments: items }),
}));
