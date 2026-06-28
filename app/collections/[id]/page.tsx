"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowLeft, Folder, Trash2, FileImage } from "lucide-react";
import ImageCard from "@/components/ImageCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const collectionId = resolvedParams.id;

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadCollection() {
      setIsLoading(true);
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      // 1. Get current auth state
      const { data: { session } } = await supabase.auth.getSession();
      
      // 2. Fetch collection details
      const { data: colData, error: colError } = await supabase
        .from("saved_collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (colError || !colData) {
        setIsLoading(false);
        return;
      }

      setCollection(colData);
      
      if (session && session.user.id === colData.user_id) {
        setIsOwner(true);
      }

      // 3. Fetch items in this collection
      const { data: savedItems, error: itemsError } = await supabase
        .from("saved_items")
        .select(`
          id,
          image_id,
          images:image_id (*)
        `)
        .eq("collection_id", collectionId);

      if (!itemsError && savedItems) {
        // map out the images and attach customTags/etc if needed by ImageCard
        const mappedItems = savedItems
          .map((item: any) => item.images)
          .filter(Boolean);
        setItems(mappedItems);
      }

      setIsLoading(false);
    }
    loadCollection();
  }, [collectionId]);

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this collection? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("saved_collections").delete().eq("id", collectionId);
      if (error) throw error;
      window.location.href = "/visuals";
    } catch (err) {
      alert("Error deleting collection.");
    }
  };

  const handleRemoveItem = async (imageId: string) => {
    if (!confirm("Remove this item from the collection?")) return;
    try {
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("image_id", imageId);
      if (error) throw error;
      setItems(items.filter(item => item.id !== imageId));
    } catch (err) {
      alert("Error removing item.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
          <div className="h-12 w-1/3 bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <Folder size={64} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-black text-[#00393c] mb-2">Collection Not Found</h1>
        <Link href="/visuals" className="bg-[#073238] text-white font-bold px-6 py-3 rounded-xl shadow-sm mt-4">
          ← Back to Visuals
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pt-24 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Link href="/visuals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#00393c] mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Discovery Hub
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-[#00393c] flex items-center gap-3">
              <Folder className="w-8 h-8 text-[#073238]" />
              {collection.name}
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>

          {isOwner && (
            <button 
              onClick={handleDeleteCollection}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors self-start md:self-auto"
            >
              <Trash2 className="w-4 h-4" /> Delete Collection
            </button>
          )}
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 flex flex-col items-center text-center">
            <FileImage className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-[#00393c] mb-2">This collection is empty</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              You haven't saved any visuals to this collection yet. Browse the visuals page to find things you like!
            </p>
            <Link href="/visuals" className="bg-[#073238] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform">
              Browse Visuals
            </Link>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {items.map((visual) => (
              <div key={visual.id} className="relative group break-inside-avoid">
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
                {isOwner && (
                  <button
                    onClick={() => handleRemoveItem(visual.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md hover:bg-red-600"
                    title="Remove from collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
