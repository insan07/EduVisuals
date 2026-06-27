"use client";

import { useState, useEffect } from "react";
import { X, Plus, Folder, CheckCircle, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useCollectionModal } from "@/store/useCollectionModal";
import { useAuthModal } from "@/store/useAuthModal";
import { useRouter } from "next/navigation";

export default function CollectionModal() {
  const { isOpen, visualIdToSave, visualTitle, close } = useCollectionModal();
  const authModal = useAuthModal();
  const router = useRouter();

  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTo, setSavingTo] = useState<string | null>(null);
  const [newColName, setNewColName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    } else {
      // Reset state on close
      setSuccessMsg("");
      setErrorMsg("");
      setNewColName("");
    }
  }, [isOpen]);

  const loadCollections = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      close();
      authModal.open("signin", visualIdToSave || undefined); // prompt login
      return;
    }

    const { data, error } = await supabase
      .from("saved_collections")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        // Auto-create a default collection for new accounts
        const { data: defaultCol } = await supabase
          .from("saved_collections")
          .insert({ user_id: session.user.id, name: "Favorites" })
          .select()
          .single();
          
        if (defaultCol) {
          setCollections([defaultCol]);
        }
      } else {
        setCollections(data);
      }
    }
    setLoading(false);
  };

  const handleSaveToCollection = async (collectionId: string) => {
    if (!visualIdToSave || !isSupabaseConfigured()) return;
    
    setSavingTo(collectionId);
    setErrorMsg("");
    setSuccessMsg("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Check if already saved
    const { data: existing } = await supabase
      .from("saved_items")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("image_id", visualIdToSave)
      .single();

    if (existing) {
      setErrorMsg("Visual is already in this collection.");
      setSavingTo(null);
      return;
    }

    const { error } = await supabase
      .from("saved_items")
      .insert({
        collection_id: collectionId,
        image_id: visualIdToSave,
      });

    if (error) {
      console.error(error);
      setErrorMsg("Failed to save visual. Please try again.");
    } else {
      setSuccessMsg("Saved successfully!");
      setTimeout(() => {
        close();
      }, 1500);
    }
    setSavingTo(null);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim() || !isSupabaseConfigured() || !visualIdToSave) return;
    
    setIsCreating(true);
    setErrorMsg("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // 1. Create collection
    const { data: newCol, error: colError } = await supabase
      .from("saved_collections")
      .insert({
        user_id: session.user.id,
        name: newColName.trim(),
      })
      .select()
      .single();

    if (colError || !newCol) {
      console.error(colError);
      setErrorMsg("Failed to create collection.");
      setIsCreating(false);
      return;
    }

    // 2. Add visual to new collection
    const { error: saveError } = await supabase
      .from("saved_items")
      .insert({
        collection_id: newCol.id,
        image_id: visualIdToSave,
      });

    if (saveError) {
      console.error(saveError);
      setErrorMsg("Created collection, but failed to save visual.");
    } else {
      setCollections([newCol, ...collections]);
      setSuccessMsg(`Saved to ${newCol.name}!`);
      setTimeout(() => {
        close();
      }, 1500);
    }
    
    setNewColName("");
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <div>
            <h2 className="text-lg font-black text-brand">Save to Collection</h2>
            {visualTitle && (
              <p className="text-xs text-brand-muted line-clamp-1 mt-0.5 max-w-[300px]">
                {visualTitle}
              </p>
            )}
          </div>
          <button 
            onClick={close}
            className="text-brand-faint hover:text-brand transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {successMsg ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle size={48} className="text-emerald-500 mb-4" />
              <p className="text-brand font-bold text-lg">{successMsg}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Existing Collections */}
              <div>
                <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">
                  Your Collections
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-brand/30 animate-spin" />
                  </div>
                ) : collections.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {collections.map(col => (
                      <button
                        key={col.id}
                        onClick={() => handleSaveToCollection(col.id)}
                        disabled={savingTo !== null}
                        className="flex items-center justify-between p-3 rounded-xl border border-brand-border hover:border-brand/40 hover:bg-brand-surface transition-all group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#e8ecec] flex items-center justify-center text-brand">
                            <Folder size={18} />
                          </div>
                          <span className="font-semibold text-brand text-sm">{col.name}</span>
                        </div>
                        {savingTo === col.id ? (
                          <Loader2 className="w-4 h-4 text-brand animate-spin" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center group-hover:border-brand group-hover:bg-brand transition-colors">
                            <Plus size={14} className="text-transparent group-hover:text-white transition-colors" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-brand-faint py-4 text-center border border-dashed border-brand-border rounded-xl">
                    You don't have any collections yet.
                  </p>
                )}
              </div>

              {/* Create New Collection */}
              <div>
                <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">
                  Create New Collection
                </h3>
                <form onSubmit={handleCreateCollection} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Biology Diagrams"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    disabled={isCreating}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isCreating || !newColName.trim()}
                    className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                  </button>
                </form>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500 text-center font-medium">{errorMsg}</p>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
