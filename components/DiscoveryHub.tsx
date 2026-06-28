import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Folder, Clock, Sparkles, ChevronRight, FileImage } from "lucide-react";
import ImageCard from "@/components/ImageCard";
import { useCollectionModal } from "@/store/useCollectionModal";

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
        const recentIds = JSON.parse(localStorage.getItem("recently_seen_visuals") || "[]");
        if (recentIds.length > 0) {
          const { data: recentImages } = await supabase
            .from("images")
            .select("*, image_tags(*)")
            .in("id", recentIds);
          
          if (recentImages) {
            // Sort to match localStorage order
            const sorted = recentIds.map((id: string) => recentImages.find(img => img.id === id)).filter(Boolean);
            setRecentlySeen(sorted);
          }
        }
      } catch (e) {
        console.error("Error loading recently seen", e);
      }

      // 2. Fetch Suggestions (Random or Latest)
      const { data: suggImages } = await supabase
        .from("images")
        .select("*, image_tags(*)")
        .eq("is_published", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(8);
      if (suggImages) setSuggestions(suggImages);

      // 3. Fetch Collections for the logged-in user
      const { data: { session } } = await supabase.auth.getSession();
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
    <div className="flex flex-col gap-12 mt-4 pb-12">
      
      {/* RECENTLY SEEN */}
      {recentlySeen.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-[#00393c] flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#073238]" />
              Recently Viewed
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            {recentlySeen.map(visual => (
              <div key={visual.id} className="w-[280px] md:w-[320px] flex-shrink-0 snap-start">
                <ImageCard
                  id={visual.id}
                  title={visual.title}
                  thumbnailUrl={visual.thumbnail_url || visual.file_url}
                  subject={visual.subject || "General"}
                  grade={visual.grade || "General"}
                  type={visual.type || "Diagram"}
                  isPremium={visual.is_premium || false}
                  downloadCount={visual.download_count || 0}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SUGGESTIONS FOR YOU */}
      {suggestions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-[#00393c] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#073238]" />
              Suggestions for You
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            {suggestions.map(visual => (
              <div key={visual.id} className="w-[280px] md:w-[320px] flex-shrink-0 snap-start">
                <ImageCard
                  id={visual.id}
                  title={visual.title}
                  thumbnailUrl={visual.thumbnail_url || visual.file_url}
                  subject={visual.subject || "General"}
                  grade={visual.grade || "General"}
                  type={visual.type || "Diagram"}
                  isPremium={visual.is_premium || false}
                  downloadCount={visual.download_count || 0}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* YOUR COLLECTIONS */}
      {collections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-[#00393c] flex items-center gap-2">
              <Folder className="w-6 h-6 text-[#073238]" />
              Your Collections
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {collections.map(col => (
              <Link 
                key={col.id} 
                href={`/collections/${col.id}`}
                className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#073238]/30 transition-all flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 bg-[#f8f9fa] group-hover:bg-[#e8f5f6] rounded-full flex items-center justify-center transition-colors">
                  <Folder className="w-8 h-8 text-[#073238]" />
                </div>
                <h3 className="font-bold text-[#00393c] text-sm line-clamp-1">{col.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
