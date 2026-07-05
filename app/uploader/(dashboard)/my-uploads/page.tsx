"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Search, Filter , MoreVertical, Edit2, Trash2, Eye, Download } from "lucide-react";
import Link from "next/link";
import { PremiumLoader } from "@/components/PremiumLoader";

export default function MyUploadsPage() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadUploads() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userImages } = await supabase
        .from("images")
        .select("id, title, view_count, download_count, status, is_premium, created_at, thumbnail_url, file_url")
        .eq("uploaded_by", session.user.id)
        .order("created_at", { ascending: false });

      if (userImages) {
        setUploads(userImages);
      }
      setLoading(false);
    }
    loadUploads();
  }, []);

  const filteredUploads = uploads.filter(visual => {
    const matchesSearch = visual.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || visual.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PremiumLoader className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand mb-2">My Uploads</h1>
          <p className="text-brand-muted font-medium">Manage and track the performance of your visuals.</p>
        </div>
        <Link 
          href="/uploader/upload" 
          className="bg-brand text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#0a4a52] transition-colors shadow-sm flex items-center gap-2 text-sm"
        >
          <ImageIcon className="w-4 h-4" /> Upload New
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search your uploads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border focus:border-brand/50 rounded-lg outline-none text-sm font-medium text-brand transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brand-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-brand-surface border border-brand-border focus:border-brand/50 rounded-lg px-3 py-2 outline-none text-sm font-semibold text-brand cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending_review">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Uploads Grid/List */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        {filteredUploads.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-brand mb-2">No visuals found</h3>
            <p className="text-brand-muted text-sm max-w-sm">
              {uploads.length === 0 
                ? "You haven't uploaded anything yet." 
                : "No uploads match your current search and filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/50 text-[10px] uppercase tracking-wider text-brand-faint font-bold border-b border-brand-border">
                  <th className="p-4 pl-6 w-1/2">Visual Details</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Tier</th>
                  <th className="p-4 font-bold text-center">Stats</th>
                  <th className="p-4 pr-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {filteredUploads.map((visual) => (
                  <tr key={visual.id} className="hover:bg-brand-surface/30 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded bg-brand-surface overflow-hidden border border-brand-border flex-shrink-0">
                          <img src={visual.thumbnail_url || visual.file_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-brand truncate max-w-[200px] md:max-w-[300px]" title={visual.title}>{visual.title}</span>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                            Added {new Date(visual.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                        visual.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        visual.status === 'pending_review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        visual.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {visual.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {visual.is_premium ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">Premium</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-faint bg-brand-surface border border-brand-border px-2 py-0.5 rounded">Free</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand" title="Views">
                          <Eye className="w-3.5 h-3.5 text-brand-faint" /> {visual.view_count || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand" title="Downloads">
                          <Download className="w-3.5 h-3.5 text-brand-faint" /> {visual.download_count || 0}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/image/${visual.id}`} className="p-2 text-gray-400 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors" title="View Detail">
                          <MoreVertical className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
