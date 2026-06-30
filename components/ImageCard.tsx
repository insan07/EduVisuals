"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Download, Eye, Crown, Sparkles, Share2, Layers } from "lucide-react";
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
  hasMultipleImages?: boolean;
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
  hasMultipleImages = false,
  onDownload,
  onSave,
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [imageLoaded, setImageLoaded] = useState(false);

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
        "group relative rounded-2xl overflow-hidden bg-white border transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col h-full hover:-translate-y-1 select-none",
        isPremium
          ? "border-[#073238]/15 ring-1 ring-[#073238]/5"
          : "border-gray-100/50"
      )}
      onContextMenu={(e) => {
        // Mobile long-press menu toggle
        e.preventDefault();
        setShowMobileMenu(true);
      }}
    >
      {/* 1. IMAGE CONTAINER */}
      <Link href={`/image/${id}`} className="relative aspect-[4/3] w-full bg-gradient-to-tr from-[#e8ecec] to-white overflow-hidden flex-shrink-0 block group/image">
        
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
            "w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
        />

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

        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none flex flex-col gap-1.5 items-end">
          <span className="text-[8px] font-black tracking-wider uppercase bg-[#f3f3f3] text-brand px-2 py-0.5 rounded border border-brand-border shadow-sm">
            {type}
          </span>
          {hasMultipleImages && (
            <span className="flex items-center justify-center bg-brand/80 backdrop-blur-sm p-1 rounded-md border border-brand-border/50 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </div>
      </Link>

      {/* 3. CARD BODY */}
      <div className="p-3.5 bg-white flex-1 flex flex-col justify-between">
        <Link href={`/image/${id}`}>
          <h3 className="text-[13px] md:text-sm font-bold text-[#00393c] hover:text-[#073238] transition-colors line-clamp-2 leading-snug mb-3">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-[10px] font-semibold mt-auto">
          <span className={cn("px-2 py-0.5 rounded border capitalize shadow-sm bg-gradient-to-br", getSubjectColor(subject))}>
            {subject}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveClick}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              title={saved ? "Remove from Favorites" : "Save to Favorites"}
            >
              <Heart className={cn("w-4 h-4", saved ? "fill-red-500 text-red-500" : "")} />
            </button>
            <button
              onClick={handleDownloadClick}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#073238] transition-colors"
              title="Download Visual"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageCardComponent);
