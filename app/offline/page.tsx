"use client";

import React from "react";
import Link from "next/link";
import { Crown, WifiOff, Sparkles, Home } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-brand-border rounded-2xl p-6 md:p-8 text-center shadow-lg animate-in zoom-in-95 duration-300">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#073238]/10 to-[#073238]/5 border border-brand-border flex items-center justify-center shadow-sm">
            <Crown className="w-7 h-7 text-brand" />
          </div>
        </div>

        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-xl md:text-2xl font-black text-brand mb-2">
          You are Offline
        </h1>
        
        <p className="text-xs md:text-sm text-brand-muted leading-relaxed mb-6 font-medium">
          Check your network connection and try reloading the page. EduVisuals requires an active internet connection to search and download high-resolution visuals.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => typeof window !== "undefined" && window.location.reload()}
            className="w-full bg-brand hover:bg-brand text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Retry Connection
          </button>
          
          <Link
            href="/"
            className="w-full bg-white border border-brand-border hover:bg-[#f3f3f3] text-brand font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            Go back Home
          </Link>
        </div>

        <p className="text-[10px] text-brand-faint mt-6">
          EduVisuals.lk · Offline Visual Library Cache
        </p>
      </div>
    </div>
  );
}
