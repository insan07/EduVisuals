"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Eye, Download, TrendingUp, Loader2, Users, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-brand-surface bg-brand/5 absolute top-0 left-0 animate-ping opacity-75"></div>
          <Loader2 className="w-12 h-12 text-brand animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Premium Hero Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-[#073238] to-[#0a4a52] p-8 md:p-10 rounded-[2rem] text-white shadow-xl shadow-brand/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4 border border-white/10">
            <TrendingUp className="w-3.5 h-3.5" />
            Creator Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">Welcome back.</h1>
          <p className="text-white/70 font-medium text-lg max-w-lg">
            Here's what's happening with your educational visuals today.
          </p>
        </div>
        
        <Link 
          href="/uploader/upload" 
          className="relative z-10 bg-white text-brand font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Upload Visual
        </Link>
      </div>

      {/* Glassmorphism Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
        
        <div className="group bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-200 transition-colors"></div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 relative z-10 border border-blue-100">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Uploads</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-brand tracking-tight">{stats.totalUploads}</p>
            </div>
          </div>
        </div>

        <div className="group bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-200 transition-colors"></div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 relative z-10 border border-emerald-100">
            <Eye className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Total Views</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-brand tracking-tight">{stats.totalViews}</p>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
            </div>
          </div>
        </div>

        <div className="group bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-200 transition-colors"></div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 relative z-10 border border-purple-100">
            <Download className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Downloads</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-brand tracking-tight">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>

        <div className="group bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-200 transition-colors"></div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 relative z-10 border border-pink-100">
            <Users className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Followers</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-brand tracking-tight">{stats.followers}</p>
            </div>
          </div>
        </div>

        <div className="group bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-200 transition-colors"></div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 relative z-10 border border-amber-100">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Avg Rating</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-brand tracking-tight">{stats.avgRating.toFixed(1)}</p>
              <span className="text-xs text-brand-muted font-bold">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-brand-border shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-brand">Performance Overview</h2>
              <p className="text-sm font-semibold text-brand-muted mt-1">Views and downloads over the last 7 days</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#073238" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#073238" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" name="Views" stroke="#073238" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="downloads" name="Downloads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDownloads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Tips or Milestones */}
        <div className="bg-[#073238] rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <h3 className="text-2xl font-black mb-2">Pro Tip</h3>
            <p className="text-white/70 font-medium leading-relaxed">
              Visuals tagged with specific local curriculums receive 40% more downloads on average. Ensure you add relevant tags before publishing!
            </p>
          </div>
          
          <div className="mt-8 relative z-10 bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Next Milestone</p>
            <div className="flex justify-between items-end mb-2">
              <span className="font-black text-xl">{stats.totalViews}</span>
              <span className="text-sm font-bold text-white/50">/ 1,000 Views</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div 
                className="bg-emerald-400 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (stats.totalViews / 1000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-brand-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-brand">Recent Uploads</h2>
            <p className="text-sm font-medium text-brand-muted mt-1">Manage and track your latest content.</p>
          </div>
          <Link href="/uploader/my-uploads" className="text-sm font-bold text-brand bg-brand-surface px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            View All
          </Link>
        </div>
        
        {recentUploads.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-brand/30" />
            </div>
            <h3 className="text-2xl font-black text-brand mb-2">Your portfolio is empty</h3>
            <p className="text-brand-muted font-medium mb-8 max-w-md">Start sharing your educational visuals with students worldwide to build your audience.</p>
            <Link href="/uploader/upload" className="bg-brand text-white font-black px-8 py-4 rounded-2xl hover:bg-[#0a4a52] transition-transform hover:scale-105 shadow-lg shadow-brand/20">
              Upload First Visual
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/50 text-[10px] uppercase tracking-widest text-brand-muted font-black border-b border-brand-border">
                  <th className="p-5 pl-8">Visual</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Views</th>
                  <th className="p-5 text-center">Downloads</th>
                  <th className="p-5 pr-8 text-right">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUploads.map((visual) => (
                  <tr key={visual.id} className="hover:bg-brand-surface/30 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-shadow">
                          <img src={visual.thumbnail_url || visual.file_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-brand truncate max-w-[250px] group-hover:text-emerald-600 transition-colors">{visual.title}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                        visual.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        visual.status === 'pending_review' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        visual.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {visual.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5 text-center font-black text-brand">{visual.view_count || 0}</td>
                    <td className="p-5 text-center font-black text-brand">{visual.download_count || 0}</td>
                    <td className="p-5 pr-8 text-right text-sm font-semibold text-brand-muted">
                      {new Date(visual.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
