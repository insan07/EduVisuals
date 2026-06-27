"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Layers,
  Sparkles,
  FileImage,
  ChevronRight,
  ChevronDown,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Crown,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { GRADES, SUBJECTS, TYPES, SYLLABUSES, MEDIUMS } from "@/lib/constants";
import EditVisualModal from "@/components/EditVisualModal";

type UploadStatus = "pending_review" | "approved" | "rejected" | "draft";

interface MyUpload {
  id: string;
  title: string;
  created_at: string;
  status: UploadStatus;
  view_count: number;
  download_count: number;
  rejection_reason: string | null;
  thumbnail_url: string | null;
  description: string | null;
  is_premium?: boolean;
  image_tags?: { tag: string; tag_type: string }[];
}

interface UploadMetadata {
  title: string;
  description: string;
  altText: string;
  isPremium: boolean;
  grades: string[];
  subjects: string[];
  types: string[];
  syllabuses: string[];
  mediums: string[];
  customTags: string[];
}

async function handleUpload(file: File, metadata: UploadMetadata, isAdmin: boolean) {
  // 1. Get current Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  // 1.5 Cloudinary Upload (Thumbnail)
  let thumbnailUrl = "";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append("file", file);
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

  // 2. Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `visuals/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });
  
  if (uploadError) throw uploadError;

  // 3. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  if (!thumbnailUrl) thumbnailUrl = publicUrl;

  // 4. Insert image record into database
  const { data: imageRecord, error: dbError } = await supabase
    .from("images")
    .insert({
      title: metadata.title,
      description: metadata.description,
      alt_text: metadata.altText,
      file_url: publicUrl,
      thumbnail_url: thumbnailUrl,
      is_premium: metadata.isPremium,
      is_published: isAdmin,            // Only admin publishes immediately
      status: isAdmin ? "approved" : "pending_review",  // Team goes to queue
      uploaded_by: session.user.id,
      approved_by: isAdmin ? session.user.id : null,
      published_at: isAdmin ? new Date().toISOString() : null,
    })
    .select()
    .single();
  
  if (dbError) throw dbError;

  // 5. Insert tags
  const tagsToInsert = [
    ...metadata.grades.map(g => ({ image_id: imageRecord.id, tag: g, tag_type: 'grade' })),
    ...metadata.subjects.map(s => ({ image_id: imageRecord.id, tag: s, tag_type: 'subject' })),
    ...metadata.types.map(t => ({ image_id: imageRecord.id, tag: t, tag_type: 'type' })),
    ...metadata.syllabuses.map(s => ({ image_id: imageRecord.id, tag: s, tag_type: 'syllabus' })),
    ...metadata.mediums.map(m => ({ image_id: imageRecord.id, tag: m, tag_type: 'medium' })),
    ...metadata.customTags.map(t => ({ image_id: imageRecord.id, tag: t, tag_type: 'custom' })),
  ];
  
  if (tagsToInsert.length > 0) {
    await supabase.from("image_tags").insert(tagsToInsert);
  }

  return imageRecord;
}

export default function ContributorUploadPortal() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);

  // Upload form states
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [type, setType] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [medium, setMedium] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // My uploads
  const [myUploads, setMyUploads] = useState<MyUpload[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [activeView, setActiveView] = useState<"upload" | "my-uploads">("upload");

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUploadId, setEditingUploadId] = useState<string | null>(null);
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

  // Auth check — must be logged in with correct role
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/?auth=required"); return; }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      const allowed = ["team_creator", "moderator", "admin"];
      if (!profile || !allowed.includes(profile.role)) {
        router.push("/dashboard");
        return;
      }
      setUserId(session.user.id);
      setUserRole(profile.role);
      setUserEmail(session.user.email || "");
      setAuthLoading(false);
    });
  }, [router]);

  // Load this user's uploaded images
  useEffect(() => {
    const loadMyUploads = async () => {
      if (!userId) return;
      setLoadingUploads(true);

      if (isSupabaseConfigured() && userId) {
        const { data, error } = await supabase
          .from("images")
          .select("id, title, description, is_premium, created_at, status, view_count, download_count, rejection_reason, thumbnail_url, image_tags(tag, tag_type)")
          .eq("uploaded_by", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setMyUploads(data as MyUpload[]);
        }
      } else {
        setMyUploads([]);
      }

      setLoadingUploads(false);
    };

    if (!authLoading) loadMyUploads();
  }, [userId, authLoading]);

  const handleDeleteUpload = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visual?")) return;
    try {
      const { error } = await supabase.from("images").delete().eq("id", id);
      if (error) throw error;
      setMyUploads((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Error deleting visual.");
    }
  };

  const openEditModal = (upload: MyUpload) => {
    setEditingUploadId(upload.id);
    setEditTitle(upload.title || "");
    setEditDescription(upload.description || "");
    setEditIsPremium(upload.is_premium || false);
    
    const tags = upload.image_tags || [];
    setEditGrade(tags.find(t => t.tag_type === "grade")?.tag || "");
    setEditSubject(tags.find(t => t.tag_type === "subject")?.tag || "");
    setEditType(tags.find(t => t.tag_type === "type")?.tag || "");
    setEditSyllabus(tags.find(t => t.tag_type === "syllabus")?.tag || "");
    setEditMedium(tags.find(t => t.tag_type === "medium")?.tag || "");
    
    const customTags = tags.filter(t => t.tag_type === "custom").map(t => t.tag);
    setEditTags(customTags);
    setEditTagInput("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUploadId) return;
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
        .eq("id", editingUploadId);

      if (updateError) throw updateError;

      // 2. Delete old tags
      const { error: deleteError } = await supabase
        .from("image_tags")
        .delete()
        .eq("image_id", editingUploadId);
        
      if (deleteError) throw deleteError;

      // 3. Insert new tags
      const newTags: any[] = [];
      if (editGrade) newTags.push({ image_id: editingUploadId, tag_type: "grade", tag: editGrade });
      if (editSubject) newTags.push({ image_id: editingUploadId, tag_type: "subject", tag: editSubject });
      if (editType) newTags.push({ image_id: editingUploadId, tag_type: "type", tag: editType });
      if (editSyllabus) newTags.push({ image_id: editingUploadId, tag_type: "syllabus", tag: editSyllabus });
      if (editMedium) newTags.push({ image_id: editingUploadId, tag_type: "medium", tag: editMedium });
      
      editTags.forEach(tag => {
        if (tag) newTags.push({ image_id: editingUploadId, tag_type: "custom", tag });
      });

      if (newTags.length > 0) {
        const { error: insertError } = await supabase
          .from("image_tags")
          .insert(newTags);
        if (insertError) throw insertError;
      }

      // Update local state without full reload
      setMyUploads((prev) =>
        prev.map((u) =>
          u.id === editingUploadId 
            ? { 
                ...u, 
                title: editTitle, 
                description: editDescription, 
                is_premium: editIsPremium,
                image_tags: newTags.map(t => ({ tag: t.tag, tag_type: t.tag_type }))
              } 
            : u
        )
      );
      
      setIsEditModalOpen(false);
      setEditingUploadId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: "main" | "thumb") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload only image files (SVG, PNG, JPG, JPEG).");
      return;
    }

    if (fileType === "main") {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSubmit = async () => {
    if (!title || !description || !selectedFile) {
      setUploadError("Please fill in all required fields and select a file.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(10);

    try {
      if (isSupabaseConfigured() && userId && userId !== "sandbox-user") {
        setUploadProgress(50);
        
        const metadata: UploadMetadata = {
          title,
          description,
          altText: title,
          isPremium,
          grades: selectedGrades,
          subjects: [subject],
          types: [type],
          syllabuses: [syllabus],
          mediums: [medium],
          customTags: tags,
        };

        const isAdmin = userRole === "admin";
        const imageRecord = await handleUpload(selectedFile, metadata, isAdmin);
        setUploadProgress(100);
        setUploadSuccess(imageRecord.id);
        
        const successMsg = isAdmin 
          ? "Published successfully! Your visual is now live."
          : "Submitted for review! Check 'My Uploads' for status.";
        alert(successMsg);

      } else {
        // Sandbox: simulate progress
        for (let p = 10; p <= 100; p += 10) {
          await new Promise((r) => setTimeout(r, 120));
          setUploadProgress(p);
        }
        setUploadSuccess("sandbox-id");
      }

      setUploading(false);

      // Reset form to upload another image
      setTitle(""); setDescription(""); setTags([]);
      setSelectedFile(null); setThumbnailFile(null);
      setFilePreview(null); setThumbnailPreview(null);
      setStep(1); setUploadProgress(0);

    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
          <p className="text-xs text-brand-muted font-bold">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  const statusMeta: Record<UploadStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending_review: { label: "Under Review", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
    approved: { label: "Published", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    rejected: { label: "Rejected", color: "text-red-600 bg-red-50 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
    draft: { label: "Draft", color: "text-brand-muted bg-[#f3f3f3] border-brand-border", icon: <FileImage className="w-3.5 h-3.5" /> },
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-border shadow-sm mb-4">
            <Sparkles className="w-3 h-3 text-brand" />
            <span className="text-[10px] font-black uppercase text-brand tracking-wider">Contributor Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand tracking-tight">Upload Visual Resources</h1>
          <p className="text-xs text-brand-muted font-medium mt-1">
            Logged in as <span className="font-black text-brand">{userEmail}</span> ·{" "}
            <span className="capitalize font-bold">{userRole?.replace("_", " ")}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {(["upload", "my-uploads"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === tab
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white border border-brand-border text-[rgba(0,57,60,0.7)] hover:bg-[#f3f3f3]"
              }`}
            >
              {tab === "upload" ? "Upload New Visual" : `My Uploads (${myUploads.length})`}
            </button>
          ))}
        </div>

        {/* ====== UPLOAD FORM ====== */}
        {activeView === "upload" && (
          <div className="bg-white border border-brand-border rounded-3xl shadow-sm overflow-hidden">

            {/* Progress Steps */}
            <div className="flex border-b border-brand-border px-6 pt-5 pb-0">
              {[
                { num: 1, label: "Metadata" },
                { num: 2, label: "Files" },
                { num: 3, label: "Review" },
              ].map(({ num, label }) => (
                <button
                  key={num}
                  onClick={() => num < step && setStep(num as 1 | 2 | 3)}
                  className={`flex items-center gap-2 pb-4 mr-6 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                    step === num
                      ? "border-brand text-brand"
                      : step > num
                      ? "border-emerald-400 text-emerald-600"
                      : "border-transparent text-brand-faint"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    step > num ? "bg-emerald-500 text-white" : step === num ? "bg-brand text-white" : "bg-[#f3f3f3] text-[rgba(0,57,60,0.5)]"
                  }`}>
                    {step > num ? "✓" : num}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">

              {/* === STEP 1: METADATA === */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Visual Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Plant Cell Structure Diagram (O/L)"
                        className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-brand-faint text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the content, curriculum topics, and educational use case..."
                        className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-brand-faint text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all resize-none"
                      />
                    </div>

                    {/* Subject */}
                    <div className="md:col-span-1">
                      <CustomSelect label="Subject *" value={subject} onChange={setSubject} options={SUBJECTS} />
                    </div>

                    {/* Type */}
                    <div className="md:col-span-1">
                      <CustomSelect label="Visual Type *" value={type} onChange={setType} options={TYPES} />
                    </div>

                    {/* Syllabus */}
                    <div className="md:col-span-1">
                      <CustomSelect label="Syllabus" value={syllabus} onChange={setSyllabus} options={SYLLABUSES} />
                    </div>

                    {/* Medium */}
                    <div className="md:col-span-1">
                      <CustomSelect label="Medium" value={medium} onChange={setMedium} options={MEDIUMS} />
                    </div>

                    {/* Grades */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Grade Level(s) *</label>
                      <div className="flex flex-wrap gap-2">
                        {GRADES.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleGrade(g)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                              selectedGrades.includes(g)
                                ? "bg-brand text-white border-brand"
                                : "bg-[#f3f3f3] text-[rgba(0,57,60,0.7)] border-brand-border hover:border-brand/40"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Custom Tags (up to 10)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          placeholder="Add tag and press Enter..."
                          className="flex-1 bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-brand-faint text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all"
                        />
                        <button type="button" onClick={addTag} className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand transition-all cursor-pointer">
                          Add
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f3f3f3] border border-brand-border rounded-full text-[10px] font-bold text-brand">
                              {tag}
                              <button type="button" onClick={() => removeTag(tag)} className="text-[rgba(0,57,60,0.5)] hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Premium Toggle */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setIsPremium(!isPremium)}
                          className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${isPremium ? "bg-brand" : "bg-[rgba(0,57,60,0.15)]"}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPremium ? "translate-x-5" : ""}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-brand flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-brand" />
                            Mark as Premium Content
                          </span>
                          <span className="text-[10px] text-[rgba(0,57,60,0.5)] font-medium">Premium visuals are only accessible to paid subscribers</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => title && description && selectedGrades.length > 0 ? setStep(2) : null}
                    disabled={!title || !description || selectedGrades.length === 0}
                    className="mt-2 w-full bg-brand hover:bg-brand disabled:opacity-40 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow cursor-pointer"
                  >
                    Continue to File Upload →
                  </button>
                </div>
              )}

              {/* === STEP 2: FILE UPLOAD === */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  {/* Main File Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Main Visual File * (SVG, PNG, JPG, PDF — max 20MB)</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        selectedFile ? "border-brand bg-brand/5" : "border-brand-border hover:border-brand/50 hover:bg-brand/5"
                      }`}
                    >
                      {filePreview && selectedFile?.type.startsWith("image/") ? (
                        <img src={filePreview} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain" />
                      ) : selectedFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileImage className="w-10 h-10 text-brand" />
                          <p className="text-xs font-bold text-brand">{selectedFile.name}</p>
                          <p className="text-[10px] text-[rgba(0,57,60,0.5)]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-10 h-10 text-[rgba(0,57,60,0.3)]" />
                          <p className="text-sm font-bold text-[rgba(0,57,60,0.7)]">Click to select or drag and drop</p>
                          <p className="text-[10px] text-brand-faint">SVG · PNG · JPG · JPEG — Maximum 20MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, "main")}
                    />
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Thumbnail Image (optional — PNG, JPG, 800×600 recommended)</label>
                    <div
                      onClick={() => document.getElementById("thumb-input")?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        thumbnailFile ? "border-emerald-400 bg-emerald-50/30" : "border-brand-border hover:border-brand/50"
                      }`}
                    >
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail Preview" className="max-h-28 mx-auto rounded-lg object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FileImage className="w-8 h-8 text-[rgba(0,57,60,0.3)]" />
                          <p className="text-xs font-semibold text-[rgba(0,57,60,0.5)]">Upload thumbnail preview</p>
                        </div>
                      )}
                    </div>
                    <input id="thumb-input" type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={(e) => handleFileSelect(e, "thumb")} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-brand-border text-brand font-bold text-xs rounded-xl hover:bg-[#f3f3f3] transition-all cursor-pointer">
                      ← Back
                    </button>
                    <button
                      onClick={() => selectedFile ? setStep(3) : null}
                      disabled={!selectedFile}
                      className="flex-1 bg-brand hover:bg-brand disabled:opacity-40 text-white font-black text-xs py-3 rounded-xl transition-all shadow cursor-pointer"
                    >
                      Review Submission →
                    </button>
                  </div>
                </div>
              )}

              {/* === STEP 3: REVIEW & SUBMIT === */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <div className="bg-[#f3f3f3] rounded-2xl p-5 flex flex-col gap-3 text-xs font-semibold text-brand">
                    <h3 className="font-black text-sm text-brand border-b border-brand-border pb-3 mb-1">Submission Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Title</span><p className="font-black mt-0.5">{title}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Subject</span><p className="font-black mt-0.5">{subject}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Type</span><p className="font-black mt-0.5">{type}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Grades</span><p className="font-black mt-0.5">{selectedGrades.join(", ")}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Syllabus</span><p className="font-black mt-0.5">{syllabus}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Medium</span><p className="font-black mt-0.5">{medium}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Access Tier</span><p className={`font-black mt-0.5 ${isPremium ? "text-amber-600" : "text-emerald-600"}`}>{isPremium ? "Premium" : "Free"}</p></div>
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">File</span><p className="font-black mt-0.5 truncate">{selectedFile?.name}</p></div>
                    </div>
                    {tags.length > 0 && (
                      <div><span className="text-[rgba(0,57,60,0.5)] text-[10px] uppercase font-bold">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1">{tags.map((t) => <span key={t} className="px-2 py-0.5 bg-white rounded-full border border-brand-border text-[10px] font-bold">{t}</span>)}</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-700">Your visual will be submitted for moderator review. It will be published once approved. You will be notified of the outcome.</p>
                  </div>

                  {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-700 font-bold">
                      <AlertCircle className="w-4 h-4" />{uploadError}
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-2 text-xs font-bold text-emerald-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Visual uploaded successfully!
                      </div>
                      <a href={`/image/${uploadSuccess}`} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                        View on site →
                      </a>
                    </div>
                  )}

                  {uploading && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold text-brand-muted">
                        <span>Securely uploading visual...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-[#f3f3f3] rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} disabled={uploading} className="flex-1 py-3 border border-brand-border text-brand font-bold text-xs rounded-xl hover:bg-[#f3f3f3] transition-all disabled:opacity-40 cursor-pointer">
                      ← Edit Files
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={uploading || uploadSuccess !== null}
                      className="flex-1 bg-brand hover:bg-brand disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {uploading ? (
                        <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />Uploading...</>
                      ) : (
                        <><Upload className="w-3.5 h-3.5" />Submit for Review</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== MY UPLOADS LIST ====== */}
        {activeView === "my-uploads" && (
          <div className="flex flex-col gap-4">
            {loadingUploads ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand border-t-transparent" />
              </div>
            ) : myUploads.length === 0 ? (
              <div className="text-center py-16 bg-white border border-brand-border rounded-3xl">
                <FileImage className="w-12 h-12 text-[rgba(0,57,60,0.2)] mx-auto mb-4" />
                <p className="text-sm font-black text-[rgba(0,57,60,0.5)]">No uploads yet</p>
                <button onClick={() => setActiveView("upload")} className="mt-4 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand transition-all cursor-pointer">
                  Upload Your First Visual
                </button>
              </div>
            ) : (
              myUploads.map((upload) => {
                const meta = statusMeta[upload.status] || statusMeta.draft;
                return (
                  <div key={upload.id} className="bg-white border border-brand-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#f3f3f3] border border-brand-border flex-shrink-0 overflow-hidden">
                      {upload.thumbnail_url ? (
                        <img src={upload.thumbnail_url} alt={upload.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><FileImage className="w-6 h-6 text-[rgba(0,57,60,0.3)]" /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-brand truncate">{upload.title}</p>
                      <p className="text-[10px] text-[rgba(0,57,60,0.5)] font-medium mt-0.5">
                        Uploaded {new Date(upload.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>

                      {upload.status === "rejected" && upload.rejection_reason && (
                        <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-[10px] text-red-700 font-medium">
                          <span className="font-black">Rejection Reason: </span>{upload.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-brand-muted">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{upload.view_count}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{upload.download_count}</span>
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.color}`}>
                        {meta.icon}{meta.label}
                      </span>
                      <div className="flex gap-1 ml-2">
                        {upload.status === "approved" && (
                          <a href={`/image/${upload.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-brand hover:bg-[#f3f3f3] rounded-full transition-colors inline-flex items-center justify-center" title="View on site">
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => openEditModal(upload)} className="p-2 text-brand hover:bg-[#f3f3f3] rounded-full transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUpload(upload.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {/* Edit Modal */}
      <EditVisualModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
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
    </div>
  );
}

function CustomSelect({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: (string | {group: string; options: string[]})[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const displayValue = isOpen ? search : value;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearch("");
  };

  const filteredOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return opt.toLowerCase().includes(search.toLowerCase()) ? opt : null;
    } else {
      const filteredSub = opt.options.filter(sub => sub.toLowerCase().includes(search.toLowerCase()));
      if (filteredSub.length > 0) return { ...opt, options: filteredSub };
      if (opt.group.toLowerCase().includes(search.toLowerCase())) return opt;
      return null;
    }
  }).filter(Boolean) as (string | {group: string; options: string[]})[];

  return (
    <div className="relative flex flex-col gap-1.5" ref={ref}>
      <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">{label}</label>
      <div className="relative w-full">
        <input 
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          placeholder="Select or type..."
          className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all font-semibold pr-10"
        />
        <ChevronDown 
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${isOpen ? "rotate-180 text-brand" : "text-brand/50"}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 flex flex-col max-h-64 animate-in fade-in slide-in-from-top-2 duration-200 overflow-y-auto pr-1">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-brand-muted font-medium">No results found</div>
          ) : filteredOptions.map((opt, idx) => {
            if (typeof opt === 'string') {
              return (
                <div 
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors ${value === opt ? "bg-[#073238] text-white font-bold" : "hover:bg-gray-50 text-gray-700"}`}
                >
                  {opt}
                </div>
              );
            } else {
              return (
                <div key={opt.group} className={idx > 0 ? "mt-2 border-t border-gray-100 pt-2" : "mb-1"}>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 px-2.5">{opt.group}</div>
                  <div className="flex flex-col gap-0.5">
                    {opt.options.map((subOpt) => (
                      <div 
                        key={subOpt}
                        onClick={() => handleOptionClick(subOpt)}
                        className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors ${value === subOpt ? "bg-[#073238] text-white font-bold" : "hover:bg-gray-50 text-gray-700"}`}
                      >
                        {subOpt}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
