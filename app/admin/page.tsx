"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  X,
  Check,
  Eye
} from "lucide-react";
import { formatLKR, formatDownloadCount } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { GRADES, SUBJECTS, TYPES, SYLLABUSES, MEDIUMS } from "@/lib/constants";
import EditVisualModal from "@/components/EditVisualModal";

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

  // Edit Image state
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editType, setEditType] = useState("");
  const [editSyllabus, setEditSyllabus] = useState("");
  const [editMedium, setEditMedium] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEdit = (img: any) => {
    setEditingImageId(img.id);
    setEditTitle(img.title || "");
    setEditDescription(img.description || "");
    setEditIsPremium(img.is_premium || false);

    const tags = img.image_tags || [];
    setEditGrade(tags.find((t: any) => t.tag_type === "grade")?.tag || "");
    setEditSubject(tags.find((t: any) => t.tag_type === "subject")?.tag || "");
    setEditType(tags.find((t: any) => t.tag_type === "type")?.tag || "");
    setEditSyllabus(tags.find((t: any) => t.tag_type === "syllabus")?.tag || "");
    setEditMedium(tags.find((t: any) => t.tag_type === "medium")?.tag || "");
    
    const customTags = tags
      .filter((t: any) => t.tag_type === "custom")
      .map((t: any) => t.tag);
    setEditTags(customTags);
  };

  const handleSaveEdit = async () => {
    if (!editingImageId || !isSupabaseConfigured()) return;
    setIsSavingEdit(true);
    try {
      // 1. Update images table
      const { error: updateError } = await supabase
        .from("images")
        .update({
          title: editTitle,
          description: editDescription,
          is_premium: editIsPremium
        })
        .eq("id", editingImageId);
        
      if (updateError) throw updateError;

      // 2. Delete old tags
      const { error: deleteError } = await supabase
        .from("image_tags")
        .delete()
        .eq("image_id", editingImageId);
        
      if (deleteError) throw deleteError;

      // 3. Insert new tags
      const newTags = [];
      if (editGrade) newTags.push({ image_id: editingImageId, tag_type: "grade", tag: editGrade });
      if (editSubject) newTags.push({ image_id: editingImageId, tag_type: "subject", tag: editSubject });
      if (editType) newTags.push({ image_id: editingImageId, tag_type: "type", tag: editType });
      if (editSyllabus) newTags.push({ image_id: editingImageId, tag_type: "syllabus", tag: editSyllabus });
      if (editMedium) newTags.push({ image_id: editingImageId, tag_type: "medium", tag: editMedium });
      
      editTags.forEach(tag => {
        if (tag) newTags.push({ image_id: editingImageId, tag_type: "custom", tag });
      });

      if (newTags.length > 0) {
        const { error: insertError } = await supabase
          .from("image_tags")
          .insert(newTags);
        if (insertError) throw insertError;
      }

      // 4. Refresh images state locally
      await loadImages();
      
      // Close modal
      setEditingImageId(null);
    } catch (e) {
      console.error("Failed to save edit", e);
      alert("Failed to save edits. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const loadImages = async () => {
    if (!isSupabaseConfigured()) return;
    const { data } = await supabase
      .from('images')
      .select('id, title, description, status, is_premium, download_count, created_at, rejection_reason, uploaded_by, image_tags(tag, tag_type)')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (data) setImages(data);
  };

  const [stats, setStats] = useState({
    totalVisuals: 0,
    totalUsers: 0,
    totalDownloads: 0,
  });

  const loadStats = async () => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const [{ count: visualsCount }, { count: usersCount }, { data: imagesData }] = await Promise.all([
        supabase.from('images').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('images').select('download_count')
      ]);
      
      const downloads = imagesData?.reduce((acc, img) => acc + (img.download_count || 0), 0) || 0;
      
      setStats({
        totalVisuals: visualsCount || 0,
        totalUsers: usersCount || 0,
        totalDownloads: downloads,
      });
    } catch (e) {
      console.error("Failed to load stats", e);
    }
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
        if (!session) { router.push('/?auth=required&next=/admin'); return; }
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
        loadStats();
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
      "LearnPik",
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
  const handleApproveQueue = async (id: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('images').update({ status: 'approved', is_published: true }).eq('id', id);
      if (error) {
        console.error("Error approving:", error);
        alert("Failed to approve visual. Please try again.");
        return;
      }
    }
    setImages(images.map((img) => (img.id === id ? { ...img, status: "approved", is_published: true } : img)));
    alert("Visual approved and published live!");
  };

  // Queue Rejection
  const handleRejectQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('images').update({ status: 'rejected', rejection_reason: rejectReason, is_published: false }).eq('id', rejectId);
      if (error) {
        console.error("Error rejecting:", error);
        alert("Failed to reject visual. Please try again.");
        return;
      }
    }

    setImages(images.map((img) => (img.id === rejectId ? { ...img, status: "rejected", rejection_reason: rejectReason } : img)));
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

  const subjectStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalDls = 0;
    images.forEach((img) => {
      const subj = img.image_tags?.find((t: any) => t.tag_type === 'subject')?.tag;
      if (subj) {
        counts[subj] = (counts[subj] || 0) + (img.download_count || 0);
        totalDls += (img.download_count || 0);
      }
    });
    return Object.entries(counts).map(([sub, count]) => ({
      sub,
      count,
      percent: totalDls > 0 ? Math.round((count / totalDls) * 100) : 0
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [images]);

  const gradeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    images.forEach((img) => {
      const grade = img.image_tags?.find((t: any) => t.tag_type === 'grade')?.tag;
      if (grade) {
        counts[grade] = (counts[grade] || 0) + 1;
        total += 1;
      }
    });
    return Object.entries(counts).map(([grade, count]) => ({
      grade,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [images]);
  const filteredInventory = images.map((img) => ({
    ...img,
    subject: img.image_tags?.find((t: any) => t.tag_type === 'subject')?.tag || "N/A",
    grade: img.image_tags?.find((t: any) => t.tag_type === 'grade')?.tag || "N/A",
  })).filter(
    (img) => {
      return (
        (img.title || "").toLowerCase().includes(manageSearch.toLowerCase()) ||
        img.subject.toLowerCase().includes(manageSearch.toLowerCase())
      );
    }
  );

  if (!user) {
    return (
      <div className="flex min-h-screen bg-brand-surface items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

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
              { id: "queue", label: `Review Queue (${pendingQueue.length})`, icon: Bell },
              ...(user.role === 'admin' ? [
                { id: "manage", label: "Manage Inventory", icon: Layers },
                { id: "team", label: "Team Members", icon: Users },
                { id: "partners", label: "Partners", icon: Users },
                { id: "analytics", label: "Traffic Analytics", icon: BarChart3 },
              ] : [])
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
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden overflow-x-auto pb-4 mb-4 flex gap-2 hide-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "queue", label: `Queue (${pendingQueue.length})`, icon: Bell },
            ...(user.role === 'admin' ? [
              { id: "manage", label: "Manage", icon: Layers },
              { id: "team", label: "Team", icon: Users },
              { id: "partners", label: "Partners", icon: Users },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ] : [])
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => tab.id === 'upload' ? router.push('/upload') : setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[10px] whitespace-nowrap flex-shrink-0 transition-colors ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "bg-white border border-brand-border text-[rgba(0,57,60,0.7)] hover:bg-[#f3f3f3]"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-brand">
                Overview Dashboard
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-1">
                LearnPik real-time system metrics.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-brand-border p-5 rounded-xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Total Visuals</span>
                <p className="text-2xl font-black text-brand mt-1">{stats.totalVisuals.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-brand-border p-5 rounded-xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Total Users</span>
                <p className="text-2xl font-black text-brand mt-1">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-brand-border p-5 rounded-xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[rgba(0,57,60,0.5)]">Total Downloads</span>
                <p className="text-2xl font-black text-brand mt-1">{stats.totalDownloads.toLocaleString()}</p>
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
                          item.is_premium ? "bg-brand text-white" : "bg-[#f3f3f3] text-brand"
                        }`}>
                          {item.is_premium ? "Premium" : "Free"}
                        </span>
                      </td>
                      <td className="p-3">{formatDownloadCount(item.download_count || 0)}</td>
                      <td className="p-3 text-right flex justify-end gap-1.5">
                        <a
                          href={`/image/${item.id}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 hover:bg-[#f3f3f3] rounded-lg text-brand border border-brand-border inline-flex items-center justify-center"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(item)}
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
                          Subject: {item.subject} · Grade: {item.grade} · Submitter: creator@learnpik.com
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
                      placeholder="creator@learnpik.com"
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
                  {subjectStats.map((x) => (
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
                  {subjectStats.length === 0 && <div className="text-brand-muted py-4">No data available</div>}
                </div>
              </div>

              {/* Traffic distribution by grade levels */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand mb-4">
                  Traffic distribution by Grade Level
                </h3>
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  {gradeStats.map((x) => (
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
                  {gradeStats.length === 0 && <div className="text-brand-muted py-4">No data available</div>}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= EDIT IMAGE MODAL ================= */}
        <EditVisualModal
          isOpen={!!editingImageId}
          onClose={() => setEditingImageId(null)}
          onSubmit={(e) => { if (e && e.preventDefault) e.preventDefault(); handleSaveEdit(); }}
          isSaving={isSavingEdit}
          editTitle={editTitle} setEditTitle={setEditTitle}
          editDescription={editDescription} setEditDescription={setEditDescription}
          editGrade={editGrade} setEditGrade={setEditGrade}
          editSubject={editSubject} setEditSubject={setEditSubject}
          editType={editType} setEditType={setEditType}
          editSyllabus={editSyllabus} setEditSyllabus={setEditSyllabus}
          editMedium={editMedium} setEditMedium={setEditMedium}
          editTags={editTags} setEditTags={setEditTags}
          editIsPremium={editIsPremium} setEditIsPremium={setEditIsPremium}
        />

      </main>

    </div>
  );
}
