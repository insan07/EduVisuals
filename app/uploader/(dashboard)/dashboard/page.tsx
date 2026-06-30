"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Eye, Download, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";

export default function UploaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalViews: 0,
    totalDownloads: 0,
  });
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch images uploaded by this user
      const { data: userImages, error } = await supabase
        .from("images")
        .select("id, title, view_count, download_count, status, created_at, thumbnail_url, file_url")
        .eq("uploaded_by", userId)
        .order("created_at", { ascending: false });

      if (userImages) {
        const totalViews = userImages.reduce((sum, img) => sum + (img.view_count || 0), 0);
        const totalDownloads = userImages.reduce((sum, img) => sum + (img.download_count || 0), 0);
        
        setStats({
          totalUploads: userImages.length,
          totalViews,
          totalDownloads,
        });

        setRecentUploads(userImages.slice(0, 5));
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-brand mb-2">Welcome back!</h1>
          <p className="text-brand-muted font-medium">Here's what's happening with your visuals today.</p>
        </div>
        <Link 
          href="/uploader/upload" 
          className="bg-brand text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0a4a52] transition-colors shadow-sm hidden md:flex"
        >
          Upload New Visual
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-1">Total Uploads</p>
            <p className="text-3xl font-black text-brand">{stats.totalUploads}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-1">Total Views</p>
            <p className="text-3xl font-black text-brand">{stats.totalViews}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-1">Total Downloads</p>
            <p className="text-3xl font-black text-brand">{stats.totalDownloads}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand">Recent Uploads</h2>
          <Link href="/uploader/my-uploads" className="text-sm font-bold text-brand hover:underline">View All</Link>
        </div>
        
        {recentUploads.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-brand font-bold mb-2">No uploads yet</p>
            <p className="text-brand-muted text-sm mb-6 max-w-sm">You haven't uploaded any visuals yet. Start sharing your knowledge with the world!</p>
            <Link href="/uploader/upload" className="bg-[#f3f3f3] text-brand border border-brand-border font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
              Make Your First Upload
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] text-xs uppercase tracking-wider text-brand-muted font-bold">
                  <th className="p-4 pl-6 font-bold">Visual</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Views</th>
                  <th className="p-4 font-bold text-center">Downloads</th>
                  <th className="p-4 pr-6 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUploads.map((visual) => (
                  <tr key={visual.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                          <img src={visual.thumbnail_url || visual.file_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-sm text-brand truncate max-w-[200px]">{visual.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                        visual.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        visual.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                        visual.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {visual.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center font-semibold text-brand text-sm">{visual.view_count || 0}</td>
                    <td className="p-4 text-center font-semibold text-brand text-sm">{visual.download_count || 0}</td>
                    <td className="p-4 pr-6 text-right text-xs font-medium text-brand-muted">
                      {new Date(visual.created_at).toLocaleDateString()}
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
