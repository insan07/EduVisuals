"use client";

import { useToastStore } from "@/store/useToastStore";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import React from "react";

export default function Toast() {
  const { show, message, type } = useToastStore();

  if (!show) return null;

  const bgColors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-brand",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-white" />,
    error: <AlertCircle className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-white" />,
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl ${bgColors[type]} text-white font-bold text-sm animate-in slide-in-from-right-8 duration-300`}>
      {icons[type]}
      {message}
    </div>
  );
}
