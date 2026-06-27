import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  initialTab: "signin" | "signup";
  intendedDownload: string | null;
  onAuthSuccess: (() => void) | null;
  open: (tab?: "signin" | "signup", intendedDownload?: string, onAuthSuccess?: () => void) => void;
  close: () => void;
  triggerSuccess: () => void;
}

export const useAuthModal = create<AuthModalState>((set, get) => ({
  isOpen: false,
  initialTab: "signin",
  intendedDownload: null,
  onAuthSuccess: null,
  open: (tab = "signin", intendedDownload?: string, onAuthSuccess?: () => void) =>
    set({ isOpen: true, initialTab: tab, intendedDownload: intendedDownload || null, onAuthSuccess: onAuthSuccess || null }),
  close: () => set({ isOpen: false, intendedDownload: null, onAuthSuccess: null }),
  triggerSuccess: () => {
    const callback = get().onAuthSuccess;
    if (callback) {
      callback();
    }
    set({ isOpen: false, intendedDownload: null, onAuthSuccess: null });
  },
}));
