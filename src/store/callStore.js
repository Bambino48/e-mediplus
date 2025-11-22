import { create } from "zustand";


export const useCallStore = create((set) => ({
    roomId: null,
    localStream: null,
    remoteStream: null,
    micOn: true,
    camOn: true,
    setRoom: (roomId) => set({ roomId }),
    setLocalStream: (s) => set({ localStream: s }),
    setRemoteStream: (s) => set({ remoteStream: s }),
    toggleMic: () => set((s) => ({ micOn: !s.micOn })),
    toggleCam: () => set((s) => ({ camOn: !s.camOn })),
    reset: () => set({ roomId: null, localStream: null, remoteStream: null, micOn: true, camOn: true }),
}));