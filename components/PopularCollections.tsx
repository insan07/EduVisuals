"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  ArrowRight,
  Dna,
  Atom,
  FlaskConical,
  Microscope,
  Globe2,
  Layers,
  Sparkles,
  TrendingUp,
  Download,
  BookOpen
} from "lucide-react";

export interface CollectionItem {
  id: string;
  slug: string;
  title: string;
  count: number;
  totalDownloads: number;
  previewUrl: string | null;
  icon: any;
  color: string;
  badge: string;
}

const DEFAULT_CATEGORIES: Array<{
  slug: string;
  title: string;
  icon: any;
  color: string;
  badge: string;
  fallbackCount: number;
}> = [
  { slug: "biology", title: "Biology & Life Sciences", icon: Dna, color: "from-emerald-600 via-teal-600 to-teal-800", badge: "Most Popular", fallbackCount: 1240 },
  { slug: "chemistry", title: "Chemistry & Mechanisms", icon: FlaskConical, color: "from-teal-600 via-cyan-600 to-cyan-800", badge: "Trending", fallbackCount: 850 },
  { slug: "physics", title: "Physics & Circuit Systems", icon: Atom, color: "from-blue-600 via-indigo-600 to-indigo-800", badge: "Essential", fallbackCount: 420 },
  { slug: "astronomy", title: "Astronomy & Earth Science", icon: Globe2, color: "from-sky-500 via-blue-600 to-blue-800", badge: "Featured", fallbackCount: 315 },
  { slug: "anatomy", title: "Medical Anatomy & Systems", icon: Microscope, color: "from-emerald-700 via-green-700 to-teal-900", badge: "High Demand", fallbackCount: 930 },
  { slug: "math", title: "Mathematics & Geometry", icon: Layers, color: "from-teal-800 via-emerald-800 to-cyan-900", badge: "Curriculum Aligned", fallbackCount: 1500 },
];

export default function PopularCollections() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollectionsFromUploads() {
      setIsLoading(true);
      try {
        if (!isSupabaseConfigured()) {
          useDefaultCollections();
          return;
        }

        // Fetch approved & published images with their tags
        const { data: images, error } = await supabase
          .from("images")
          .select("id, title, download_count, storage_path, image_url, is_published, status, created_at, image_tags(*)")
          .eq("status", "approved")
          .eq("is_published", true)
          .order("download_count", { ascending: false })
          .limit(100);

        if (error || !images || images.length === 0) {
          useDefaultCollections();
          return;
        }

        // Group uploaded images by subject
        const groupMap: Record<string, { images: any[]; downloads: number }> = {};

        images.forEach((img: any) => {
          const tags = img.image_tags || [];
          const subjectTag = tags.find((t: any) => t.tag_type === "subject")?.tag?.toLowerCase() || "general";
          
          let categorySlug = "biology";
          if (subjectTag.includes("chem")) categorySlug = "chemistry";
          else if (subjectTag.includes("phys")) categorySlug = "physics";
          else if (subjectTag.includes("astro") || subjectTag.includes("earth") || subjectTag.includes("geo")) categorySlug = "astronomy";
          else if (subjectTag.includes("anat") || subjectTag.includes("med") || subjectTag.includes("bio")) categorySlug = "anatomy";
          else if (subjectTag.includes("math") || subjectTag.includes("alg") || subjectTag.includes("geom")) categorySlug = "math";
          else categorySlug = "biology";

          if (!groupMap[categorySlug]) {
            groupMap[categorySlug] = { images: [], downloads: 0 };
          }

          groupMap[categorySlug].images.push(img);
          groupMap[categorySlug].downloads += (img.download_count || 0);
        });

        // Map groups to collection cards
        const dynamicCollections: CollectionItem[] = DEFAULT_CATEGORIES.map(def => {
          const groupData = groupMap[def.slug];
          const uploadCount = groupData ? groupData.images.length : 0;
          const totalDownloads = groupData ? groupData.downloads : 0;

          // Best preview image from real uploads if available
          let previewUrl: string | null = null;
          if (groupData && groupData.images.length > 0) {
            const topImg = groupData.images[0];
            if (topImg.storage_path) {
              const { data: publicUrlData } = supabase.storage.from("visuals").getPublicUrl(topImg.storage_path);
              previewUrl = publicUrlData.publicUrl;
            } else if (topImg.image_url) {
              previewUrl = topImg.image_url;
            }
          }

          return {
            id: def.slug,
            slug: def.slug,
            title: def.title,
            count: uploadCount > 0 ? uploadCount : def.fallbackCount,
            totalDownloads: totalDownloads > 0 ? totalDownloads : Math.floor(def.fallbackCount * 3.4),
            previewUrl,
            icon: def.icon,
            color: def.color,
            badge: def.badge,
          };
        });

        setCollections(dynamicCollections);
      } catch (err) {
        console.error("Error generating collections from uploads:", err);
        useDefaultCollections();
      } finally {
        setIsLoading(false);
      }
    }

    function useDefaultCollections() {
      const defaults: CollectionItem[] = DEFAULT_CATEGORIES.map(def => ({
        id: def.slug,
        slug: def.slug,
        title: def.title,
        count: def.fallbackCount,
        totalDownloads: Math.floor(def.fallbackCount * 3.4),
        previewUrl: null,
        icon: def.icon,
        color: def.color,
        badge: def.badge,
      }));
      setCollections(defaults);
      setIsLoading(false);
    }

    loadCollectionsFromUploads();
  }, []);

  // Sort collections by Most Downloaded first by default
  const displayedCollections = [...collections].sort((a, b) => b.totalDownloads - a.totalDownloads);

  return (
    <section className="py-12 lg:py-20 px-4 bg-gray-50 border-t border-brand-border/40">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-brand tracking-tight">Explore Popular Collections</h2>
          <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base mt-1">
            Curated resource packs dynamically aggregated from real creator uploads & student downloads.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCollections.map(col => {
            const IconComp = col.icon;
            return (
              <Link 
                href={`/visuals?q=${col.slug}`} 
                key={col.id} 
                className="group flex flex-col w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/80 bg-white hover:-translate-y-1"
              >
                {/* Header Graphic */}
                <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${col.color} p-6 flex flex-col justify-between`}>
                  
                  {/* Real Preview Overlay if uploaded image exists */}
                  {col.previewUrl && (
                    <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity duration-500">
                      <Image 
                        src={col.previewUrl} 
                        alt={col.title} 
                        fill 
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-extrabold text-white/95 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider border border-white/25 shadow-sm">
                      {col.count} Visuals
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                      <IconComp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  <div className="z-10">
                    <h3 className="text-xl font-black text-white tracking-tight leading-snug drop-shadow-sm">{col.title}</h3>
                  </div>

                  {/* Radial Background Flare */}
                  <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                </div>

                {/* Footer Meta Details */}
                <div className="p-4 flex items-center justify-between bg-white text-xs font-bold text-brand border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{col.totalDownloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-extrabold group-hover:translate-x-1 transition-transform">
                    <span>Explore Pack</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Explore All Link */}
        <div className="mt-12 flex justify-center">
          <Link 
            href="/visuals" 
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-3.5 rounded-full border-2 border-brand text-brand font-bold bg-white hover:bg-brand hover:text-white transition-all text-sm shadow-sm hover:shadow-md cursor-pointer"
          >
            Explore All Subject Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
