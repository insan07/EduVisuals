"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Download, Crown, Layers, FileImage, Share2, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";

export interface FeedVisual {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  file_url?: string;
  is_premium?: boolean;
  download_count?: number;
  view_count?: number;
  subject?: string;
  grade?: string;
  type?: string;
  additional_urls?: string[];
  uploader?: {
    id: string;
    display_name: string;
    avatar_url?: string | null;
  } | null;
  created_at?: string;
}

interface FeedPostProps {
  visual: FeedVisual;
  isSaved?: boolean;
  onSave?: () => void;
  onDownload?: () => void;
}

export default function FeedPost({
  visual,
  isSaved = false,
  onSave,
  onDownload,
}: FeedPostProps) {
  const [imgSrc, setImgSrc] = useState(
    visual.thumbnail_url || visual.file_url || ""
  );

  return (
    <div className="bg-white border border-brand/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6 w-full max-w-xl mx-auto flex flex-col">
      
      {/* ── Header: Uploader Info ── */}
      <div className="flex items-center justify-between p-4">
        <Link 
          href={visual.uploader?.id && visual.uploader.id !== "official" ? `/creator/${visual.uploader.id}` : "#"} 
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 group-hover:ring-2 ring-brand/20 transition-all">
            {visual.uploader?.avatar_url ? (
              <img src={visual.uploader.avatar_url} alt={visual.uploader.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-brand font-bold text-sm">
                {visual.uploader?.display_name?.charAt(0)?.toUpperCase() || "L"}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-brand group-hover:text-emerald-600 transition-colors">
              {visual.uploader?.display_name || "Learnpik Creator"}
            </span>
            {visual.created_at && (
              <span className="text-xs text-brand-muted font-medium">
                {new Date(visual.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </Link>
        <button className="text-brand-muted hover:text-brand p-2 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* ── Image ── */}
      <Link href={`/image/${visual.id}`} className="relative block w-full bg-[#f8f9fa] group cursor-pointer aspect-square sm:aspect-[4/5] flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={visual.title}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            draggable={false}
            onError={() => {
              if (imgSrc === visual.thumbnail_url && visual.file_url) {
                setImgSrc(visual.file_url);
              } else {
                setImgSrc("");
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <FileImage size={48} className="text-brand-muted/30" />
        )}

        {visual.is_premium && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1 z-10 shadow-sm">
            <Crown size={12} /> Premium
          </div>
        )}

        {visual.additional_urls && visual.additional_urls.length > 0 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white rounded-md p-1.5 z-10 shadow-sm">
            <Layers size={14} />
          </div>
        )}
      </Link>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onSave} className="group flex items-center gap-1.5 transition-transform active:scale-95">
            <Heart 
              className={`w-6 h-6 transition-colors ${isSaved ? "fill-rose-500 text-rose-500" : "text-brand hover:text-rose-500"}`} 
            />
          </button>
          <Link href={`/image/${visual.id}`} className="group flex items-center gap-1.5 transition-transform active:scale-95">
            <MessageCircle className="w-6 h-6 text-brand hover:text-brand/70 transition-colors" />
          </Link>
          <button className="group flex items-center gap-1.5 transition-transform active:scale-95">
            <Share2 className="w-6 h-6 text-brand hover:text-brand/70 transition-colors" />
          </button>
        </div>
        <button 
          onClick={onDownload}
          className="flex items-center gap-1.5 text-sm font-bold text-brand bg-brand/5 hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" /> Save
        </button>
      </div>

      {/* ── Details ── */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5 mb-1">
          {visual.subject && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {visual.subject}
            </span>
          )}
          {visual.grade && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
              {visual.grade}
            </span>
          )}
          {visual.type && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {visual.type}
            </span>
          )}
        </div>
        
        <div>
          <Link href={`/image/${visual.id}`} className="font-bold text-brand hover:underline mr-2">
            {visual.uploader?.display_name || "Learnpik Creator"}
          </Link>
          <span className="text-sm font-medium text-brand/90">{visual.title}</span>
        </div>
        
        {visual.description && (
          <p className="text-xs text-brand-muted font-medium line-clamp-2">
            {visual.description}
          </p>
        )}
      </div>
    </div>
  );
}
