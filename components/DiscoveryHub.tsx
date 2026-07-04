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
    <div className="flex flex-col gap-8 mt-2 pb-8">
      
      {/* RECENTLY SEEN */}
      {recentlySeen.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-[#00393c] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8f5f6] to-[#d0ecee] flex items-center justify-center shadow-sm border border-[#073238]/10">
                <Clock className="w-4 h-4 text-[#073238]" />
              </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-[#00393c] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8f5f6] to-[#d0ecee] flex items-center justify-center shadow-sm border border-[#073238]/10">
                <Sparkles className="w-4 h-4 text-[#073238]" />
              </div>
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

      {/* POPULAR COLLECTIONS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-[#00393c] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8f5f6] to-[#d0ecee] flex items-center justify-center shadow-sm border border-[#073238]/10">
              <Folder className="w-4 h-4 text-[#073238]" />
            </div>
            Popular Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 1, title: "Biology Mind Maps", count: "1,240 Visuals", image: "/mindmap.png", link: "/visuals?q=biology" },
            { id: 2, title: "Kids Worksheets", count: "850 Visuals", image: "/kids.png", link: "/visuals?q=kids" },
            { id: 3, title: "Physics Cheat Sheets", count: "420 Visuals", image: "/cheatsheet.png", link: "/visuals?q=physics" },
          ].map(col => (
            <Link href={col.link} key={col.id} className="group relative h-40 w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block border border-gray-200">
              <img src={col.image} alt={col.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-start justify-end z-10">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 shadow-sm">{col.count}</span>
                <h3 className="text-lg font-bold text-white tracking-tight">{col.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* YOUR COLLECTIONS */}
      {collections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-[#00393c] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8f5f6] to-[#d0ecee] flex items-center justify-center shadow-sm border border-[#073238]/10">
                <Folder className="w-4 h-4 text-[#073238]" />
              </div>
              Your Collections
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {collections.map(col => (
              <Link 
                key={col.id} 
                href={`/collections/${col.id}`}
                className="group bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-[#073238]/30 transition-all flex flex-col items-center text-center gap-2"
              >
                <div className="w-12 h-12 bg-[#f8f9fa] group-hover:bg-[#e8f5f6] rounded-full flex items-center justify-center transition-colors">
                  <Folder className="w-6 h-6 text-[#073238]" />
                </div>
                <h3 className="font-bold text-[#00393c] text-xs line-clamp-1">{col.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}


    </div>
  );
}
