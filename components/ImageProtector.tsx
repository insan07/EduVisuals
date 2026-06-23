"use client";

import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";

interface ImageProtectorProps {
  children: React.ReactElement;
  warningMessage?: string;
}

export default function ImageProtector({
  children,
  warningMessage = "Right-clicking, dragging, and saving images is disabled to protect content creators.",
}: ImageProtectorProps) {
  const [showToast, setShowToast] = useState(false);

  const triggerToast = () => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerToast();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Disable keyboard copy shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "S" || e.key === "u" || e.key === "U")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I" || e.key === "c" || e.key === "C")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        triggerToast();
      }
    };

    // Detect screenshot attempt using Page Visibility API
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Screenshot or page switching occurred
        triggerToast();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="relative select-none"
      onContextMenu={handleContextMenu}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* Invisible overlay blocking touch actions and hover drags */}
      <div
        className="absolute inset-0 z-20 cursor-default bg-transparent"
        onDragStart={handleDragStart}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserDrag: "none",
        } as any}
      />

      {/* Render the underlying image content */}
      <div className="relative z-10">{children}</div>

      {/* Toast Warning banner */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand border border-brand-border text-white font-bold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom duration-300">
          <Info className="w-4 h-4 text-white" />
          {warningMessage}
        </div>
      )}
    </div>
  );
}
