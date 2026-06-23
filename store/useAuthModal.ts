import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  intendedDownload: string | null;
  onAuthSuccess: (() => void) | null;
  open: (intendedDownload?: string, onAuthSuccess?: () => void) => void;
  close: () => void;
  triggerSuccess: () => void;
}

export const useAuthModal = create<AuthModalState>((set, get) => ({
  isOpen: false,
  intendedDownload: null,
  onAuthSuccess: null,
  open: (intendedDownload?: string, onAuthSuccess?: () => void) =>
    set({ isOpen: true, intendedDownload: intendedDownload || null, onAuthSuccess: onAuthSuccess || null }),
  close: () => set({ isOpen: false, intendedDownload: null, onAuthSuccess: null }),
  triggerSuccess: () => {
    const callback = get().onAuthSuccess;
    if (callback) {
      callback();
    }
    set({ isOpen: false, intendedDownload: null, onAuthSuccess: null });
  },
}));
