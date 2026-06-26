import { create } from "zustand";

interface CollectionModalState {
  isOpen: boolean;
  visualIdToSave: string | null;
  visualTitle: string | null;
  open: (visualId: string, visualTitle?: string) => void;
  close: () => void;
}

export const useCollectionModal = create<CollectionModalState>((set) => ({
  isOpen: false,
  visualIdToSave: null,
  visualTitle: null,
  open: (visualId, visualTitle) => set({ isOpen: true, visualIdToSave: visualId, visualTitle: visualTitle || null }),
  close: () => set({ isOpen: false, visualIdToSave: null, visualTitle: null }),
}));
