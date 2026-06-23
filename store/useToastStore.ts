import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  show: false,
  message: "",
  type: "info",
  showToast: (message, type = "info") => {
    set({ show: true, message, type });
    setTimeout(() => {
      set({ show: false });
    }, 3000);
  },
  hideToast: () => set({ show: false }),
}));

export const useToast = () => {
  const showToast = useToastStore((state) => state.showToast);
  return {
    toast: {
      success: (msg: string) => showToast(msg, "success"),
      error: (msg: string) => showToast(msg, "error"),
      info: (msg: string) => showToast(msg, "info"),
    },
  };
};
