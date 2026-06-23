"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Download,
  Heart,
  Home as HomeIcon,
  Star,
  Settings,
  ArrowRight,
  TrendingUp,
  FolderPlus,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import { formatLKR, formatDate, cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "downloads" | "collections" | "subscription" | "settings">("overview");
  
  // Tab inner states
  const [downloadPeriod, setDownloadPeriod] = useState<"all" | "week" | "month">("all");
  const [collections, setCollections] = useState([
    { id: "col1", name: "Science Mind Maps", items: ["1", "8"], emojiList: ["🌿", "🫁"] },
    { id: "col2", name: "History Timelines", items: ["3", "10"], emojiList: ["🏰", "⏳"] },
  ]);
  const [newColName, setNewColName] = useState("");
  const [showColModal, setShowColModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const [realDownloads, setRealDownloads] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name);
    
    // Load real downloads
    supabase
      .from("downloads")
      .select(`id, created_at, image_id, download_type,
        images:image_id(id, title, thumbnail_url, image_tags(tag, tag_type))`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => { if (data) setRealDownloads(data); });

    // Load profile stats
    supabase
      .from("profiles")
      .select("downloads_today, last_download_date, subscription_status")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfileData(data);
          const today = new Date().toISOString().split("T")[0];
          setTodayCount(data.last_download_date === today ? (data.downloads_today || 0) : 0);
        }
      });
  }, [user]);

  // Sync active tab state from query parameter or custom events
  useEffect(() => {
    const handleTabSync = () => {
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const tabParam = searchParams.get("tab");
        if (
          tabParam &&
          ["overview", "downloads", "collections", "subscription", "settings"].includes(tabParam)
        ) {
          setActiveTab(tabParam as any);
          setSelectedCollection(null);
        }
      }
    };

    handleTabSync();
    window.addEventListener("dashboard-tab-changed", handleTabSync);
    window.addEventListener("popstate", handleTabSync);
    return () => {
      window.removeEventListener("dashboard-tab-changed", handleTabSync);
      window.removeEventListener("popstate", handleTabSync);
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
    </div>
  );
  if (!user) return null;

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const newCol = {
      id: "col_" + Date.now(),
      name: newColName,
      items: [],
      emojiList: ["📝"],
    };
    setCollections([...collections, newCol]);
    setNewColName("");
    setShowColModal(false);
  };

  const handleDeleteCollection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCollections(collections.filter((c) => c.id !== id));
  };

  // CSV Export simulator -> real export
  const handleExportCSV = () => {
    const rows = realDownloads.map(d => 
      `"${d.image_id}","${d.images?.title||""}","${d.created_at}","${d.download_type}"`
    );
    const blob = new Blob(["Image ID,Title,Date,Type\n" + rows.join("\n")], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `downloads_${user?.name || "user"}.csv`;
    a.click();
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    await supabase.from("profiles").update({ full_name: displayName }).eq("id", user.id);
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const isPremium = user?.isPremium;

  return (
    <div className="flex min-h-screen bg-brand-surface text-brand pt-14 md:pt-16 pb-16 md:pb-0">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-brand-border bg-white p-6 justify-between sticky top-16 h-[calc(100vh-64px)] z-30 flex-shrink-0 select-none">
        <div className="flex flex-col gap-6">
          
          {/* User profile card */}
          <div className="flex items-center gap-3 p-3 bg-brand-surface border border-brand-border rounded-xl">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand text-white font-black text-sm flex items-center justify-center shadow-sm">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-black text-brand truncate">
                {user?.name || user?.email}
              </span>
              <span className="text-[10px] text-brand-muted font-semibold truncate mb-1">
                {user?.email}
              </span>
              <span className={`inline-flex items-center gap-1 w-max text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                isPremium
                  ? "bg-brand text-white shadow-sm"
                  : "bg-[#f3f3f3] text-brand border border-brand-border"
              }`}>
                {isPremium ? <Crown className="w-2.5 h-2.5 text-white" /> : null}
                {isPremium ? "Premium" : "Free"} Plan
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 font-bold text-xs">
            {[
              { id: "overview", label: "Overview", icon: HomeIcon },
              { id: "downloads", label: "My Downloads", icon: Download },
              { id: "collections", label: "Saved Collections", icon: Heart },
              { id: "subscription", label: "Subscription", icon: Star },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedCollection(null);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "text-[rgba(0,57,60,0.75)] hover:bg-[#f3f3f3] hover:text-brand"
                  }`}
                >
                  <TabIcon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <Link
            href="/pricing"
            className="w-full bg-brand hover:bg-brand text-white font-extrabold text-xs py-3 rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            Upgrade to Premium
          </Link>
        )}
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                Access and manage your visuals library account.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Today Limit */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-[rgba(0,57,60,0.5)]">
                    Downloads Today
                  </span>
                  <p className="text-2xl font-black text-brand mt-1.5">
                    {isPremium ? "∞" : `${todayCount} / 5`}
                  </p>
                </div>
                {!isPremium && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-[#f3f3f3] rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${(todayCount / 5) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-brand-faint font-semibold mt-1 block">
                      {Math.max(0, 5 - todayCount)} downloads remaining today
                    </span>
                  </div>
                )}
                {isPremium && (
                  <span className="text-[9px] text-emerald-700 font-extrabold mt-3 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-emerald-600" /> Unlimited access active
                  </span>
                )}
              </div>

              {/* Card 2: Total */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-black tracking-wider text-[rgba(0,57,60,0.5)]">
                  Total Downloads
                </span>
                <p className="text-2xl font-black text-brand mt-1.5">
                  {realDownloads.length}
                </p>
                <span className="text-[9px] text-brand-faint font-semibold mt-2.5 block">
                  Across all formats and vectors
                </span>
              </div>

              {/* Card 3: Saved */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-black tracking-wider text-[rgba(0,57,60,0.5)]">
                  Saved Collections
                </span>
                <p className="text-2xl font-black text-brand mt-1.5">
                  {collections.length}
                </p>
                <span className="text-[9px] text-brand-faint font-semibold mt-2.5 block">
                  Organized study folders
                </span>
              </div>

              {/* Card 4: Member Date */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-black tracking-wider text-[rgba(0,57,60,0.5)]">
                  Member Since
                </span>
                <p className="text-2xl font-black text-brand mt-1.5">
                  June 2026
                </p>
                <span className="text-[9px] text-brand-faint font-semibold mt-2.5 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand" /> Account verified
                </span>
              </div>

            </div>

            {/* Recent Downloads Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm text-brand flex items-center gap-1.5">
                  <Download className="w-4.5 h-4.5 text-brand" />
                  Recent Downloads
                </h3>
                <button
                  onClick={() => setActiveTab("downloads")}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  View All Downloads
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {realDownloads.slice(0, 6).map((dl) => (
                  <div
                    key={dl.id}
                    className="bg-white border border-brand-border rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-brand-border transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-[#f3f3f3] rounded-lg flex items-center justify-center text-2xl border border-brand-border flex-shrink-0 overflow-hidden">
                        {dl.images?.thumbnail_url ? <img src={dl.images.thumbnail_url} alt="thumb" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand/10"></div>}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-brand line-clamp-1">
                          {dl.images?.title || "Untitled"}
                        </span>
                        <span className="text-[9px] text-brand-faint font-semibold truncate">
                          Downloaded · {new Date(dl.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/image/${dl.image_id}`}
                      className="p-1.5 bg-[#f3f3f3] hover:bg-brand text-brand hover:text-white rounded-lg transition-colors border border-brand-border flex-shrink-0"
                      title="Quick review"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access CTAs */}
            <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <h4 className="font-extrabold text-sm text-brand">
                  Ready to search for more diagrams?
                </h4>
                <p className="text-xs text-brand-muted mt-0.5">
                  Browse over 10,000+ curriculum-aligned, high-resolution study aids.
                </p>
              </div>
              <Link
                href="/"
                className="bg-brand hover:bg-brand text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                Continue Browsing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        )}

        {/* ================= MY DOWNLOADS TAB ================= */}
        {activeTab === "downloads" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-brand">
                  My Downloads History
                </h1>
                <p className="text-xs text-brand-muted font-semibold mt-1">
                  Access and redownload your study resource history files.
                </p>
              </div>
              
              <button
                onClick={handleExportCSV}
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                Export History (CSV)
              </button>
            </div>

            {/* Filters panel */}
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              {[
                { id: "all", label: "All Downloads" },
                { id: "week", label: "This Week" },
                { id: "month", label: "This Month" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDownloadPeriod(opt.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    downloadPeriod === opt.id
                      ? "bg-brand text-white border-brand shadow-sm"
                      : "bg-white text-[rgba(0,57,60,0.7)] border-brand-border hover:border-brand/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Downloads list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {realDownloads.map((dl) => (
                <div
                  key={dl.id}
                  className="bg-white border border-brand-border rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#f3f3f3] rounded-lg flex items-center justify-center text-2xl border border-brand-border overflow-hidden">
                      {dl.images?.thumbnail_url ? <img src={dl.images.thumbnail_url} alt="thumb" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand/10"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-brand line-clamp-1">
                        {dl.images?.title || "Untitled"}
                      </span>
                      <span className="text-[9px] text-brand-faint font-semibold">
                        {dl.download_type} · Downloaded {new Date(dl.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/image/${dl.image_id}`}
                    className="bg-[#f3f3f3] hover:bg-brand text-brand hover:text-white border border-brand-border text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Again
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SAVED COLLECTIONS TAB ================= */}
        {activeTab === "collections" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            
            {/* Tab header */}
            {!selectedCollection ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-brand">
                      Saved Collections
                    </h1>
                    <p className="text-xs text-brand-muted font-semibold mt-1">
                      Organize your subject mind maps and layouts in custom folders.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowColModal(true)}
                    className="bg-brand hover:bg-brand text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    New Collection
                  </button>
                </div>

                {/* Grid of folders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {collections.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => setSelectedCollection(col.id)}
                      className="group bg-brand border border-[#00393c] hover:bg-brand hover:border-brand text-white rounded-2xl p-5 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Covers Mosaic (4 cells placeholder) */}
                      <div className="grid grid-cols-2 gap-1.5 aspect-[2/1] bg-brand/50 border border-white/10 rounded-xl p-2 mb-4">
                        {col.emojiList.map((em, idx) => (
                          <div key={idx} className="bg-white/10 rounded-lg flex items-center justify-center border border-white/5 text-2xl">
                            {em}
                          </div>
                        ))}
                        {Array.from({ length: 4 - col.emojiList.length }).map((_, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-white/30 font-bold">
                            Empty
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white group-hover:text-teal-200 transition-colors">
                            {col.name}
                          </span>
                          <span className="text-[10px] text-white/70 font-semibold mt-0.5">
                            {col.items.length} items saved
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteCollection(col.id, e)}
                          className="p-2 bg-white/10 hover:bg-red-500 text-white/80 hover:text-white rounded-lg transition-colors border border-white/10 hover:border-red-500"
                          title="Delete collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // COLLECTION DETAIL PAGE STATE
              <div>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="text-xs font-bold text-brand hover:underline mb-4 flex items-center gap-1"
                >
                  ← Back to Collections
                </button>

                {(() => {
                  const activeCol = collections.find((c) => c.id === selectedCollection);
                  if (!activeCol) return null;
                  return (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="text-xl font-black text-brand">{activeCol.name}</h2>
                        <p className="text-xs text-brand-faint font-semibold mt-1">
                          Folder contains {activeCol.items.length} visuals.
                        </p>
                      </div>

                      {/* Displaying collection items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCol.items.length === 0 ? (
                          <div className="col-span-2 py-16 text-center text-xs text-brand-faint italic bg-white border border-brand-border rounded-2xl shadow-sm">
                            This collection is currently empty.
                          </div>
                        ) : (
                          realDownloads.slice(0, activeCol.items.length).map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border border-brand-border rounded-xl p-4 flex items-center justify-between shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#f3f3f3] rounded-lg flex items-center justify-center text-2xl border border-brand-border overflow-hidden">
                                  {item.images?.thumbnail_url ? <img src={item.images.thumbnail_url} alt="thumb" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand/10"></div>}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-brand line-clamp-1">
                                    {item.images?.title || "Untitled"}
                                  </span>
                                  <span className="text-[9px] text-brand-faint font-semibold">
                                    {item.download_type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  href={`/image/${item.image_id}`}
                                  className="p-1.5 bg-[#f3f3f3] hover:bg-brand text-brand hover:text-white rounded-lg transition-colors border border-brand-border"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal for creating a new collection */}
            {showColModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 backdrop-blur-sm p-4">
                <form
                  onSubmit={handleCreateCollection}
                  className="bg-white border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4"
                >
                  <h3 className="font-extrabold text-sm text-brand">
                    Create New Collection Folder
                  </h3>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Mind Maps"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowColModal(false)}
                      className="flex-1 py-2.5 text-xs font-bold border border-brand-border text-brand rounded-xl hover:bg-[#f3f3f3]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-brand hover:bg-brand text-white font-extrabold text-xs py-2.5 rounded-xl"
                    >
                      Create Folder
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ================= SUBSCRIPTION TAB ================= */}
        {activeTab === "subscription" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Subscription Details
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                Verify and manage your premium subscription billing tier.
              </p>
            </div>

            {/* FREE USER INTERFACE */}
            {!isPremium ? (
              <div className="flex flex-col gap-6">
                
                {/* Plan box */}
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-[rgba(0,57,60,0.5)]">
                      Current Plan Tier
                    </span>
                    <span className="text-xl font-black text-brand mt-1 flex items-center gap-1.5">
                      Free Membership
                    </span>
                    <span className="text-xs text-brand-muted mt-0.5">
                      Limited to 5 watermarked downloads per day.
                    </span>
                  </div>

                  <Link
                    href="/pricing"
                    className="bg-brand hover:bg-brand text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Crown className="w-4 h-4 text-white" />
                    Upgrade to Premium
                  </Link>
                </div>

                {/* Premium Benefits List */}
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-brand">
                    Why upgrade to Premium?
                  </h3>
                  <ul className="text-xs text-[rgba(0,57,60,0.85)] font-semibold space-y-2.5">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-extrabold">✓</span> Unlimited high-resolution HD downloads without watermarks.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-extrabold">✓</span> Full access to SVG vector, PNG, and JPG formats.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-extrabold">✓</span> Save and organize unlimited custom Collections.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-extrabold">✓</span> Priority customer support and early access to new syllabus updates.
                    </li>
                  </ul>
                </div>

                {/* FAQ Accordion */}
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-brand">
                    Frequently Asked Questions
                  </h3>
                  <div className="flex flex-col gap-3.5 text-xs">
                    <details className="group border-b border-brand-border pb-3 cursor-pointer">
                      <summary className="font-extrabold list-none flex justify-between items-center text-brand">
                        How does billing work?
                        <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-brand" />
                      </summary>
                      <p className="text-brand-muted font-medium leading-relaxed mt-2 pl-1">
                        Subscriptions are billed monthly or annually. You can upgrade instantly using Sri Lanka's PayHere payment gateway supporting credit cards and mobile wallets.
                      </p>
                    </details>
                    <details className="group border-b border-brand-border pb-3 cursor-pointer">
                      <summary className="font-extrabold list-none flex justify-between items-center text-brand">
                        Can I cancel my subscription anytime?
                        <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-brand" />
                      </summary>
                      <p className="text-brand-muted font-medium leading-relaxed mt-2 pl-1">
                        Yes, you can cancel or pause your subscription directly from your account page. Your Premium access will remain active until the end of your billing cycle.
                      </p>
                    </details>
                  </div>
                </div>

              </div>
            ) : (
              // PREMIUM USER INTERFACE
              <div className="flex flex-col gap-6">
                
                {/* Active Plan Card */}
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-[rgba(0,57,60,0.5)]">
                      Current Plan Tier
                    </span>
                    <span className="text-xl font-black text-brand mt-1 flex items-center gap-1.5">
                      Student Premium <Crown className="w-5 h-5 text-brand" />
                    </span>
                    <span className="text-xs text-brand-muted mt-0.5">
                      {formatLKR(499)}/month · Renews on July 22, 2026
                    </span>
                  </div>

                  <button
                    onClick={() => window.open("https://payhere.lk/pay/checkout", "_blank")}
                    className="bg-white border border-brand-border hover:bg-[#f3f3f3] text-brand font-bold text-xs px-5 py-3 rounded-xl transition-all"
                  >
                    Manage Billing Portal
                  </button>
                </div>

                {/* Sub info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[rgba(0,57,60,0.5)]">
                      Billing Period
                    </span>
                    <p className="text-base font-black text-brand mt-1">
                      Monthly Cycle
                    </p>
                    <span className="text-[9px] text-brand-faint font-semibold mt-1 block">
                      Renewals handle automatically
                    </span>
                  </div>
                  <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[rgba(0,57,60,0.5)]">
                      Downloads Count
                    </span>
                    <p className="text-base font-black text-brand mt-1">
                      Unlimited Downloads
                    </p>
                    <span className="text-[9px] text-brand-faint font-semibold mt-1 block">
                      Exempt from daily limits
                    </span>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-extrabold text-sm text-brand mb-4">
                    Invoice Billing History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border text-[rgba(0,57,60,0.5)] uppercase tracking-wider font-bold">
                          <th className="pb-2">Invoice ID</th>
                          <th className="pb-2">Billing Date</th>
                          <th className="pb-2">Details</th>
                          <th className="pb-2">Amount LKR</th>
                          <th className="pb-2 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="font-medium text-brand divide-y divide-[rgba(0,57,60,0.04)]">
                        <tr>
                          <td className="py-3 font-semibold">INV_9482</td>
                          <td className="py-3">June 22, 2026</td>
                          <td className="py-3">Premium Renewal</td>
                          <td className="py-3">{formatLKR(499)}</td>
                          <td className="py-3 text-right">
                            <button onClick={() => { alert("Invoice download coming soon. Contact support@eduvisuals.lk"); }} className="text-brand font-bold hover:underline">
                              Download
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold">INV_8310</td>
                          <td className="py-3">May 22, 2026</td>
                          <td className="py-3">Premium Activation</td>
                          <td className="py-3">{formatLKR(499)}</td>
                          <td className="py-3 text-right">
                            <button onClick={() => { alert("Invoice download coming soon. Contact support@eduvisuals.lk"); }} className="text-brand font-bold hover:underline">
                              Download
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Account Settings
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                Configure your login credentials and visual interface options.
              </p>
            </div>

            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm text-brand border-b border-brand-border pb-2">
                User Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-faint uppercase">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[#f3f3f3] text-brand border border-brand-border px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-faint uppercase">Email address</label>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className="bg-[#f3f3f3] text-brand/70 border border-brand-border px-3.5 py-3 rounded-xl outline-none cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-faint uppercase">Member Role</label>
                  <input
                    type="text"
                    disabled
                    value={user.role}
                    className="bg-[#f3f3f3] text-brand/70 border border-brand-border px-3.5 py-3 rounded-xl outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-2">
                <button onClick={handleSaveSettings} disabled={savingSettings}
                  className="px-6 py-2.5 bg-brand text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all">
                  {settingsSaved ? "✓ Saved!" : savingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm text-brand border-b border-brand-border pb-2">
                Account Actions
              </h3>
              <div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    localStorage.removeItem("edu_user");
                    router.push("/");
                  }}
                  className="px-6 py-2.5 bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm text-brand border-b border-brand-border pb-2">
                Sandbox Mode Simulator Actions
              </h3>
              
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    const next = { ...user, tier: isPremium ? "Free" : "Premium" };
                    localStorage.setItem("edu_user", JSON.stringify(next));
                    window.dispatchEvent(new Event("auth-changed"));
                    alert(`Simulated tier switched to: ${next.tier}`);
                  }}
                  className="bg-brand hover:bg-brand text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                >
                  Toggle Premium Mode Simulator
                </button>

                <button
                  onClick={() => {
                    const next = { ...user, role: user.role === "admin" ? "free_user" : "admin" };
                    localStorage.setItem("edu_user", JSON.stringify(next));
                    window.dispatchEvent(new Event("auth-changed"));
                    alert(`Simulated role switched to: ${next.role}`);
                  }}
                  className="bg-brand hover:bg-brand text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                >
                  Toggle Admin Role Simulator
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. BOTTOM NAVIGATION BAR (Mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border p-2 md:hidden flex justify-around items-center shadow-lg select-none">
        {[
          { id: "overview", label: "Home", icon: HomeIcon },
          { id: "downloads", label: "Downloads", icon: Download },
          { id: "collections", label: "Saved", icon: Heart },
          { id: "subscription", label: "Billing", icon: Star },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedCollection(null);
              }}
              className="flex flex-col items-center gap-1 text-[9px] font-bold w-16"
            >
              <TabIcon className={cn("w-5 h-5", active ? "text-brand scale-105" : "text-[rgba(0,57,60,0.45)]")} />
              <span className={active ? "text-brand" : "text-brand-faint"}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
