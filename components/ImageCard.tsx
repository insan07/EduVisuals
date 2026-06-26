"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Download, Eye, Crown, Sparkles, Share2 } from "lucide-react";
import { cn, formatDownloadCount, getSubjectColor } from "@/lib/utils";

interface ImageCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  subject: string;
  grade: "OL" | "AL" | "Grade 6-9" | "University" | "General";
  type: "Mind Map" | "Diagram" | "Graph" | "Flowchart" | "Illustration" | "Summary";
  isPremium: boolean;
  downloadCount: number;
  isSaved?: boolean;
  onDownload?: () => void;
  onSave?: () => void;
}

const ImageCardComponent: React.FC<ImageCardProps> = ({
  id,
  title,
  thumbnailUrl,
  subject,
  grade,
  type,
  isPremium,
  downloadCount,
  isSaved = false,
  onDownload,
  onSave,
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) onSave();
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownload) onDownload();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/image/${id}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-white border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full hover:-translate-y-1 select-none",
        isPremium
          ? "border-[rgba(7,50,56,0.15)] ring-1 ring-[rgba(7,50,56,0.05)]"
          : "border-brand-border"
      )}
      onContextMenu={(e) => {
        // Mobile long-press menu toggle
        e.preventDefault();
        setShowMobileMenu(true);
      }}
    >
      {/* 1. IMAGE CONTAINER */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-tr from-[#e8ecec] to-white overflow-hidden flex-shrink-0">
        
        {/* Shimmer skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#f3f3f3] via-[#e2e8f0] to-[#f3f3f3] bg-[length:200%_100%] animate-shimmer" />
        )}

        {/* Thumbnail Image */}
        <img
          src={thumbnailUrl || `https://placehold.co/400x300/f3f3f3/00393c?text=${encodeURIComponent(title)}`}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
        />

        {/* Bottom protection block overlay */}
        <div className="absolute inset-0 bg-transparent z-10" />

        {/* Badges layer */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isPremium ? (
            <span className="flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 p-1.5 rounded-lg border border-yellow-300 shadow-sm pointer-events-none" title="Premium">
              <Crown className="w-3.5 h-3.5 text-[#073238] fill-[#073238]" />
            </span>
          ) : (
            <span className="text-[8px] font-black tracking-wider uppercase bg-white text-brand px-2 py-0.5 rounded border border-brand-border shadow-sm">
              Free
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
          <span className="text-[8px] font-black tracking-wider uppercase bg-[#f3f3f3] text-brand px-2 py-0.5 rounded border border-brand-border shadow-sm">
            {type}
          </span>
        </div>

        {/* Premium visual overlay badge */}
        {isPremium && (
          <div className="absolute bottom-2.5 right-2.5 z-20 bg-gradient-to-br from-amber-400 to-yellow-500 p-1.5 rounded-lg border border-yellow-300 shadow-md pointer-events-none">
            <Crown className="w-3.5 h-3.5 text-[#073238] fill-[#073238]" />
          </div>
        )}

        {/* 2. HOVER OVERLAY (Desktop only) */}
        <div className="hidden md:flex absolute inset-0 bg-brand/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <Link
              href={`/image/${id}`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors shadow-sm"
              title="Quick view details"
            >
              <Eye className="w-4.5 h-4.5" />
            </Link>

            <button
              onClick={handleSaveClick}
              className={cn(
                "p-2 rounded-xl border transition-colors shadow-sm",
                saved
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              )}
              title={saved ? "Remove from Favorites" : "Save to Favorites"}
            >
              <Heart className={cn("w-4.5 h-4.5", saved ? "fill-white" : "")} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-white/80 font-bold px-1 select-none">
              <span>{type}</span>
              <span>↓ {formatDownloadCount(downloadCount)}</span>
            </div>
            <button
              onClick={handleDownloadClick}
              className="w-full bg-white hover:bg-[#f3f3f3] text-brand font-black text-xs py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Visual
            </button>
          </div>
        </div>
      </div>

      {/* 3. CARD BODY */}
      <Link href={`/image/${id}`} className="p-4 bg-white flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs md:text-[13px] font-black text-brand group-hover:text-brand transition-colors line-clamp-2 leading-snug mb-3">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-brand-border text-[9px] font-bold">
          <span className={cn("px-2.5 py-0.5 rounded-full border shadow-sm capitalize", getSubjectColor(subject))}>
            {subject}
          </span>
          <span className="text-brand-muted uppercase tracking-wide">
            {grade}
          </span>
        </div>
      </Link>

      {/* 4. MOBILE LONG-PRESS DIALOG MENU OVERLAY */}
      {showMobileMenu && (
        <div className="absolute inset-0 bg-brand/95 z-40 flex flex-col justify-center items-center gap-3 p-4 animate-in fade-in duration-200">
          <span className="text-[10px] text-white/70 font-black uppercase tracking-wider text-center line-clamp-1 max-w-full">
            {title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileMenu(false);
            }}
            className="absolute top-2 right-2 text-white/70 hover:text-white text-xs font-black p-1"
          >
            ✕
          </button>
          <div className="flex flex-col gap-2 w-full max-w-[180px]">
            <button
              onClick={(e) => {
                handleDownloadClick(e);
                setShowMobileMenu(false);
              }}
              className="flex items-center justify-center gap-2 bg-white text-brand font-bold text-xs py-2 rounded-xl shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={(e) => {
                handleSaveClick(e);
                setShowMobileMenu(false);
              }}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold text-xs py-2 rounded-xl"
            >
              <Heart className={cn("w-3.5 h-3.5", saved ? "fill-white" : "")} />
              {saved ? "Saved" : "Save Favorite"}
            </button>
            <button
              onClick={(e) => {
                handleShareClick(e);
                setShowMobileMenu(false);
              }}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold text-xs py-2 rounded-xl"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageCardComponent);
