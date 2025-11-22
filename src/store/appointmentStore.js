import { create } from "zustand";

export const useAppointmentStore = create((set) => ({
  doctor: null, // { id, name, primary_specialty, fees }
  selection: null, // { date: Date, time: 'HH:mm' }
  mode: "presentiel", // 'presentiel' | 'teleconsult' | 'professionnel'
  setDoctor: (doctor) => set({ doctor }),
  setSelection: (selection) => set({ selection }),
  setMode: (mode) => set({ mode }),
  clear: () => set({ doctor: null, selection: null, mode: "presentiel" }),
}));
