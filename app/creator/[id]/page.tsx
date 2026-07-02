"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Loader2, ArrowLeft, Award, BookOpen, User, Link as LinkIcon, Sparkles, Star, Users, CheckCircle, Plus, X, Share2, ChevronDown, Filter, LayoutGrid, Tag, Layers, FileImage, Search } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import VisualCard from "@/components/VisualCard";

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const creatorId = resolvedParams.id;

  const [creator, setCreator] = useState<any>(null);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  const authModal = useAuthModal();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  // Filters State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [premiumFilter, setPremiumFilter] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string>("Recent");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function fetchCreatorData() {
      setIsLoading(true);
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch creator info
      let creatorProfile = null;
      const { data: uploader, error: uploaderErr } = await supabase
        .from("uploader_profiles")
        .select("*")
        .eq("id", creatorId)
        .single();

      if (uploader) {
        creatorProfile = uploader;
      } else {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", creatorId)
          .maybeSingle();
        
        if (prof) {
          creatorProfile = { display_name: prof.full_name || "Learnpik Creator", id: creatorId };
        }
      }

      if (!creatorProfile) {
        // Fallback for orphaned uploads so the page doesn't just error out
        creatorProfile = { 
          id: creatorId,
          display_name: "Learnpik Creator",
          short_bio: "A legacy creator account.",
        };
      }

      setCreator(creatorProfile);

      // 2. Fetch visuals
      const { data: images } = await supabase
        .from("images")
        .select("*, image_tags(*)")
        .eq("uploaded_by", creatorId)
        .eq("is_published", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (images) {
        // Map tags correctly
        const mapped = images.map((img: any) => {
          const tags = img.image_tags || [];
          return {
            ...img,
            subject: tags.find((t: any) => t.tag_type === "subject")?.tag || "General",
            grade: tags.find((t: any) => t.tag_type === "grade")?.tag || "General",
            type: tags.find((t: any) => t.tag_type === "type")?.tag || "Diagram",
          };
        });
        setVisuals(mapped);
      }

      // 3. Fetch Stats
      const { data: followData } = await supabase.rpc('get_follower_count', { cid: creatorId });
      if (followData !== null) setFollowerCount(Number(followData));

      const { data: rData } = await supabase
        .from('creator_ratings')
        .select('rating')
        .eq('creator_id', creatorId);
      if (rData && rData.length > 0) {
        const avg = rData.reduce((sum, r) => sum + r.rating, 0) / rData.length;
        setAverageRating(avg);
        setTotalRatings(rData.length);
      }

      // 4. Current User state
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
        
        // Check if following
        const { data: followRecord } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', session.user.id)
          .eq('following_id', creatorId)
          .maybeSingle();
        
        setIsFollowing(!!followRecord);

        // Check user rating
        const { data: ratingRecord } = await supabase
          .from('creator_ratings')
          .select('rating')
          .eq('rater_id', session.user.id)
          .eq('creator_id', creatorId)
          .maybeSingle();
        
        if (ratingRecord) {
          setUserRating(ratingRecord.rating);
        }
      }

      setIsLoading(false);
    }
    
    fetchCreatorData();
  }, [creatorId]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      authModal.open("signin");
      return;
    }
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', creatorId);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUser.id, following_id: creatorId });
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    }
    setIsFollowLoading(false);
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
          .eq('creator_id', creatorId);
      } else {
        await supabase
          .from('creator_ratings')
          .insert({ rater_id: currentUser.id, creator_id: creatorId, rating: val });
        setTotalRatings(prev => prev + 1);
      }
      
      setUserRating(val);
      
      // Re-fetch average by querying all ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('creator_ratings')
        .select('rating')
        .eq('creator_id', creatorId);
        
      if (!ratingsError && ratingsData) {
        const avg = ratingsData.length > 0 ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length : 0;
        setAverageRating(avg);
        setTotalRatings(ratingsData.length);
      }
      
    } catch (e) {
      console.error(e);
    }
    setIsRatingModalOpen(false);
  };

  const availableSubjects = Array.from(new Set(visuals.map(v => v.subject))).filter(Boolean);
  const availableGrades = Array.from(new Set(visuals.map(v => v.grade))).filter(Boolean);
  const availableTypes = Array.from(new Set(visuals.map(v => v.type))).filter(Boolean);

  const filteredVisuals = visuals.filter(v => {
    if (subjectFilter && v.subject !== subjectFilter) return false;
    if (gradeFilter && v.grade !== gradeFilter) return false;
    if (typeFilter && v.type !== typeFilter) return false;
    if (premiumFilter === "Premium" && !v.is_premium) return false;
    if (premiumFilter === "Free" && v.is_premium) return false;
    if (searchTerm && !v.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortFilter === "Popular") return (b.download_count || 0) - (a.download_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface pt-20">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (isNotFound || !creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface pt-20 text-center px-4">
        <h1 className="text-3xl font-black text-brand mb-4">Creator Not Found</h1>
        <p className="text-brand-muted mb-8">We couldn't find a creator with this ID.</p>
        <Link href="/" className="bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-[#0a4a52] transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <Link href="/visuals" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand font-semibold text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDEBAR: PROFILE INFO */}
          <div className="w-full lg:w-[220px] xl:w-[240px] flex-shrink-0 bg-white rounded-3xl p-5 border border-brand-border shadow-sm lg:sticky lg:top-24 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-md border-4 border-white mb-3 relative">
              {creator.display_name?.charAt(0).toUpperCase()}
            </div>
            
            {/* Name */}
            <h1 className="text-lg md:text-xl font-black text-brand tracking-tight mb-4">
              {creator.display_name}
            </h1>

            {/* Actions: Follow & Share */}
            <div className="flex items-center justify-center gap-3 mb-8 w-full">
              {(!currentUser || currentUser.id !== creatorId) && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isFollowing 
                      ? 'bg-gray-100 text-brand hover:bg-gray-200 border border-gray-200'
                      : 'bg-[#1a1a1a] hover:bg-black text-white shadow-sm'
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    "Follow"
                  )}
                </button>
              )}
              <button 
                className="p-3 rounded-2xl border border-gray-200 text-gray-500 hover:text-brand hover:bg-gray-50 transition-colors flex-shrink-0"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Line */}
            <div className="flex flex-col items-center w-full gap-4 mb-8">
              <div className="flex justify-between w-full text-sm font-semibold text-gray-500 px-2 xl:px-4">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-brand">{followerCount}</span>
                  <span className="text-[9px] uppercase tracking-wider mt-1 text-gray-400">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-brand">{visuals.length}</span>
                  <span className="text-[9px] uppercase tracking-wider mt-1 text-gray-400">Visuals</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer hover:text-amber-500 transition-colors group" onClick={() => setIsRatingModalOpen(true)}>
                  <div className="flex items-center gap-1 text-xl font-black text-brand group-hover:text-amber-500">
                    <span>{averageRating > 0 ? averageRating.toFixed(1) : '-'}</span>
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform -mt-0.5" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider mt-1 text-gray-400">({totalRatings}) Ratings</span>
                </div>
              </div>
            </div>

            <hr className="w-full border-gray-100 mb-6" />

            {/* Edu & Bio */}
            {creator.highest_qualification && (
              <p className="text-brand-muted font-bold flex items-center justify-center gap-2 text-sm mb-4 bg-[#f8f9fa] w-full py-3 rounded-2xl">
                {creator.highest_qualification}
              </p>
            )}

            {creator.short_bio && (
              <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">
                {creator.short_bio}
              </p>
            )}

            {creator.portfolio_url && (
              <a href={creator.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 py-3 rounded-2xl border border-emerald-100">
                <LinkIcon className="w-4 h-4" />
                Portfolio / Website
              </a>
            )}
          </div>

          {/* RIGHT SIDE: POSTS & FILTERS */}
          <div className="flex-1 w-full min-w-0">

      {/* Visuals Grid */}
      {/* Filter Bar & Visuals Grid */}
      <div className="w-full">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-4 mb-6 relative z-20 w-full">
          {/* Search Bar */}
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${creator.display_name}'s visuals...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
            
            {/* Pills */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button 
              onClick={() => { setSubjectFilter(null); setGradeFilter(null); setTypeFilter(null); setPremiumFilter(null); setActiveDropdown(null); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!subjectFilter && !gradeFilter && !typeFilter && !premiumFilter ? 'bg-brand text-white border-brand' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              All Visuals
            </button>
            
            {/* Subjects Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "subjects" ? null : "subjects")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${subjectFilter ? 'bg-brand/10 border-brand text-brand' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <BookOpen className="w-4 h-4" />
                {subjectFilter || "Subjects"}
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              {activeDropdown === "subjects" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-30 max-h-60 overflow-y-auto">
                  <button onClick={() => { setSubjectFilter(null); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">All Subjects</button>
                  {availableSubjects.map(sub => (
                    <button key={sub as string} onClick={() => { setSubjectFilter(sub as string); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{sub as string}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Grades Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "grades" ? null : "grades")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${gradeFilter ? 'bg-brand/10 border-brand text-brand' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Layers className="w-4 h-4" />
                {gradeFilter || "Grades"}
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              {activeDropdown === "grades" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-30 max-h-60 overflow-y-auto">
                  <button onClick={() => { setGradeFilter(null); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">All Grades</button>
                  {availableGrades.map(grade => (
                    <button key={grade as string} onClick={() => { setGradeFilter(grade as string); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{grade as string}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Types Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "types" ? null : "types")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${typeFilter ? 'bg-brand/10 border-brand text-brand' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <FileImage className="w-4 h-4" />
                {typeFilter || "Types"}
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              {activeDropdown === "types" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-30 max-h-60 overflow-y-auto">
                  <button onClick={() => { setTypeFilter(null); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">All Types</button>
                  {availableTypes.map(type => (
                    <button key={type as string} onClick={() => { setTypeFilter(type as string); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{type as string}</button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Premium Filter */}
            <button 
              onClick={() => setPremiumFilter(premiumFilter === "Premium" ? null : "Premium")}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${premiumFilter === "Premium" ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Sparkles className={`w-4 h-4 ${premiumFilter === "Premium" ? 'text-amber-500' : 'text-gray-400'}`} />
              Premium
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-brand transition-colors"
            >
              {sortFilter}
              <ChevronDown className="w-4 h-4" />
            </button>
            {activeDropdown === "sort" && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-30">
                <button onClick={() => { setSortFilter("Recent"); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Recent</button>
                <button onClick={() => { setSortFilter("Popular"); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Popular</button>
              </div>
            )}
          </div>
          </div>
        </div>

        {filteredVisuals.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {filteredVisuals.map((visual) => (
              <div key={visual.id} className="break-inside-avoid">
                <VisualCard
                  visual={visual}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-brand-border shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-brand mb-2">No Visuals Yet</h3>
            <p className="text-brand-muted font-medium">This creator hasn't published any visuals.</p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>

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
                {userRating > 0 ? "Update your rating for" : "How would you rate"} <span className="text-brand font-bold">{creator.display_name}</span>?
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
