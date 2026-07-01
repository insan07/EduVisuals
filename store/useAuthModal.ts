import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  initialTab: "signin" | "signup";
  intendedDownload: string | null;
  nextUrl: string | null;
  onAuthSuccess: (() => void) | null;
  open: (tab?: "signin" | "signup", intendedDownload?: string, onAuthSuccess?: () => void, nextUrl?: string) => void;
  close: () => void;
  triggerSuccess: () => void;
}

export const useAuthModal = create<AuthModalState>((set, get) => ({
  isOpen: false,
  initialTab: "signin",
  intendedDownload: null,
  nextUrl: null,
  onAuthSuccess: null,
  open: (tab = "signin", intendedDownload?: string, onAuthSuccess?: () => void, nextUrl?: string) =>
    set({ isOpen: true, initialTab: tab, intendedDownload: intendedDownload || null, onAuthSuccess: onAuthSuccess || null, nextUrl: nextUrl || null }),
  close: () => set({ isOpen: false, intendedDownload: null, onAuthSuccess: null, nextUrl: null }),
  triggerSuccess: () => {
    const callback = get().onAuthSuccess;
    if (callback) {
      callback();
    } else {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
    set({ isOpen: false, intendedDownload: null, onAuthSuccess: null, nextUrl: null });
  },
}));
