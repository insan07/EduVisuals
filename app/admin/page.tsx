"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  LayoutDashboard,
  Upload,
  Layers,
  Bell,
  Users,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  UserX,
  FileImage,
  ChevronRight,
  Shield,
  X
} from "lucide-react";
import { formatLKR, formatDownloadCount } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const SUBJECTS = ["Biology","Chemistry","Physics","Mathematics","History","Geography","ICT","Commerce","Art"];
const GRADES = ["Grade 1-5","Grade 6-9","OL","AL","University"];
const TYPES = ["Diagram","Mind Map","Illustration","Flowchart","Timeline","Graph","Table","Cheat Sheet"];
const SYLLABUSES = ["National Syllabus","Cambridge","Edexcel","Local University"];
const MEDIUMS = ["English Medium","Sinhala Medium","Tamil Medium"];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string; tier: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "upload" | "manage" | "queue" | "team" | "analytics" | "partners">("overview");

  // State managers
  const [images, setImages] = useState<any[]>([]);
  
  // Upload wizard states
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadSubject, setUploadSubject] = useState("Biology");
  const [uploadGrade, setUploadGrade] = useState<string[]>(["OL"]);
  const [uploadType, setUploadType] = useState("Diagram");
  const [uploadIsPremium, setUploadIsPremium] = useState(false);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadSyllabus, setUploadSyllabus] = useState("National Syllabus");
  const [uploadMedium, setUploadMedium] = useState("English Medium");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadError2, setUploadError2] = useState<string | null>(null);
  const [uploadSuccess2, setUploadSuccess2] = useState<string | null>(null);
  const adminFileRef = useRef<HTMLInputElement>(null);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"team_creator" | "moderator">("team_creator");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Reject queue state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Manage content search
  const [manageSearch, setManageSearch] = useState("");

  const loadImages = async () => {
    if (!isSupabaseConfigured()) return;
    const { data } = await supabase
      .from('images')
      .select('id, title, status, is_premium, download_count, created_at, rejection_reason, uploaded_by, image_tags(tag, tag_type)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setImages(data);
  };

  const [partners, setPartners] = useState<any[]>([]);
  
  const loadPartners = async () => {
    const { data } = await supabase
      .from("partners")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false });
    if (data) setPartners(data);
  };

  // Sync user state from Supabase session (with localStorage fallback)
  useEffect(() => {
    const checkAuth = async () => {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/'); return; }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();
        const role = profile?.role || 'free_user';
        if (role !== 'admin' && role !== 'moderator') {
          router.push('/dashboard');
          return;
        }
        setUser({ email: session.user.email || '', role, tier: 'Free' });
        loadImages();
        loadPartners();
      } else {
        // Fallback: localStorage
        const stored = localStorage.getItem('edu_user');
        if (!stored) { router.push('/'); return; }
        try {
          const parsed = JSON.parse(stored);
          if (parsed.role !== 'admin' && parsed.role !== 'moderator') {
            router.push('/dashboard'); return;
          }
          setUser(parsed);
        } catch { router.push('/'); }
      }
    };
    checkAuth();
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen bg-brand-surface items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  // Handle Tag Input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !uploadTags.includes(val)) {
        setUploadTags([...uploadTags, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setUploadTags(uploadTags.filter((t) => t !== tag));
  };

  // AI Suggest Tags Simulator
  const handleAISuggestTags = () => {
    const list = [
      uploadSubject,
      "Study aid",
      "Diagram",
      "Mind Map",
      "Revision Note",
      "GCE Syllabus",
      "High Resolution",
      "EduVisuals",
    ];
    setUploadTags(Array.from(new Set([...uploadTags, ...list])));
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadTitle || !uploadDesc) {
      setUploadError2("Please fill all required fields and select a file.");
      return;
    }
    setUploadError2(null);
    setUploadSuccess2(null);
    setUploadProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setUploadError2("Not logged in."); setUploadProgress(0); return; }

      // 1.5 Cloudinary Upload (Thumbnail)
      let thumbnailUrl = "";
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      if (cloudName && uploadPreset) {
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("upload_preset", uploadPreset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
          });
          const data = await res.json();
          if (data.secure_url) {
            thumbnailUrl = data.secure_url;
          }
        } catch (e) {
          console.error("Cloudinary upload failed", e);
        }
      }

      // Upload file to Supabase Storage
      const ext = selectedFile.name.split('.').pop();
      const fileName = `visuals/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: storageErr } = await supabase.storage
        .from("images")
        .upload(fileName, selectedFile, { cacheControl: "3600" });

      if (storageErr) throw new Error("Storage upload failed: " + storageErr.message);
      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
      
      if (!thumbnailUrl) thumbnailUrl = publicUrl;

      // Insert to DB
      const { data: imgRecord, error: dbErr } = await supabase
        .from("images")
        .insert({
          title: uploadTitle,
          description: uploadDesc,
          alt_text: uploadAltText || uploadTitle,
          file_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          is_premium: uploadIsPremium,
          is_published: true,
          status: "approved",
          uploaded_by: session.user.id,
          approved_by: session.user.id,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbErr) throw new Error("DB insert failed: " + dbErr.message);
      setUploadProgress(85);

      // Insert tags
      const tagsToInsert = [
        { image_id: imgRecord.id, tag: uploadSubject, tag_type: "subject" },
        { image_id: imgRecord.id, tag: uploadType, tag_type: "type" },
        { image_id: imgRecord.id, tag: uploadSyllabus, tag_type: "syllabus" },
        { image_id: imgRecord.id, tag: uploadMedium, tag_type: "medium" },
        ...uploadGrade.map(g => ({ image_id: imgRecord.id, tag: g, tag_type: "grade" })),
        ...uploadTags.map(t => ({ image_id: imgRecord.id, tag: t, tag_type: "custom" })),
      ];
      await supabase.from("image_tags").insert(tagsToInsert);
      setUploadProgress(100);
      setUploadSuccess2(imgRecord.id);

      // Reset form after 3s
      setTimeout(() => {
        setUploadTitle(""); setUploadDesc(""); setUploadAltText("");
        setUploadTags([]); setSelectedFile(null); setFilePreview(null);
        setUploadProgress(0); setUploadSuccess2(null); setUploadStep(1);
        loadImages();
      }, 3000);

    } catch (err: any) {
      setUploadError2(err.message || "Upload failed.");
      setUploadProgress(0);
    }
  };

  // Queue Approval
  const handleApproveQueue = (id: string) => {
    setImages(images.map((img) => (img.id === id ? { ...img, status: "approved" } : img)));
    alert("Visual approved and published live!");
  };

  // Queue Rejection
  const handleRejectQueueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    setImages(images.map((img) => (img.id === rejectId ? { ...img, status: "rejected" } : img)));
    setRejectId(null);
    setRejectReason("");
    alert("Visual rejected and returned to team contributor.");
  };

  // Invite Team Creator
  const handleInviteTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember = {
      id: "t_" + Date.now(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      joined: new Date().toISOString().split("T")[0],
      count: 0,
      is_active: true,
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail("");
    setShowInviteModal(false);
    alert("Magic invitation link dispatched via email!");
  };

  // Toggle user state
  const handleToggleTeamStatus = (id: string) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, is_active: !m.is_active } : m))
    );
  };

  const pendingQueue = images.filter((img) => img.status === "pending_review");
  const filteredInventory = images.filter(
    (img) =>
      img.title.toLowerCase().includes(manageSearch.toLowerCase()) ||
      img.subject.toLowerCase().includes(manageSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-brand-surface text-brand pt-14 md:pt-16 select-none">
      
      {/* 1. ADMIN SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-brand-border bg-white p-6 justify-between sticky top-16 h-[calc(100vh-64px)] z-30 flex-shrink-0">
        <div className="flex flex-col gap-6">
          
          {/* Header role */}
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <Shield className="w-5 h-5 text-brand" />
            <span className="text-xs font-black uppercase text-brand tracking-wider">
              Admin Workspace
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 text-xs font-bold">
            {[
              { id: "overview", label: "Overview Feed", icon: LayoutDashboard },
              { id: "upload", label: "Upload Images", icon: Upload },
              { id: "manage", label: "Manage Inventory", icon: Layers },
              { id: "queue", label: `Review Queue (${pendingQueue.length})`, icon: Bell },
              { id: "team", label: "Team Members", icon: Users },
              { id: "partners", label: "Partners", icon: Users },
              { id: "analytics", label: "Traffic Analytics", icon: BarChart3 },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'upload' ? router.push('/upload') : setActiveTab(tab.id as any)}
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

        {/* User Badge */}
        <div className="flex items-center gap-3 p-3 bg-brand-surface border border-brand-border rounded-xl">
          <div className="w-8 h-8 rounded-full bg-brand text-white font-black text-xs flex items-center justify-center">
            A
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-brand truncate">
              {user.email}
            </span>
            <span className="text-[8px] text-brand font-black uppercase tracking-wider">
              {user.role} Authority
            </span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Overview Dashboard
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                EduVisuals.lk real-time system metrics.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-brand-border p-4 rounded-xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Total Visuals</span>
                <p className="text-lg font-black text-brand mt-1">10,432</p>
              </div>
              <div className="bg-white border border-brand-border p-4 rounded-xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Total Users</span>
                <p className="text-lg font-black text-brand mt-1">5,821</p>
              </div>
              <div className="bg-white border border-brand-border p-4 rounded-xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Subscribers</span>
                <p className="text-lg font-black text-brand mt-1">234</p>
              </div>
              <div className="bg-white border border-brand-border p-4 rounded-xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-[rgba(0,57,60,0.5)]">DLs Today</span>
                <p className="text-lg font-black text-brand mt-1">12,441</p>
              </div>
              <div className="bg-white border border-brand-border p-4 rounded-xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Month Revenue</span>
                <p className="text-lg font-black text-brand mt-1">{formatLKR(116766)}</p>
              </div>
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Activity feed */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-sm text-brand mb-4">
                  Recent Platform Activity
                </h3>
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                    <span className="text-brand">New subscription activated (Monthly Student)</span>
                    <span className="text-[10px] text-brand-faint">2 mins ago</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                    <span className="text-brand">User uploaded "AC Generator Diagram" for review</span>
                    <span className="text-[10px] text-brand-faint">15 mins ago</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                    <span className="text-brand">Rejection email dispatched to contributor</span>
                    <span className="text-[10px] text-brand-faint">1 hour ago</span>
                  </div>
                </div>
              </div>

              {/* Quick queue review */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-brand mb-2">
                    Review Queue Tasks
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                    There are currently {pendingQueue.length} files awaiting editorial review and publication clearance.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("queue")}
                  className="w-full bg-brand hover:bg-brand text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm mt-4 flex items-center justify-center gap-1.5"
                >
                  Clear Queue Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ================= UPLOAD IMAGES TAB ================= */}
        {activeTab === "upload" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Upload Visual Asset
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                Inject high-resolution diagrams and study charts into the public visual library.
              </p>
            </div>

            {/* Wizard progress bar */}
            <div className="flex items-center gap-4 text-xs font-bold text-brand-faint">
              <span className={uploadStep === 1 ? "text-brand font-black" : ""}>Step 1: File</span>
              <ChevronRight className="w-4.5 h-4.5 text-[rgba(0,57,60,0.3)]" />
              <span className={uploadStep === 2 ? "text-brand font-black" : ""}>Step 2: Metadata</span>
              <ChevronRight className="w-4.5 h-4.5 text-[rgba(0,57,60,0.3)]" />
              <span className={uploadStep === 3 ? "text-brand font-black" : ""}>Step 3: Publish</span>
            </div>

            {/* STEP 1 — File Drop Zone */}
            {uploadStep === 1 && (
              <div className="flex flex-col gap-6 p-6 md:p-8">
                <div
                  onClick={() => adminFileRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setSelectedFile(file);
                      if (file.type.startsWith("image/")) setFilePreview(URL.createObjectURL(file));
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    selectedFile ? "border-brand bg-brand/5" : "border-brand-border hover:border-brand/50 hover:bg-[#f3f3f3]"
                  }`}
                >
                  {filePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={filePreview} alt="Preview" className="max-h-52 mx-auto rounded-xl object-contain shadow" />
                      <p className="text-xs font-bold text-brand">{selectedFile?.name}</p>
                      <p className="text-[10px] text-brand-faint">{selectedFile ? (selectedFile.size/1024/1024).toFixed(2) : 0} MB</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFilePreview(null); }}
                        className="text-[10px] text-red-500 font-bold hover:underline">Remove file</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-14 h-14 text-brand/20" />
                      <p className="text-base font-bold text-brand/60">Click to select or drag & drop image here</p>
                      <p className="text-xs text-brand-faint">PNG · JPG · WebP · SVG — Maximum 20MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={adminFileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 20 * 1024 * 1024) { alert("File too large. Max 20MB."); return; }
                    setSelectedFile(file);
                    if (file.type.startsWith("image/")) setFilePreview(URL.createObjectURL(file));
                  }}
                />
                <button
                  onClick={() => selectedFile ? setUploadStep(2) : null}
                  disabled={!selectedFile}
                  className="w-full bg-brand text-white font-black text-xs py-3.5 rounded-xl disabled:opacity-40 transition-all"
                >
                  Continue to Image Details →
                </button>
              </div>
            )}

            {/* STEP 2 — Metadata */}
            {uploadStep === 2 && (
              <div className="p-6 md:p-8 flex flex-col gap-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Visual Title *</label>
                  <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Plant Cell Structure Diagram — O/L Biology"
                    className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all" />
                </div>
                
                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Description * (for SEO)</label>
                  <textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} rows={3}
                    placeholder="Describe the diagram content, curriculum topics covered, and which students will benefit..."
                    className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all resize-none" />
                </div>

                {/* Alt Text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Alt Text * (Google Image SEO)</label>
                  <input value={uploadAltText} onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder="e.g. Plant cell diagram showing chloroplast, cell wall, and mitochondria for OL Biology"
                    className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Subject *</label>
                    <select value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand">
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Visual Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Visual Type *</label>
                    <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand">
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {/* Syllabus */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Syllabus</label>
                    <select value={uploadSyllabus} onChange={(e) => setUploadSyllabus(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none">
                      {SYLLABUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Medium */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Language Medium</label>
                    <select value={uploadMedium} onChange={(e) => setUploadMedium(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none">
                      {MEDIUMS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Grade Level */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Grade Level(s) *</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map(g => (
                      <button key={g} type="button"
                        onClick={() => setUploadGrade(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          uploadGrade.includes(g) ? "bg-brand text-white border-brand" : "bg-[#f3f3f3] text-brand/70 border-brand-border hover:border-brand/40"
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Tags */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Custom Tags (topic keywords)</label>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if(e.key==="Enter"){e.preventDefault();const v=tagInput.trim();if(v&&!uploadTags.includes(v)&&uploadTags.length<10){setUploadTags([...uploadTags,v]);setTagInput("");}}}}
                      placeholder="Type topic e.g. Photosynthesis, press Enter..."
                      className="flex-1 bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand" />
                    <button type="button" onClick={() => {const v=tagInput.trim();if(v&&!uploadTags.includes(v)){setUploadTags([...uploadTags,v]);setTagInput("");}}}
                      className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {uploadTags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f3f3f3] border border-brand-border rounded-full text-[10px] font-bold text-brand">
                        {t}
                        <button type="button" onClick={() => setUploadTags(uploadTags.filter(x=>x!==t))}
                          className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Tag Suggest */}
                <button type="button" onClick={handleAISuggestTags}
                  className="w-full py-2.5 border border-brand-border text-brand font-bold text-xs rounded-xl hover:bg-[#f3f3f3] transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Auto-suggest Tags from Subject & Title
                </button>

                {/* Premium toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setUploadIsPremium(!uploadIsPremium)}
                    className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${uploadIsPremium ? "bg-brand" : "bg-[#e0e0e0]"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${uploadIsPremium ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-xs font-black text-brand flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" /> Mark as Premium Content
                  </span>
                </label>

                <div className="flex gap-3">
                  <button onClick={() => setUploadStep(1)} className="flex-1 py-3 border border-brand-border text-brand font-bold text-xs rounded-xl hover:bg-[#f3f3f3]">
                    ← Back
                  </button>
                  <button onClick={() => uploadTitle && uploadDesc ? setUploadStep(3) : null}
                    disabled={!uploadTitle || !uploadDesc || uploadGrade.length === 0}
                    className="flex-1 bg-brand text-white font-black text-xs py-3 rounded-xl disabled:opacity-40 transition-all">
                    Review & Publish →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Review & Submit */}
            {uploadStep === 3 && (
              <div className="p-6 md:p-8 flex flex-col gap-5">
                <div className="bg-[#f3f3f3] rounded-2xl p-5 grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Title</span><p className="font-black text-brand mt-0.5">{uploadTitle}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Subject</span><p className="font-black text-brand mt-0.5">{uploadSubject}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Type</span><p className="font-black text-brand mt-0.5">{uploadType}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Grades</span><p className="font-black text-brand mt-0.5">{uploadGrade.join(", ")}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Syllabus</span><p className="font-black text-brand mt-0.5">{uploadSyllabus}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Medium</span><p className="font-black text-brand mt-0.5">{uploadMedium}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">File</span><p className="font-black text-brand mt-0.5 truncate">{selectedFile?.name}</p></div>
                  <div><span className="text-[10px] uppercase text-brand-faint font-bold">Access</span>
                    <p className={`font-black mt-0.5 ${uploadIsPremium ? "text-amber-600" : "text-emerald-600"}`}>{uploadIsPremium ? "Premium" : "Free"}</p>
                  </div>
                </div>

                {filePreview && <img src={filePreview} className="max-h-40 rounded-xl object-contain mx-auto" alt="Preview" />}

                {uploadError2 && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl p-3">{uploadError2}</div>}
                {uploadSuccess2 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Published successfully!</span>
                    <a href={`/image/${uploadSuccess2}`} target="_blank" className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700">View Live →</a>
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold text-brand-muted">
                      <span>Uploading to storage...</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-[#f3f3f3] rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all" style={{width:`${uploadProgress}%`}} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setUploadStep(2)} disabled={uploadProgress > 0}
                    className="flex-1 py-3 border border-brand-border text-brand font-bold text-xs rounded-xl hover:bg-[#f3f3f3] disabled:opacity-40">← Edit</button>
                  <button onClick={handleUploadSubmit} disabled={uploadProgress > 0 || !!uploadSuccess2}
                    className="flex-1 bg-brand text-white font-black text-xs py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {uploadProgress > 0 ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"/>Uploading...</> : <><Upload className="w-3.5 h-3.5"/>Publish Now</>}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= MANAGE INVENTORY TAB ================= */}
        {activeTab === "manage" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-brand">
                  Manage Content Inventory
                </h1>
                <p className="text-xs text-brand-muted font-semibold mt-1">
                  Edit, delete, and manage platform visual cards details.
                </p>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-brand-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inventory title..."
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-brand-faint text-xs pl-9 pr-3 py-2 rounded-lg outline-none focus:border-brand focus:bg-white"
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border bg-[#f3f3f3] text-brand-muted uppercase font-bold text-[10px] tracking-wide">
                    <th className="p-3">Title</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Downloads</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,57,60,0.05)] text-brand font-semibold">
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-bold">{item.title}</td>
                      <td className="p-3">{item.subject}</td>
                      <td className="p-3">{item.grade}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.isPremium ? "bg-brand text-white" : "bg-[#f3f3f3] text-brand"
                        }`}>
                          {item.isPremium ? "Premium" : "Free"}
                        </span>
                      </td>
                      <td className="p-3">{formatDownloadCount(item.downloads)}</td>
                      <td className="p-3 text-right flex justify-end gap-1.5">
                        <button
                          onClick={() => alert(`Opening edit slider for image ID: ${item.id}`)}
                          className="p-1.5 hover:bg-[#f3f3f3] rounded-lg text-brand border border-brand-border"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this visual?")) {
                              setImages(images.filter((img) => img.id !== item.id));
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border border-brand-border hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= REVIEW QUEUE TAB ================= */}
        {activeTab === "queue" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Review Queue Queue
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                Approve or reject visual uploads submitted by team creators.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {pendingQueue.length === 0 ? (
                <div className="py-16 text-center text-xs text-brand-faint italic bg-white border border-brand-border rounded-2xl shadow-sm">
                  Review queue is currently empty. No items waiting approval.
                </div>
              ) : (
                pendingQueue.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#f3f3f3] rounded-lg flex items-center justify-center text-2xl border border-brand-border">
                        🎨
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-brand">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-brand-faint font-semibold mt-0.5">
                          Subject: {item.subject} · Grade: {item.grade} · Submitter: creator@eduvisuals.lk
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveQueue(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectId(item.id);
                          setRejectReason("");
                        }}
                        className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rejection Modal */}
            {rejectId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 backdrop-blur-sm p-4">
                <form
                  onSubmit={handleRejectQueueSubmit}
                  className="bg-white border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-xs font-semibold"
                >
                  <h3 className="font-extrabold text-sm text-brand">
                    Provide Rejection Feedback
                  </h3>
                  <textarea
                    required
                    rows={3}
                    placeholder="Specify the edits needed from the team member..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setRejectId(null)}
                      className="flex-1 py-2.5 text-xs font-bold border border-brand-border text-brand rounded-xl hover:bg-[#f3f3f3]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl"
                    >
                      Reject Submission
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ================= TEAM MEMBERS TAB ================= */}
        {activeTab === "team" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-brand">
                  Manage Team Members
                </h1>
                <p className="text-xs text-brand-muted font-semibold mt-1">
                  Invite content creators and moderators, and manage system roles.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-brand hover:bg-brand text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Invite Creator
              </button>
            </div>

            {/* List */}
            <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border bg-[#f3f3f3] text-brand-muted uppercase font-bold text-[10px] tracking-wide">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">System Role</th>
                    <th className="p-3">Uploads Count</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,57,60,0.05)] text-brand font-semibold">
                  {teamMembers.map((m) => (
                    <tr key={m.id} className={!m.is_active ? "opacity-50" : ""}>
                      <td className="p-3 font-bold">{m.name}</td>
                      <td className="p-3">{m.email}</td>
                      <td className="p-3 uppercase text-[9px] font-black">{m.role.replace("_", " ")}</td>
                      <td className="p-3">{m.count} images</td>
                      <td className="p-3 text-right flex justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleTeamStatus(m.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            m.is_active
                              ? "hover:bg-red-50 text-red-500 border-brand-border hover:border-red-100"
                              : "hover:bg-emerald-50 text-emerald-600 border-brand-border hover:border-emerald-100"
                          }`}
                          title={m.is_active ? "Deactivate" : "Activate"}
                        >
                          {m.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 backdrop-blur-sm p-4">
                <form
                  onSubmit={handleInviteTeamSubmit}
                  className="bg-white border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-xs font-semibold"
                >
                  <h3 className="font-extrabold text-sm text-brand">
                    Invite Creator / Moderator
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-brand-faint uppercase">Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="creator@eduvisuals.lk"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-brand-faint uppercase">Platform role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-[#f3f3f3] border border-brand-border text-brand px-3.5 py-3 rounded-xl outline-none"
                    >
                      <option value="team_creator">Content Creator</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-2.5 text-xs font-bold border border-brand-border text-brand rounded-xl hover:bg-[#f3f3f3]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-brand hover:bg-brand text-white font-extrabold text-xs py-2.5 rounded-xl"
                    >
                      Dispatched Invitation
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ================= PARTNERS TAB ================= */}
        {activeTab === "partners" && (
          <div className="flex flex-col gap-4 p-6">
            <h2 className="text-lg font-black text-brand">Partner Applications</h2>
            {partners.map(p => (
              <div key={p.id} className="bg-white border border-brand-border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-black text-brand">{p.business_name}</p>
                  <p className="text-xs text-brand-muted">{p.contact_email} · Applied {new Date(p.created_at).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(p.subject_specialties || []).map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 bg-brand/10 text-brand rounded-full font-bold">{s}</span>
                    ))}
                  </div>
                  {p.description && <p className="text-xs text-brand-muted mt-2 line-clamp-2">{p.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                    p.status==="approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    p.status==="rejected" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>{p.status}</span>
                  {p.status === "pending" && (
                    <>
                      <button
                        onClick={async () => {
                          await supabase.from("partners").update({status:"approved",approved_at:new Date().toISOString()}).eq("id",p.id);
                          await supabase.from("profiles").update({role:"team_creator"}).eq("id",p.user_id);
                          loadPartners();
                          alert(`✅ ${p.business_name} approved! They now have upload access.`);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg hover:bg-emerald-600">
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt("Rejection reason (will be shown to applicant):");
                          if (!reason) return;
                          await supabase.from("partners").update({status:"rejected",rejection_reason:reason}).eq("id",p.id);
                          loadPartners();
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-black rounded-lg hover:bg-red-100">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {partners.length === 0 && (
              <div className="text-center py-16 text-brand-muted text-sm">No partner applications yet.</div>
            )}
          </div>
        )}

        {/* ================= ANALYTICS TAB ================= */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-brand">
                  Traffic & Downloads Analytics
                </h1>
                <p className="text-xs text-brand-muted font-semibold mt-1">
                  Review subject statistics, download spikes, and metric reports.
                </p>
              </div>
              <button
                onClick={() => alert("Exporting metrics report (CSV)...")}
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                Export CSV Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic distribution by subjects */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand mb-4">
                  Downloads Distribution by Subject
                </h3>
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  {[
                    { sub: "Biology", percent: 45, count: 5600 },
                    { sub: "History", percent: 25, count: 3100 },
                    { sub: "Chemistry", percent: 15, count: 1870 },
                    { sub: "Physics", percent: 15, count: 1870 },
                  ].map((x) => (
                    <div key={x.sub} className="flex flex-col gap-1">
                      <div className="flex justify-between font-bold text-brand">
                        <span>{x.sub}</span>
                        <span>{x.percent}% ({x.count} DLs)</span>
                      </div>
                      <div className="w-full h-2 bg-[#f3f3f3] rounded-full overflow-hidden">
                        <div className="h-full bg-brand" style={{ width: `${x.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic distribution by grade levels */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand mb-4">
                  Traffic distribution by Grade Level
                </h3>
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  {[
                    { grade: "Ordinary Level (OL)", percent: 55, count: 6840 },
                    { grade: "Advanced Level (AL)", percent: 35, count: 4350 },
                    { grade: "Grade 6-9", percent: 10, count: 1250 },
                  ].map((x) => (
                    <div key={x.grade} className="flex flex-col gap-1">
                      <div className="flex justify-between font-bold text-brand">
                        <span>{x.grade}</span>
                        <span>{x.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#f3f3f3] rounded-full overflow-hidden">
                        <div className="h-full bg-brand" style={{ width: `${x.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
