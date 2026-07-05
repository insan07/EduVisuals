"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { downloadWithWatermark } from "@/lib/watermark";
import { formatDistanceToNow } from "date-fns";
import { useAuthModal } from "@/store/useAuthModal";
import { useCollectionModal } from "@/store/useCollectionModal";
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
  ChevronLeft,
  ChevronDown,
  BookOpen,
  FileImage,
  MoreHorizontal,
  Flag,
  X,
  Edit2,
  Trash2,
  Bookmark,
  UserCheck,
  BadgeCheck,
  Star,
} from "lucide-react";
import { GRADES, SUBJECTS, TYPES, SYLLABUSES, MEDIUMS } from "@/lib/constants";
import EditVisualModal from "@/components/EditVisualModal";
import { PremiumLoader } from "@/components/PremiumLoader";
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ImageDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const currentId = resolvedParams.id;

  const authModal = useAuthModal();
  const collectionModal = useCollectionModal();

  // Real data state
  const [visual, setVisual] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [creator, setCreator] = useState<any>(null);
  const [creatorRating, setCreatorRating] = useState<number>(0);
  const [creatorTotalRatings, setCreatorTotalRatings] = useState<number>(0);
  
  const [userState, setUserState] = useState<"guest" | "free" | "premium">("guest");
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editType, setEditType] = useState("");
  const [editSyllabus, setEditSyllabus] = useState("");
  const [editMedium, setEditMedium] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  
  const [isLiked, setIsLiked] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy Link");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showUpsell, setShowUpsell] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  
  const [relatedVisuals, setRelatedVisuals] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const [visualRating, setVisualRating] = useState(0);
  const [hoverVisualRating, setHoverVisualRating] = useState(0);
  const [hasRatedVisual, setHasRatedVisual] = useState(false);

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
      let userRole = "guest";
      let userId = "";

      if (!session) {
        setUserState("guest");
      } else {
        userId = session.user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier, role")
          .eq("id", userId)
          .single();
        userRole = profile?.role || "free_user";
        if (profile?.tier === "Premium") setUserState("premium");
        else setUserState("free");
        setCurrentUser({ id: userId, role: userRole });
      }

      // 2. Fetch image
      const { data: image, error } = await supabase
        .from("images")
        .select("*, image_tags(*)")
        .eq("id", currentId)
        .single();

      if (error || !image) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      // 3. Authorization check for unpublished or unapproved
      const isOwner = userId === image.uploaded_by;
      const isAdminOrModerator = userRole === "admin" || userRole === "moderator" || userRole === "team_creator";
      
      if (!image.is_published || image.status !== "approved") {
        if (!isOwner && !isAdminOrModerator) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }
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
      setEditTitle(mappedImage.title || "");
      setEditDescription(mappedImage.description || "");

      // Fetch creator
      let creatorProfile = null;
      if (mappedImage.uploaded_by) {
        // Attempt to fetch from uploader_profiles
        // Note: RLS might block this if public select isn't enabled on uploader_profiles.
        // We'll add a public select policy via SQL later, but for now we fallback gracefully.
        const { data: uploader } = await supabase
          .from("uploader_profiles")
          .select("display_name, highest_qualification, short_bio, portfolio_url, profiles(avatar_url)")
          .eq("id", mappedImage.uploaded_by)
          .maybeSingle();
        
        if (uploader) {
          creatorProfile = { 
            ...uploader, 
            id: mappedImage.uploaded_by,
            avatar_url: uploader.profiles ? (uploader.profiles as any).avatar_url : null
          };
        } else {
          // fallback to profiles if uploader_profiles fails (e.g. RLS or not onboarded)
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", mappedImage.uploaded_by)
            .maybeSingle();
            
          creatorProfile = { 
            display_name: prof?.full_name || "Learnpik Creator", 
            id: mappedImage.uploaded_by,
            avatar_url: prof?.avatar_url
          };
        }
      } else {
        // Fallback for older images where uploaded_by is null
        creatorProfile = {
          display_name: "Learnpik Official",
          highest_qualification: "Platform Admin",
          short_bio: "The official account of Learnpik.",
          id: "official"
        };
      }
      setCreator(creatorProfile);

      // Check follow status
      if (userId && creatorProfile && creatorProfile.id !== "official") {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", userId)
          .eq("following_id", creatorProfile.id)
          .maybeSingle();
        if (followData) setIsFollowing(true);
      }

      // Fetch creator ratings
      if (creatorProfile && creatorProfile.id !== "official") {
        const { data: rData } = await supabase
          .from("creator_ratings")
          .select("rating, rater_id")
          .eq("creator_id", creatorProfile.id);
        if (rData && rData.length > 0) {
          const avg = rData.reduce((sum, r) => sum + r.rating, 0) / rData.length;
          setCreatorRating(avg);
          setCreatorTotalRatings(rData.length);
          if (userId) {
            const uRating = rData.find((r) => r.rater_id === userId);
            if (uRating) setUserRating(uRating.rating);
          }
        }
      }

      setIsLoading(false);

      // 3. Track in localStorage for "Recently Seen" feature
      try {
        const key = "recently_seen_visuals";
        let recentViews = JSON.parse(localStorage.getItem(key) || "[]");
        
        // Convert old array of strings to array of objects if needed
        if (recentViews.length > 0 && typeof recentViews[0] === 'string') {
           recentViews = recentViews.map((id: string) => ({ id, viewedAt: new Date().toISOString() }));
        }
        
        // Remove if already exists, then push to front
        recentViews = recentViews.filter((item: any) => item.id !== currentId);
        recentViews.unshift({ id: currentId, viewedAt: new Date().toISOString() });
        
        // Keep max 20 items
        if (recentViews.length > 20) recentViews = recentViews.slice(0, 20);
        localStorage.setItem(key, JSON.stringify(recentViews));
      } catch (e) {
        console.error("Failed to save to recently seen", e);
      }

      // 4. Increment view count
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

  const handleFollow = async () => {
    if (userState === "guest") {
      useAuthModal.getState().open("signin");
      return;
    }
    if (!currentUser || !creator || creator.id === "official") return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", creator.id);
          
        if (error) throw error;
        
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: creator.id
          });
          
        if (error) throw error;
        
        setIsFollowing(true);
      }
    } catch (err: any) {
      console.error("Error toggling follow", err);
      alert(err?.message || "Failed to follow creator. Please try again.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleRateSubmit = async (val: number) => {
    if (!currentUser) {
      authModal.open("signin");
      setIsRatingModalOpen(false);
      return;
    }
    try {
      if (userRating > 0) {
        await supabase
          .from('creator_ratings')
          .update({ rating: val })
          .eq('rater_id', currentUser.id)
          .eq('creator_id', creator.id);
      } else {
        await supabase
          .from('creator_ratings')
          .insert({ rater_id: currentUser.id, creator_id: creator.id, rating: val });
        setCreatorTotalRatings(prev => prev + 1);
      }
      setUserRating(val);
      // Re-fetch average
      const { data: ratingsData } = await supabase
        .from('creator_ratings')
        .select('rating')
        .eq('creator_id', creator.id);
      if (ratingsData) {
        const avg = ratingsData.length > 0 ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length : 0;
        setCreatorRating(avg);
        setCreatorTotalRatings(ratingsData.length);
      }
    } catch (e) {
      console.error(e);
    }
    setIsRatingModalOpen(false);
  };

  const handleDeleteVisual = async () => {
    if (!confirm("Are you sure you want to delete this visual? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("images").delete().eq("id", currentId);
      if (error) throw error;
      alert("Visual deleted successfully.");
      window.location.href = "/visuals";
    } catch (err) {
      alert("Error deleting visual.");
    }
  };

  const openEditModal = () => {
    if (!visual) return;
    setEditTitle(visual.title || "");
    setEditDescription(visual.description || "");
    setEditIsPremium(visual.is_premium || false);
    
    setEditGrade(visual.grade || "");
    setEditSubject(visual.subject || "");
    setEditType(visual.type || "");
    setEditSyllabus(visual.syllabus || "");
    setEditMedium(visual.medium || "");
    
    const tags = visual.customTags || [];
    setEditTags(tags);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visual) return;
    setIsSavingEdit(true);

    try {
      // 1. Update images table
      const { error: updateError } = await supabase
        .from("images")
        .update({ 
          title: editTitle, 
          description: editDescription,
          is_premium: editIsPremium
        })
        .eq("id", visual.id);

      if (updateError) throw updateError;

      // 2. Delete old tags
      const { error: deleteError } = await supabase
        .from("image_tags")
        .delete()
        .eq("image_id", visual.id);
        
      if (deleteError) throw deleteError;

      // 3. Insert new tags
      const newTags = [];
      if (editGrade) newTags.push({ image_id: visual.id, tag_type: "grade", tag: editGrade });
      if (editSubject) newTags.push({ image_id: visual.id, tag_type: "subject", tag: editSubject });
      if (editType) newTags.push({ image_id: visual.id, tag_type: "type", tag: editType });
      if (editSyllabus) newTags.push({ image_id: visual.id, tag_type: "syllabus", tag: editSyllabus });
      if (editMedium) newTags.push({ image_id: visual.id, tag_type: "medium", tag: editMedium });
      
      editTags.forEach(tag => {
        if (tag) newTags.push({ image_id: visual.id, tag_type: "custom", tag });
      });

      if (newTags.length > 0) {
        const { error: insertError } = await supabase
          .from("image_tags")
          .insert(newTags);
        if (insertError) throw insertError;
      }
      
      // Update local state
      setVisual({ 
        ...visual, 
        title: editTitle, 
        description: editDescription,
        is_premium: editIsPremium,
        grade: editGrade,
        subject: editSubject,
        type: editType,
        syllabus: editSyllabus,
        medium: editMedium,
        customTags: editTags
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error updating visual.");
    } finally {
      setIsSavingEdit(false);
    }
  };

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

  const handleDownloadClick = async (action: "all" | "current" = "current") => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      useAuthModal.getState().open("signin");
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
      
      if (res.status === 401) { useAuthModal.getState().open("signin"); return; }
      if (result.requiresPremium) { window.location.href = "/pricing"; return; }
      if (result.limitReached) { alert("Daily limit reached (5/day). Upgrade to Premium!"); return; }
      
      if (result.downloadUrl) {
        const allImageUrls = [visual.file_url, ...(visual.additional_urls || [])].filter(Boolean);
        const urlsToDownload = action === "all" ? allImageUrls : [allImageUrls[currentImageIndex] || visual.file_url];
        
        triggerToast(urlsToDownload.length > 1 ? "Downloading images..." : "Download started!");

        for (let i = 0; i < urlsToDownload.length; i++) {
          const url = urlsToDownload[i];
          const suffix = urlsToDownload.length > 1 ? `-${i+1}` : "";
          const filename = `${visual.title || "learnpik"}${suffix}`;

          if (!result.isPremiumUser) {
            try {
              await downloadWithWatermark(url, filename);
            } catch (e) {
              console.error("Watermark failed, falling back", e);
            }
          } else {
            const urlToDownload = url.includes('?') ? `${url}&download=` : `${url}?download=`;
            const a = document.createElement("a");
            a.href = urlToDownload;
            a.download = filename;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          
          if (urlsToDownload.length > 1) await new Promise(r => setTimeout(r, 500));
        }
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
      className="group block relative w-full rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: "linear-gradient(135deg, #e8f5f6, #d0ecee)" }}
    >
      {item.thumbnailUrl || item.file_url ? (
        <img 
          src={item.thumbnailUrl || item.file_url} 
          alt={item.title}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          draggable={false} 
          className="w-full h-auto max-h-[300px] sm:max-h-[400px] block object-cover object-top" 
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center">
          <FileImage size={40} style={{ color: "rgba(7,50,56,0.25)" }} />
        </div>
      )}

      {item.isPremium && (
        <div className="absolute top-3 left-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1 z-10 shadow-sm">
          <Crown size={12} /> Premium
        </div>
      )}

      {/* Overlay (Hover only, hidden on mobile) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-between bg-black/40">
        <div className="relative z-10 flex justify-end p-3 pointer-events-auto">
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); collectionModal.open(item.id, item.title); }}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-sm transition-colors shadow-sm"
            >
              <Heart size={16} fill="none" stroke="currentColor" />
            </button>
            <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-sm transition-colors shadow-sm flex items-center justify-center">
              <Download size={16} />
            </button>
          </div>
        </div>
        <div className="relative z-10 p-4 pointer-events-auto mt-auto">
          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 mb-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {item.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {item.subject && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {item.subject}
              </span>
            )}
            {item.grade && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {item.grade}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  const renderActionButtons = (className: string) => (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      {/* Save Button */}
      <button 
        onClick={() => collectionModal.open(visual.id, visual.title)}
        className="p-1 sm:p-2 text-gray-400 hover:text-brand transition-colors"
        title="Save Visual"
      >
        <Bookmark className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
      </button>

      {/* Share Button (opens dropdown) */}
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          className="p-1 sm:p-2 text-gray-400 hover:text-brand transition-colors"
          title="Share"
        >
          <Share2 className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-48 bg-white border border-brand-border rounded-xl shadow-lg z-30 py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <button 
              onClick={() => { handleCopyLink(); setIsDropdownOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Check out this educational visual aid: ${visual.title} - https://learnpik.com/image/${visual.id}`
              )}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                `https://learnpik.com/image/${visual.id}`
              )}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on Facebook
            </a>
          </div>
        )}
      </div>

      {/* More Actions Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
          onBlur={() => setTimeout(() => setIsMoreDropdownOpen(false), 200)}
          className="p-1 sm:p-2 text-gray-400 hover:text-brand transition-colors"
          title="More Actions"
        >
          <MoreHorizontal className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
        </button>
        {isMoreDropdownOpen && (
          <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-48 bg-white border border-brand-border rounded-xl shadow-lg z-30 py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {currentUser && (currentUser.id === visual.uploaded_by || currentUser.role === 'admin' || currentUser.role === 'moderator') ? (
              <>
                <button 
                  onClick={() => { openEditModal(); setIsMoreDropdownOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Visual
                </button>
                <button 
                  onClick={() => { handleDeleteVisual(); setIsMoreDropdownOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Visual
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setIsReportModalOpen(true); setIsMoreDropdownOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
              >
                <Flag className="w-3.5 h-3.5" /> Report Issue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand pb-20 md:pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-6 flex-1 flex flex-col w-full min-w-0">

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
                      <span>Learnpik.com</span>
                      <span>Learnpik.com</span>
                      <span>Learnpik.com</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Visual Display */}
              {(() => {
                const imageUrls = [visual.file_url, ...(visual.additional_urls || [])].filter(Boolean);
                const currentImgUrl = imageUrls[currentImageIndex] || visual.thumbnail_url || visual.file_url;
                const hasMultiple = imageUrls.length > 1;

                return (
                  <>
                    {currentImgUrl ? (
                      <img 
                        src={currentImgUrl} 
                        alt={visual.title} 
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        draggable={false} 
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

                    {/* Navigation Controls */}
                    {hasMultiple && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
                          }}
                          className="absolute left-2 md:left-4 z-30 bg-white/80 hover:bg-white text-brand p-2 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-2 md:right-4 z-30 bg-white/80 hover:bg-white text-brand p-2 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Image Indicator Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {imageUrls.map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}

              {/* Premium badge on image */}
              {visual.is_premium && (
                <div className="absolute top-4 left-4 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-md px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 z-30 shadow-sm pointer-events-none select-none">
                  <Crown size={14} /> Premium
                </div>
              )}
            </div>

            {/* Stats and Tags Row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-1">
              
              {/* Tags (Hidden on mobile) */}
              <div className="hidden sm:flex flex-wrap gap-2 md:gap-2.5">
                {tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/visuals?q=${encodeURIComponent(tag as string)}`}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#555] hover:text-[#333] transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Mobile Actions and Stats */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                
                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0 py-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-faint" title="Downloads">
                    <Download className="w-4 h-4" />
                    <span className="text-brand font-black text-sm">{visual.download_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-faint" title="Views">
                    <Info className="w-4 h-4" />
                    <span className="text-brand font-black text-sm">{visual.view_count}</span>
                  </div>
                </div>

                {/* Action Buttons (Visible only on mobile) */}
                {renderActionButtons("flex sm:hidden")}
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: INFO + PANEL (40%) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
            
            <div>
              {/* Actions & Download Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              
              {/* Action Buttons Row (Hidden on mobile) */}
              {renderActionButtons("hidden sm:flex")}

              {/* Download Button (Right) */}
              <div className="w-full sm:w-auto sm:ml-auto relative">
                {(() => {
                  const hasMultiple = (visual.additional_urls || []).length > 0;
                  
                  if (visual.is_premium && userState !== "premium") {
                    return (
                      <button 
                        onClick={() => setShowUpsell(true)}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <Crown className="w-4 h-4" />
                        Download Premium
                      </button>
                    );
                  }

                  if (!hasMultiple) {
                    return (
                      <button 
                        onClick={() => handleDownloadClick("current")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <Download className="w-4 h-4" />
                        Download Visual
                      </button>
                    );
                  }

                  return (
                    <div className="flex w-full">
                      <button 
                        onClick={() => handleDownloadClick("current")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-2.5 px-4 rounded-l-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Visual
                      </button>
                      <button
                        onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                        onBlur={() => setTimeout(() => setIsDownloadDropdownOpen(false), 200)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 rounded-r-xl transition-all shadow-md flex items-center justify-center border-l border-emerald-800"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {isDownloadDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-border rounded-xl shadow-lg z-30 py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                          <button 
                            onMouseDown={(e) => { e.preventDefault(); handleDownloadClick("current"); setIsDownloadDropdownOpen(false); }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
                          >
                            <FileImage className="w-3.5 h-3.5" /> Download Current Image
                          </button>
                          <button 
                            onMouseDown={(e) => { e.preventDefault(); handleDownloadClick("all"); setIsDownloadDropdownOpen(false); }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] transition-colors w-full text-left"
                          >
                            <Download className="w-3.5 h-3.5" /> Download All Images
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Main Title Area (Moved below buttons) */}
            <div className="w-full mb-6 mt-2">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-brand leading-tight">
                {visual.title}
              </h1>
            </div>

            {/* UPSELL STATE */}
            {showUpsell && (
              <div className="border border-amber-200 bg-amber-50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm animate-in fade-in zoom-in duration-200 mb-2">
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
                      onClick={() => { setShowUpsell(false); useAuthModal.getState().open("signin"); }}
                      className="w-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 font-extrabold text-xs py-3 rounded-xl transition-all"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-brand-faint mb-4 uppercase tracking-wide">
                <span>{visual.subject}</span>
                <span>•</span>
                <span>{visual.grade}</span>
                <span>•</span>
                <span>{visual.type}</span>
              </div>

              {visual.description && (
                <p className="text-sm text-brand-faint font-medium mb-2 break-words whitespace-normal leading-relaxed">
                  {visual.description}
                </p>
              )}
            </div>

            {/* Visual Rating Section */}
            <div className="mt-2">
              <h3 className="font-extrabold text-brand mb-1 text-sm sm:text-base">Rate this visual</h3>
              <p className="text-[11px] sm:text-xs text-brand-faint mb-2 font-medium">Tell others what you think about this image.</p>
              <div className="flex gap-1 sm:gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => {
                      if (!currentUser) {
                        useAuthModal.getState().open("signin");
                        return;
                      }
                      setVisualRating(star);
                      setHasRatedVisual(true);
                    }}
                    onMouseEnter={() => setHoverVisualRating(star)}
                    onMouseLeave={() => setHoverVisualRating(0)}
                    className="p-1 -ml-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                        star <= (hoverVisualRating || visualRating) 
                          ? 'text-[#F59E0B] fill-current' 
                          : 'text-gray-300'
                      }`} 
                      strokeWidth={star <= (hoverVisualRating || visualRating) ? 1 : 1.5}
                    />
                  </button>
                ))}
              </div>
              {hasRatedVisual && (
                <p className="text-[11px] font-semibold text-emerald-600 mt-2 animate-in fade-in">
                  Thanks for your feedback!
                </p>
              )}
            </div>

            <hr className="border-brand-border mt-2" />

            {/* CREATOR CARD */}
            {creator && (
              <div className="flex items-center justify-between mb-2 mt-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Profile Image */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0 overflow-hidden shadow-sm">
                    {creator.avatar_url ? (
                      <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
                    ) : (
                      creator.display_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Name & Badge */}
                  <div className="flex flex-col justify-center">
                    <Link href={`/creator/${creator.id}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                      <h4 className="font-extrabold text-brand text-base sm:text-[17px] leading-tight">
                        {creator.display_name}
                      </h4>
                      <BadgeCheck className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" fill="#2563eb" color="white" />
                    </Link>
                    <div className="mt-1">
                      {creatorTotalRatings > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-brand-faint font-bold">
                            {creatorRating.toFixed(1)}
                          </span>
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F59E0B] fill-current -mt-0.5" />
                          <span className="text-xs text-brand-faint font-medium">({creatorTotalRatings})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-brand-faint font-medium flex items-center gap-1">No ratings yet</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Follow Button */}
                {(!currentUser || currentUser.id !== creator.id) && creator.id !== "official" && (
                  <button 
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`font-bold uppercase text-[10px] sm:text-[11px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all shrink-0 tracking-wide border ${
                      isFollowing 
                        ? "bg-brand/10 text-brand border-brand/20 hover:bg-brand/20" 
                        : "bg-brand text-white border-brand hover:bg-brand/90 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isFollowLoading ? "..." : isFollowing ? "FOLLOWING" : "FOLLOW"}
                  </button>
                )}
              </div>
            )}

            {/* Mobile Tags (Only on mobile) */}
            {tags && tags.length > 0 && (
              <div className="flex sm:hidden flex-wrap gap-1.5 mt-2 mb-4">
                {tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/visuals?q=${encodeURIComponent(tag as string)}`}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#555] hover:text-[#333] transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ================= BOTTOM RELATED SECTIONS ================= */}
        <hr className="border-brand-border mb-6 md:mb-8" />

        <div className="flex flex-col gap-8 mb-4">
          
          {/* Section 1: Related Visuals */}
          {relatedVisuals.length > 0 && (
            <div>
              <h3 className="text-lg font-extrabold text-brand mb-6">
                More like this
              </h3>
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4 pb-4">
                {relatedVisuals.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <RelatedCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= MOBILE FLOATING STICKY DOWNLOAD BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border p-3 flex items-center justify-center gap-3 shadow-[0_-4px_16px_rgba(0,57,60,0.06)] md:hidden">

        {userState === "guest" && (
          <button 
            onClick={() => handleDownloadClick("current")}
            className="flex items-center gap-1.5 bg-brand text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In to Download
          </button>
        )}

        {userState === "free" && (
          <button 
            onClick={() => handleDownloadClick("current")}
            className="flex items-center gap-1.5 bg-white border border-brand-border text-brand font-extrabold text-xs px-5 py-2.5 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Download Free
          </button>
        )}

        {userState === "premium" && (
          <button 
            onClick={() => handleDownloadClick("current")}
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

      <EditVisualModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        isSaving={isSavingEdit}
        editTitle={editTitle} setEditTitle={setEditTitle}
        editDescription={editDescription} setEditDescription={setEditDescription}
        editGrade={editGrade} setEditGrade={setEditGrade}
        editSubject={editSubject} setEditSubject={setEditSubject}
        editType={editType} setEditType={setEditType}
        editSyllabus={editSyllabus} setEditSyllabus={setEditSyllabus}
        editMedium={editMedium} setEditMedium={setEditMedium}
        editTags={editTags} setEditTags={setEditTags}
        editIsPremium={editIsPremium} setEditIsPremium={setEditIsPremium}
      />

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8 text-center border-b border-gray-100">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Report content</h2>
              <p className="text-gray-600 font-medium">Send your feedback and we'll use this information to improve.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Why are you reporting this?</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="" disabled>Select an option</option>
                  <option value="inaccurate">Inaccurate scientific/educational content</option>
                  <option value="copyright">Copyright violation</option>
                  <option value="inappropriate">Inappropriate or offensive content</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="quality">Poor image quality</option>
                  <option value="other">Other issue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Details (optional)</label>
                <textarea 
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Which issue have you found? Be as specific as possible."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/50 flex justify-end border-t border-gray-100">
              <button 
                disabled={!reportReason}
                onClick={() => {
                  const body = `Reason: ${reportReason}\n\nDetails:\n${reportDetails}\n\n---\nImage ID: ${visual.id}\nTitle: ${visual.title}`;
                  window.location.href = `mailto:info@learnpik.com?subject=Report Issue: ${visual.title}&body=${encodeURIComponent(body)}`;
                  setIsReportModalOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="bg-blue-500 disabled:bg-blue-300 hover:bg-blue-600 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsRatingModalOpen(false)} />
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="absolute top-4 right-4 text-brand-faint hover:text-brand transition-colors bg-brand-surface rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
                <Star className="w-8 h-8 fill-amber-500" />
              </div>
              <h3 className="text-xl font-black text-brand mb-1">Rate Creator</h3>
              <p className="text-sm font-medium text-brand-faint leading-relaxed">
                {userRating > 0 ? "Update your rating for" : "How would you rate"} <span className="text-brand font-bold">{creator?.display_name}</span>?
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleRateSubmit(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      (hoveredStar || userRating) >= star 
                        ? 'text-amber-500 fill-amber-500 drop-shadow-sm' 
                        : 'text-gray-200 fill-gray-200'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-[10px] font-black text-brand-faint uppercase tracking-widest bg-brand-surface py-2 rounded-lg">
              Click a star to submit
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
