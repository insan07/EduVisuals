"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Loader2, ArrowLeft, Award, BookOpen, User, Link as LinkIcon, Sparkles, Star, Users, CheckCircle, Plus, X } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import ImageCard from "@/components/ImageCard";

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
          .single();
        if (prof) {
          creatorProfile = { display_name: prof.full_name || "EduVisuals Creator" };
        }
      }

      if (!creatorProfile) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
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

      const { data: ratingData } = await supabase.rpc('get_creator_rating_stats', { cid: creatorId });
      if (ratingData && ratingData.length > 0) {
        setAverageRating(Number(ratingData[0].avg_rating) || 0);
        setTotalRatings(Number(ratingData[0].total_ratings) || 0);
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
      
      // Re-fetch average
      const { data: ratingData } = await supabase.rpc('get_creator_rating_stats', { cid: creatorId });
      if (ratingData && ratingData.length > 0) {
        setAverageRating(Number(ratingData[0].avg_rating) || 0);
      }
      
    } catch (e) {
      console.error(e);
    }
    setIsRatingModalOpen(false);
  };

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
      {/* Header Section */}
      <div className="relative bg-white border-b border-brand-border pt-24 md:pt-32 pb-16">
        <div className="absolute inset-0 top-0 h-48 bg-gradient-to-br from-[#073238] to-[#041a1d] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/visuals" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-4xl md:text-5xl shadow-xl border-4 border-white flex-shrink-0">
              {creator.display_name?.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-brand tracking-tight">
                  {creator.display_name}
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/5 border border-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Verified Creator
                </div>
              </div>

              {creator.highest_qualification && (
                <p className="text-brand-muted font-bold flex items-center gap-2 text-sm mb-4">
                  <Award className="w-4 h-4 text-emerald-600" />
                  {creator.highest_qualification}
                </p>
              )}

              {creator.short_bio && (
                <p className="text-brand-faint font-medium text-sm md:text-base max-w-3xl leading-relaxed mb-6">
                  {creator.short_bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {creator.portfolio_url && (
                  <a href={creator.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-brand hover:text-emerald-600 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    Portfolio / Website
                  </a>
                )}
                
                {creator.subject_areas && creator.subject_areas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {creator.subject_areas.slice(0, 5).map((subject: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold">
                        {subject}
                      </span>
                    ))}
                    {creator.subject_areas.length > 5 && (
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold">
                        +{creator.subject_areas.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side stats/actions */}
            <div className="md:ml-auto flex flex-col items-center md:items-end gap-6 mt-6 md:mt-0 w-full md:w-auto">
              
              {/* Glass Stats */}
              <div className="flex items-center gap-6 bg-white/40 backdrop-blur-md border border-brand-border p-4 rounded-2xl shadow-sm w-full md:w-auto justify-center">
                <div className="text-center">
                  <p className="text-brand font-black text-xl">{visuals.length}</p>
                  <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Visuals</p>
                </div>
                <div className="w-px h-8 bg-brand-border" />
                <div className="text-center">
                  <p className="text-brand font-black text-xl">{followerCount}</p>
                  <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Followers</p>
                </div>
                <div className="w-px h-8 bg-brand-border" />
                <div 
                  className="text-center cursor-pointer group"
                  onClick={() => setIsRatingModalOpen(true)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-brand font-black text-xl">{averageRating > 0 ? averageRating.toFixed(1) : '-'}</p>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                    {totalRatings} Ratings
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              {(!currentUser || currentUser.id !== creatorId) && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                    isFollowing 
                      ? 'bg-brand-surface text-brand border-2 border-brand/20 hover:border-brand/40 shadow-sm'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Following
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-black text-brand mb-8 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-500" />
          Published Visuals <span className="text-brand-muted font-bold text-lg">({visuals.length})</span>
        </h2>

        {visuals.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {visuals.map((visual) => (
              <div key={visual.id} className="break-inside-avoid">
                <ImageCard
                  id={visual.id}
                  title={visual.title}
                  thumbnailUrl={visual.thumbnail_url || visual.file_url}
                  subject={visual.subject}
                  grade={visual.grade}
                  type={visual.type}
                  isPremium={visual.is_premium}
                  downloadCount={visual.download_count || 0}
                  hasMultipleImages={visual.additional_urls && visual.additional_urls.length > 0}
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
