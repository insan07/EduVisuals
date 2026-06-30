"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle, FileImage, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminReviewQueue() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<any[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadQueue() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin" && profile?.role !== "moderator") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);

      const { data: pendingItems } = await supabase
        .from("images")
        .select(`
          id, title, description, thumbnail_url, file_url, created_at,
          uploaded_by,
          profiles:uploaded_by (full_name, email)
        `)
        .eq("status", "pending_review")
        .order("created_at", { ascending: true });

      if (pendingItems) setQueue(pendingItems);
      setLoading(false);
    }
    loadQueue();
  }, [router]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    await supabase
      .from("images")
      .update({
        status: "approved",
        is_published: true,
        published_at: new Date().toISOString(),
        approved_by: session?.user?.id
      })
      .eq("id", id);
      
    setQueue(q => q.filter(item => item.id !== id));
    setActionLoading(false);
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    
    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    await supabase
      .from("images")
      .update({
        status: "rejected",
        rejection_reason: rejectReason,
        approved_by: session?.user?.id
      })
      .eq("id", id);
      
    setQueue(q => q.filter(item => item.id !== id));
    setRejectingId(null);
    setRejectReason("");
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-brand-surface pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-brand" />
          <div>
            <h1 className="text-3xl font-black text-brand">Review Queue</h1>
            <p className="text-brand-muted font-medium">Pending visual uploads awaiting moderation.</p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-brand-border flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
            <h2 className="text-2xl font-black text-brand mb-2">All caught up!</h2>
            <p className="text-brand-muted">There are no pending visuals to review right now.</p>
            <Link href="/" className="mt-6 text-brand font-bold underline">Go to Home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queue.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden flex flex-col">
                <div className="aspect-video bg-gray-100 relative">
                  {item.thumbnail_url || item.file_url ? (
                    <img src={item.thumbnail_url || item.file_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileImage className="w-8 h-8 text-gray-300" /></div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-brand mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-brand-muted line-clamp-2 mb-3">{item.description || "No description provided."}</p>
                  
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                    By: {item.profiles?.full_name || item.profiles?.email || "Unknown User"}
                    <br/>
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>

                  <div className="mt-auto">
                    {rejectingId === item.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea 
                          className="w-full text-sm border border-brand-border rounded-lg p-2 focus:outline-none focus:border-red-400 resize-none h-16"
                          placeholder="Reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleReject(item.id)}
                            className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Confirm Reject
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            className="bg-gray-100 text-gray-700 font-bold px-4 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          disabled={actionLoading}
                          onClick={() => handleApprove(item.id)}
                          className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button 
                          disabled={actionLoading}
                          onClick={() => setRejectingId(item.id)}
                          className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
