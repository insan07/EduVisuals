"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Eye, Download, TrendingUp , Users, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PremiumLoader } from "@/components/PremiumLoader";

// Mock data for the chart since we don't have historical data in the DB yet
const generateMockChartData = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      views: Math.floor(Math.random() * 500) + 100,
      downloads: Math.floor(Math.random() * 100) + 10,
    });
  }
  return data;
};

export default function UploaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalViews: 0,
    totalDownloads: 0,
    followers: 0,
    avgRating: 0,
    totalRatings: 0,
  });
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

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
        
        let followers = 0;
        try {
          const { data: count, error: err } = await supabase.rpc("get_follower_count", { cid: userId });
          if (!err && count !== null) followers = Number(count);
        } catch (e) {}

        let avgRating = 0;
        let totalRatings = 0;
        try {
          const { data: rStats, error: rErr } = await supabase.rpc("get_creator_rating_stats", { cid: userId });
          if (!rErr && rStats && rStats.length > 0) {
            avgRating = Number(rStats[0].avg_rating || 0);
            totalRatings = Number(rStats[0].total_ratings || 0);
          }
        } catch (e) {}
        
        setStats({
          totalUploads: userImages.length,
          totalViews,
          totalDownloads,
          followers,
          avgRating,
          totalRatings
        });

        setRecentUploads(userImages.slice(0, 5));
        setChartData(generateMockChartData());
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="pb-12 text-brand">
      
      {/* Hero Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-brand-border p-8 rounded-xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-surface rounded-md text-[10px] font-bold uppercase tracking-wider text-brand-faint mb-3 border border-brand-border">
            <TrendingUp className="w-3.5 h-3.5" />
            Creator Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-brand">Welcome back.</h1>
          <p className="text-brand-faint font-medium text-sm md:text-base max-w-lg">
            Here's what's happening with your educational visuals today.
          </p>
        </div>
        
        <Link 
          href="/uploader/upload" 
          className="bg-brand text-white font-bold px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors shadow-sm flex items-center gap-2 text-sm"
        >
          <TrendingUp className="w-4 h-4" />
          Upload Visual
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
        
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Uploads</p>
            <ImageIcon className="w-4 h-4 text-brand-faint" />
          </div>
          <p className="text-3xl font-black text-brand tracking-tight">{stats.totalUploads}</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Total Views</p>
            <Eye className="w-4 h-4 text-brand-faint" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-brand tracking-tight">{stats.totalViews}</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 mb-1">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </span>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Downloads</p>
            <Download className="w-4 h-4 text-brand-faint" />
          </div>
          <p className="text-3xl font-black text-brand tracking-tight">{stats.totalDownloads}</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Followers</p>
            <Users className="w-4 h-4 text-brand-faint" />
          </div>
          <p className="text-3xl font-black text-brand tracking-tight">{stats.followers}</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider">Avg Rating</p>
            <Star className="w-4 h-4 text-brand-faint" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-brand tracking-tight">{stats.avgRating.toFixed(1)}</p>
            <span className="text-xs text-brand-faint font-bold">/ 5.0</span>
          </div>
        </div>
      </div>



      <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-brand">Recent Uploads</h2>
            <p className="text-xs font-medium text-brand-faint mt-1">Manage and track your latest content.</p>
          </div>
          <Link href="/uploader/my-uploads" className="text-xs font-bold text-brand border border-brand-border px-3 py-1.5 rounded hover:bg-brand-surface transition-colors">
            View All
          </Link>
        </div>
        
        {recentUploads.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-surface border border-brand-border rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-brand-faint" />
            </div>
            <h3 className="text-lg font-black text-brand mb-1">Your portfolio is empty</h3>
            <p className="text-brand-faint text-sm font-medium mb-6 max-w-sm">Start sharing your educational visuals with students worldwide to build your audience.</p>
            <Link href="/uploader/upload" className="bg-brand text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand/90 transition-colors text-sm shadow-sm">
              Upload First Visual
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/50 text-[10px] uppercase tracking-wider text-brand-faint font-bold border-b border-brand-border">
                  <th className="p-4 pl-6">Visual</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4 text-center">Downloads</th>
                  <th className="p-4 pr-6 text-right">Published</th>
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((visual) => (
                  <tr key={visual.id} className="border-b border-brand-border/50 hover:bg-brand-surface/30 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-brand-surface border border-brand-border overflow-hidden shrink-0">
                          <img 
                            src={visual.thumbnail_url || visual.file_url} 
                            alt={visual.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-brand truncate max-w-[200px]">{visual.title}</p>
                          <Link href={`/image/${visual.id}`} className="text-[10px] text-brand-faint hover:text-brand font-medium">View public page</Link>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {visual.status === "approved" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-sm text-brand">{visual.view_count || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-sm text-brand">{visual.download_count || 0}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="text-xs font-medium text-brand-faint">
                        {new Date(visual.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
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
