"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Download, Crown, Layers, FileImage } from "lucide-react";

export interface Visual {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  file_url?: string;
  is_premium?: boolean;
  isPremium?: boolean;
  download_count?: number;
  downloadCount?: number;
  view_count?: number;
  subject?: string;
  grade?: string;
  type?: string;
  syllabus?: string;
  medium?: string;
  additional_urls?: string[];
}

interface VisualCardProps {
  visual: Visual;
  isSaved?: boolean;
  onSave?: () => void;
  onDownload?: () => void;
}

export default function VisualCard({
  visual,
  isSaved = false,
  onSave,
  onDownload,
}: VisualCardProps) {
  const [imgSrc, setImgSrc] = useState(
    visual.thumbnailUrl || visual.thumbnail_url || visual.file_url || ""
  );
  const isPremiumVisual = visual.isPremium ?? visual.is_premium ?? false;

  return (
    <Link
      href={`/image/${visual.id}`}
      className="group block relative w-full rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #e8f5f6, #d0ecee)",
      }}
    >
      {/* ── Image ── */}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={visual.title}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          onError={() => {
            const fallbackSrc = visual.thumbnailUrl || visual.thumbnail_url;
            if (
              imgSrc === fallbackSrc &&
              visual.file_url &&
              visual.file_url !== fallbackSrc
            ) {
              setImgSrc(visual.file_url);
            } else {
              setImgSrc("");
            }
          }}
          className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] block object-cover object-top"
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center">
          <FileImage size={40} style={{ color: "rgba(7,50,56,0.25)" }} />
        </div>
      )}

      {/* ── Premium badge (Always visible) ── */}
      {isPremiumVisual && (
        <div className="absolute top-3 left-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1 z-10 shadow-sm">
          <Crown size={12} /> Premium
        </div>
      )}

      {/* ── Multiple Images badge (Always visible) ── */}
      {visual.additional_urls && visual.additional_urls.length > 0 && (
        <div className="absolute top-3 right-3 bg-brand/80 backdrop-blur-sm text-white rounded-md p-1.5 z-10 shadow-sm">
          <Layers size={14} />
        </div>
      )}

      {/* ── Overlay (Hover only, hidden on mobile) ── */}
      <div className="card-overlay absolute inset-0 z-0 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-between bg-black/40">
        <div className="relative z-10 flex justify-end p-3 pointer-events-auto">
          {/* Top right actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSave) onSave();
              }}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-sm transition-colors shadow-sm"
            >
              <Heart
                size={16}
                fill={isSaved ? "#ef4444" : "none"}
                stroke={isSaved ? "#ef4444" : "currentColor"}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDownload) onDownload();
              }}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-sm transition-colors shadow-sm flex items-center justify-center"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="relative z-10 p-4 pointer-events-auto mt-auto">
          {/* Bottom left content */}
          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 mb-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {visual.title}
          </h3>
          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            {visual.subject && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {visual.subject}
              </span>
            )}

            {visual.type && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {visual.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
