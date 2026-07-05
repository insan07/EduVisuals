import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Folder, Clock, Sparkles, ChevronRight, FileImage } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ImageCard from "@/components/ImageCard";

export default function DiscoveryHub() {
  const [recentlySeen, setRecentlySeen] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscoveryData() {
      setIsLoading(true);

      // 1. Fetch Recently Seen from localStorage
      try {
        const recentViews = JSON.parse(localStorage.getItem("recently_seen_visuals") || "[]");
        if (recentViews.length > 0) {
          const recentIds = recentViews.map((item: any) => typeof item === 'string' ? item : item.id);
          const { data: recentImages } = await supabase
            .from("images")
            .select("*, image_tags(*)")
            .in("id", recentIds);
          
          if (recentImages) {
            // Sort to match localStorage order
            const sorted = recentViews.map((item: any) => {
              const id = typeof item === 'string' ? item : item.id;
              const img = recentImages.find(i => i.id === id);
              if (img) {
                return { ...img, viewedAt: item.viewedAt };
              }
              return null;
            }).filter(Boolean);
            setRecentlySeen(sorted);
          }
        }
      } catch (e) {
        console.error("Error loading recently seen", e);
      }

      // 2. Fetch Suggestions (From creators user follows)
      let suggImages: any[] = [];
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: follows } = await supabase
          .from("follows")
          .select("creator_id")
          .eq("follower_id", session.user.id);
          
        if (follows && follows.length > 0) {
          const creatorIds = follows.map(f => f.creator_id);
          const { data } = await supabase
            .from("images")
            .select("*, image_tags(*)")
            .in("uploaded_by", creatorIds)
            .eq("status", "approved")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(10);
          if (data) suggImages = data;
        }
      }
      
      // Fallback if not logged in or no following visuals
      if (suggImages.length === 0) {
        const { data } = await supabase
          .from("images")
          .select("*, image_tags(*)")
          .eq("is_published", true)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(8);
        if (data) suggImages = data;
      }
      
      setSuggestions(suggImages);

      // 3. Fetch Collections for the logged-in user
      if (session) {
        const { data: userCollections } = await supabase
          .from("saved_collections")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (userCollections) setCollections(userCollections);
      }

      setIsLoading(false);
    }

    if (isSupabaseConfigured()) {
      fetchDiscoveryData();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-12 mt-4 animate-pulse">
        <div className="h-64 bg-gray-100 rounded-3xl" />
        <div className="h-64 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16 mt-6 pb-12">
      
      {/* RECENTLY SEEN */}
      {recentlySeen.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Recently Viewed
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {recentlySeen.map(visual => {
              const subjectTag = visual.image_tags?.find((t: any) => t.tag_type === 'subject')?.tag;
              const gradeTag = visual.image_tags?.find((t: any) => t.tag_type === 'grade')?.tag;
              const typeTag = visual.image_tags?.find((t: any) => t.tag_type === 'type')?.tag;

              return (
                <div key={visual.id} className="w-[200px] md:w-[240px] flex-shrink-0 snap-start flex flex-col gap-2">
                  <ImageCard
                    id={visual.id}
                    title={visual.title}
                    thumbnailUrl={visual.thumbnail_url || visual.file_url}
                    subject={subjectTag || "General"}
                    grade={gradeTag || "General"}
                    type={typeTag || "Diagram"}
                    isPremium={visual.is_premium || false}
                    downloadCount={visual.download_count || 0}
                    hasMultipleImages={visual.additional_urls && visual.additional_urls.length > 0}
                  />
                  {visual.viewedAt && (
                    <span className="text-[10px] text-gray-400 font-medium px-1">
                      Opened {formatDistanceToNow(new Date(visual.viewedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SUGGESTIONS FOR YOU */}
      {suggestions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Suggestions for You
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {suggestions.map(visual => {
              const subjectTag = visual.image_tags?.find((t: any) => t.tag_type === 'subject')?.tag;
              const gradeTag = visual.image_tags?.find((t: any) => t.tag_type === 'grade')?.tag;
              const typeTag = visual.image_tags?.find((t: any) => t.tag_type === 'type')?.tag;

              return (
                <div key={visual.id} className="w-[200px] md:w-[240px] flex-shrink-0 snap-start">
                  <ImageCard
                    id={visual.id}
                    title={visual.title}
                    thumbnailUrl={visual.thumbnail_url || visual.file_url}
                    subject={subjectTag || "General"}
                    grade={gradeTag || "General"}
                    type={typeTag || "Diagram"}
                    isPremium={visual.is_premium || false}
                    downloadCount={visual.download_count || 0}
                    hasMultipleImages={visual.additional_urls && visual.additional_urls.length > 0}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}


      {/* YOUR COLLECTIONS */}
      {collections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Your Collections
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {collections.map(col => (
              <Link 
                key={col.id} 
                href={`/collections/${col.id}`}
                className="group flex items-center gap-3 bg-white border border-gray-200 px-4 py-4 rounded-2xl shadow-sm hover:shadow-md hover:border-brand/40 transition-all w-full"
              >
                <Folder className="w-5 h-5 text-gray-400 group-hover:text-brand transition-colors" />
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{col.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}


    </div>
  );
}
