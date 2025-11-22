// src/store/prescriptionsStore.js
import { create } from "zustand";

export const usePrescriptionsStore = create((set) => ({
    items: [], // [{ id, pdf_url, qr_data, medications: [...] }]
    setItems: (items) => set({ items }),
    upsert: (presc) =>
        set((s) => {
            const idx = s.items.findIndex((x) => x.id === presc.id);
            if (idx === -1) return { items: [presc, ...s.items] };
            const next = [...s.items];
            next[idx] = presc;
            return { items: next };
        }),
}));
