"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import FeedPost, { FeedVisual } from "./FeedPost";
import { Image as ImageIcon } from "lucide-react";

export default function DiscoveryFeed({
  savedIds,
  onSave,
  onDownload,
}: {
  savedIds: Set<string>;
  onSave: (id: string, title: string) => void;
  onDownload: (visual: any) => void;
}) {
  const [feed, setFeed] = useState<FeedVisual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedData() {
      setIsLoading(true);
      try {
        let visuals: any[] = [];
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // 1. Fetch Following Images
          const { data: follows } = await supabase
            .from("follows")
            .select("creator_id")
            .eq("follower_id", session.user.id);
            
          if (follows && follows.length > 0) {
            const creatorIds = follows.map(f => f.creator_id);
            const { data: followingImages } = await supabase
              .from("images")
              .select("*, image_tags(*)")
              .in("uploaded_by", creatorIds)
              .eq("status", "approved")
              .eq("is_published", true)
              .order("created_at", { ascending: false })
              .limit(10);
              
            if (followingImages) {
              visuals = [...followingImages];
            }
          }
        }

        // 2. Fill with Suggestions if needed (up to 20 total)
        if (visuals.length < 20) {
          // exclude already fetched
          const excludeIds = visuals.map(v => v.id);
          
          let query = supabase
            .from("images")
            .select("*, image_tags(*)")
            .eq("status", "approved")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(20 - visuals.length);
            
          if (excludeIds.length > 0) {
            query = query.not("id", "in", `(${excludeIds.join(",")})`);
          }
          
          const { data: suggestedImages } = await query;
          
          if (suggestedImages) {
            visuals = [...visuals, ...suggestedImages];
          }
        }
        
        // 3. Fetch Uploader Data in bulk
        if (visuals.length > 0) {
          const uploaderIds = [...new Set(visuals.map(v => v.uploaded_by).filter(Boolean))];
          let uploadersMap: Record<string, any> = {};
          
          if (uploaderIds.length > 0) {
            const { data: uploaders } = await supabase
              .from("uploader_profiles")
              .select("id, display_name, profiles(avatar_url)")
              .in("id", uploaderIds);
              
            if (uploaders) {
              uploaders.forEach(u => {
                uploadersMap[u.id] = {
                  id: u.id,
                  display_name: u.display_name,
                  avatar_url: (u.profiles as any)?.[0]?.avatar_url || (u.profiles as any)?.avatar_url || null
                };
              });
            }
          }

          // 4. Map everything together
          const mappedFeed: FeedVisual[] = visuals.map(img => {
            const tags = img.image_tags || [];
            return {
              ...img,
              subject: tags.find((t: any) => t.tag_type === "subject")?.tag,
              grade: tags.find((t: any) => t.tag_type === "grade")?.tag,
              type: tags.find((t: any) => t.tag_type === "type")?.tag,
              uploader: uploadersMap[img.uploaded_by] || null
            };
          });
          
          setFeed(mappedFeed);
        }
      } catch (e) {
        console.error("Error fetching feed", e);
      }
      setIsLoading(false);
    }

    if (isSupabaseConfigured()) {
      fetchFeedData();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto mt-4 w-full">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="w-full aspect-[4/5] bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mb-6">
          <ImageIcon className="w-10 h-10 text-brand/40" />
        </div>
        <h2 className="text-xl font-bold text-brand mb-2">No Visuals Found</h2>
        <p className="text-sm font-medium text-brand-muted">
          We couldn't find any visuals to show you right now. Check back later or try searching!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-xl mx-auto mt-2 pb-8 w-full">
      {feed.map(visual => (
        <FeedPost
          key={visual.id}
          visual={visual}
          isSaved={savedIds.has(visual.id)}
          onSave={() => onSave(visual.id, visual.title)}
          onDownload={() => onDownload(visual)}
        />
      ))}
    </div>
  );
}
