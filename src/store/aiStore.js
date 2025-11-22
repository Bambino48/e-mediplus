import { create } from "zustand";

export const useAIStore = create((set) => ({
    triage: null,
    recommendations: [],
    setTriage: (t) => set({ triage: t }),
    setRecommendations: (r) => set({ recommendations: r }),
}));
