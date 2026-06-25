"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuthModal } from "@/store/useAuthModal";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Crown,
  Download,
  Heart,
  Maximize2,
  Share2,
  Copy,
  Info,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Lock,
  Sparkles,
  ArrowLeft,
  BookOpen,
  FileImage,
  MoreHorizontal,
  Flag,
  X,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ImageDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const currentId = resolvedParams.id;

  // Real data state
  const [visual, setVisual] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  
  const [userState, setUserState] = useState<"guest" | "free" | "premium">("guest");
  
  const [isLiked, setIsLiked] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy Link");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showUpsell, setShowUpsell] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [relatedVisuals, setRelatedVisuals] = useState<any[]>([]);

  // Fetch real data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (!isSupabaseConfigured()) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      // 1. Get current auth state
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserState("guest");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", session.user.id)
          .single();
        if (profile?.tier === "Premium") setUserState("premium");
        else setUserState("free");
      }

      // 2. Fetch image
      const { data: image, error } = await supabase
        .from("images")
        .select("*, image_tags(*)")
        .eq("id", currentId)
        .eq("is_published", true)
        .eq("status", "approved")
        .single();

      if (error || !image) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      // Extract flatten tags
      const tags = image.image_tags || [];
      const subject = tags.find((t: any) => t.tag_type === "subject")?.tag || "General";
      const grade = tags.find((t: any) => t.tag_type === "grade")?.tag || "General";
      const type = tags.find((t: any) => t.tag_type === "type")?.tag || "Diagram";
      const syllabus = tags.find((t: any) => t.tag_type === "syllabus")?.tag || "";
      const medium = tags.find((t: any) => t.tag_type === "medium")?.tag || "";
      
      const mappedImage = {
        ...image,
        subject,
        grade,
        type,
        syllabus,
        medium,
        customTags: tags.filter((t: any) => t.tag_type === "custom").map((t: any) => t.tag),
      };

      setVisual(mappedImage);
      setIsLoading(false);

      // 3. Increment view count
      await supabase.rpc('increment_view_count', { image_id: currentId });

      // 4. Fetch related visuals by subject
      try {
        const res = await fetch(`/api/search?subject=${encodeURIComponent(subject)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          // Filter out current image
          const related = (data.images || []).filter((img: any) => img.id !== currentId);
          setRelatedVisuals(related);
        }
      } catch (e) {}
    }
    loadData();
  }, [currentId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy Link"), 2000);
      triggerToast("Link copied to clipboard!");
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownloadClick = async (type?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      useAuthModal.getState().open();
      return;
    }

    try {
      triggerToast(`Preparing download...`);
      const res = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageId: visual.id }),
      });

      const result = await res.json();
      
      if (res.status === 401) { useAuthModal.getState().open(); return; }
      if (result.requiresPremium) { window.location.href = "/pricing"; return; }
      if (result.limitReached) { alert("Daily limit reached (5/day). Upgrade to Premium!"); return; }
      
      if (result.downloadUrl) {
        const urlToDownload = result.downloadUrl.includes('?') 
          ? `${result.downloadUrl}&download=` 
          : `${result.downloadUrl}?download=`;
        const a = document.createElement("a");
        a.href = urlToDownload;
        a.download = visual.title || "download";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        triggerToast("Download started!");
      }
    } catch (error) {
      triggerToast("Error initiating download. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-surface text-brand pb-20 md:pb-12">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-16 items-start">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full aspect-[4/3] md:h-[480px] bg-white rounded-2xl border border-brand-border animate-pulse" />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-32 w-full bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !visual) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <FileImage size={64} className="text-brand-faint mb-4" />
        <h1 className="text-2xl font-black text-brand mb-2">Visual Not Found</h1>
        <p className="text-brand-faint max-w-md mb-6">
          This educational visual might have been removed, made private, or is pending moderator review.
        </p>
        <Link href="/visuals" className="bg-brand text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all">
          ← Browse Visuals
        </Link>
      </div>
    );
  }

  // Clickable search tags list
  const tags = [
    visual.subject,
    visual.grade,
    visual.type,
    visual.syllabus,
    visual.medium,
    ...(visual.customTags || []),
  ].filter(Boolean);

  const RelatedCard = ({ item }: { item: any }) => (
    <Link
      href={`/image/${item.id}`}
      className="group flex-shrink-0 w-52 snap-start rounded-xl overflow-hidden bg-white border border-brand-border hover:border-brand-border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col"
    >
      <div className="h-32 w-full bg-gradient-to-tr from-[#e8ecec] to-[#ffffff] flex items-center justify-center relative select-none">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <FileImage size={32} className="text-brand-faint opacity-50" />
        )}
        {item.isPremium && (
          <span className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/20 bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm flex items-center gap-1">
            <Crown size={10} /> Premium
          </span>
        )}
      </div>
      <div className="p-3 bg-white flex-1 flex flex-col justify-between">
        <h4 className="text-xs font-bold text-brand group-hover:text-brand transition-colors line-clamp-2 leading-snug">
          {item.title}
        </h4>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-border text-[9px] font-semibold text-brand-faint">
          <span>{item.subject}</span>
          <span className="bg-[#f3f3f3] text-brand border border-brand-border px-1.5 py-0.5 rounded text-[8px]">{item.grade}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand pb-20 md:pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-6 flex-1 flex flex-col w-full min-w-0">
        
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-brand-faint mb-6 w-full">
          <Link href="/" className="hover:text-brand font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-faint" />
          <Link href={`/visuals?subject=${visual.subject}`} className="hover:text-brand font-medium">{visual.subject}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-faint" />
          <Link href={`/visuals?type=${visual.type}`} className="hover:text-brand font-medium">{visual.type}s</Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-faint" />
          <span className="text-brand font-bold line-clamp-1">{visual.title}</span>
        </nav>

        {/* Dynamic Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8 md:mb-10 items-start">
          
          {/* ================= LEFT COLUMN: IMAGE PREVIEW (60%) ================= */}
          <div className="lg:col-span-6 flex flex-col gap-4 min-w-0">
            
            {/* Image Box */}
            <div className="group relative w-full bg-[#f8f9fa] rounded-2xl overflow-hidden flex items-center justify-center border border-brand-border shadow-sm select-none p-0 md:p-4 h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
              
              {/* Overlay blocking drag and right click */}
              <div 
                className="absolute inset-0 bg-transparent z-20 cursor-zoom-in"
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Repeating Watermark for Guest & Free */}
              {userState !== "premium" && (
                <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none flex flex-col justify-around select-none text-brand uppercase font-black text-center text-xs tracking-[0.2em] leading-none rotate-[-25deg]">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex justify-around gap-4 whitespace-nowrap">
                      <span>EduVisuals.lk</span>
                      <span>EduVisuals.lk</span>
                      <span>EduVisuals.lk</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Visual Display */}
              {visual.thumbnail_url || visual.file_url ? (
                <img 
                  src={visual.thumbnail_url || visual.file_url} 
                  alt={visual.title} 
                  className="w-full h-full object-contain pointer-events-none drop-shadow-md rounded-2xl md:rounded-none" 
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== visual.file_url && visual.file_url) {
                      target.src = visual.file_url;
                    }
                  }}
                />
              ) : (
                <FileImage size={80} className="text-brand-faint" />
              )}

              {/* Bottom protection note */}
              <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-[#f3f3f3]/90 text-brand/85 rounded text-[10px] border border-brand-border backdrop-blur-sm pointer-events-none select-none">
                © EduVisuals.lk · Protected Content
              </div>

              {/* Premium badge on image */}
              {visual.is_premium && (
                <div className="absolute top-4 left-4 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-md px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 z-20 shadow-sm pointer-events-none select-none">
                  <Crown size={14} /> Premium
                </div>
              )}
            </div>

            {/* Sub-preview utilities */}
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-brand-faint font-medium flex items-center gap-1.5 select-none">
                <Info className="w-3.5 h-3.5 text-brand" />
                Image protected to prevent hotlinking.
              </span>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1 text-xs font-bold transition-all ${
                  isLiked ? "text-red-500" : "text-brand hover:text-red-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
                {isLiked ? "Saved to Favorites" : "Save Visual"}
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INFO + PANEL (40%) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
            
            {/* Title & Metadata */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl md:text-3xl font-black text-brand leading-tight">
                  {visual.title}
                </h1>
                
                {/* 3-dots Dropdown Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="p-2 rounded-full hover:bg-brand-surface text-brand-faint hover:text-brand transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-brand-border rounded-xl shadow-lg z-30 py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <button 
                        onClick={() => { handleCopyLink(); setIsDropdownOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </button>
                      <a 
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Check out this educational visual aid: ${visual.title} - https://eduvisuals.lk/image/${visual.id}`
                        )}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp
                      </a>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          `https://eduvisuals.lk/image/${visual.id}`
                        )}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share on Facebook
                      </a>
                      <div className="h-px bg-brand-border my-1 w-full" />
                      <button 
                        onClick={() => { triggerToast("Report modal opened"); setIsDropdownOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <Flag className="w-3.5 h-3.5" /> Report Issue
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Meta row */}
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-faint mb-4 uppercase tracking-wide">
                <span>{visual.subject}</span>
                <span>•</span>
                <span>{visual.grade}</span>
                <span>•</span>
                <span>{visual.type}</span>
              </div>

              {visual.description && (
                <p className="text-sm text-brand-faint font-medium mb-6 break-words whitespace-normal leading-relaxed">
                  {visual.description}
                </p>
              )}

              <hr className="border-brand-border mb-6" />

              {/* DOWNLOAD PANEL (MINIMAL) */}
              <div className="w-full">
                
                {/* UPSELL STATE */}
                {showUpsell ? (
                  <div className="border border-amber-200 bg-amber-50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-800 font-black text-sm flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-600" />
                        Premium Visual
                      </span>
                      <button onClick={() => setShowUpsell(false)} className="text-amber-500 hover:text-amber-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      This visual is reserved for Premium members. Upgrade to get instant access to high-resolution, watermark-free downloads.
                    </p>

                    <div className="flex flex-col gap-2 mt-2">
                      <Link 
                        href="/pricing"
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm text-center"
                      >
                        View Premium Plans
                      </Link>
                      {userState === "guest" && (
                        <button 
                          onClick={() => { setShowUpsell(false); useAuthModal.getState().open(); }}
                          className="w-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 font-extrabold text-xs py-3 rounded-xl transition-all"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* BUTTON STATE */
                  visual.is_premium && userState !== "premium" ? (
                    <button 
                      onClick={() => setShowUpsell(true)}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    >
                      <Crown className="w-5 h-5" />
                      Download Premium
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDownloadClick()}
                      className="w-full bg-brand hover:bg-brand/90 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      Download Visual
                    </button>
                  )
                )}
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="text-xs font-semibold text-brand-faint flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-brand font-black">{visual.download_count}</span>
                  </div>
                  <div className="text-xs font-semibold text-brand-faint flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-brand font-black">{visual.view_count}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-brand-border" />

            {/* Tags Pills Section */}
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand mb-3">
                Visual Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/visuals?q=${encodeURIComponent(tag as string)}`}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-[#f3f3f3] text-brand hover:text-brand border border-brand-border hover:border-brand shadow-sm"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM RELATED SECTIONS ================= */}
        <hr className="border-brand-border mb-6 md:mb-8" />

        <div className="flex flex-col gap-8 mb-4">
          
          {/* Section 1: Related Visuals */}
          {relatedVisuals.length > 0 && (
            <div>
              <h3 className="text-lg font-extrabold text-brand mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" />
                More from {visual.subject}
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x">
                {relatedVisuals.map((item) => (
                  <RelatedCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= MOBILE FLOATING STICKY DOWNLOAD BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border p-3 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,57,60,0.06)] md:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-brand-muted leading-none">
            {visual.subject}
          </span>
          <span className="text-xs font-extrabold text-brand line-clamp-1 mt-0.5 max-w-[150px]">
            {visual.title}
          </span>
        </div>

        {userState === "guest" && (
          <button 
            onClick={() => handleDownloadClick("mobile-guest")}
            className="flex items-center gap-1.5 bg-brand text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In to Download
          </button>
        )}

        {userState === "free" && (
          <button 
            onClick={() => handleDownloadClick("mobile-free")}
            className="flex items-center gap-1.5 bg-white border border-brand-border text-brand font-extrabold text-xs px-5 py-2.5 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Download Free
          </button>
        )}

        {userState === "premium" && (
          <button 
            onClick={() => handleDownloadClick("mobile-premium")}
            className="flex items-center gap-1.5 bg-brand text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm"
          >
            <Crown className="w-3.5 h-3.5" />
            Download HD PNG
          </button>
        )}
      </div>

      {/* Toast Feedback notifications */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand border border-brand-border text-white font-bold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <Info className="w-4 h-4 text-white" />
          {toastMessage}
        </div>
      )}

    </div>
  );
}
