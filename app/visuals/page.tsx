"use client";

import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthModal } from "@/store/useAuthModal";
import SearchBar from "@/components/SearchBar";
import {
  Filter,
  ChevronDown,
  X,
  Download,
  Heart,
  Crown,
  ArrowRight,
  FileImage,
  Upload,
} from "lucide-react";

/* ─────────────────────────────── Types ─────────────────────────────── */

interface Visual {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  file_url: string;
  is_premium?: boolean;
  isPremium?: boolean;
  download_count?: number;
  downloadCount?: number;
  view_count?: number;
  subject: string;
  grade: string;
  type: string;
  syllabus: string;
  medium: string;
}

/* ─────────────────────────── Static Filter Options ─────────────────────────── */

const GRADES = ["OL", "AL", "Grade 6-9", "University", "General"];
const SUBJECTS = [
  "Biology", "Chemistry", "Physics", "Mathematics", "ICT",
  "History", "Geography", "Commerce", "Sinhala", "Tamil", "English", "Art",
];
const TYPES = [
  "Mind Map", "Diagram", "Graph", "Flowchart", "Timeline",
  "Illustration", "Comparison Table", "Cheat Sheet",
];
const SYLLABUSES = [
  "National Syllabus", "Cambridge", "Edexcel", "Local University",
];
const MEDIUMS = ["English Medium", "Sinhala Medium", "Tamil Medium"];

/* ─────────────────────────── Helpers ─────────────────────────────────── */

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CONTENT COMPONENT
═══════════════════════════════════════════════════════════════════════ */

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openAuthModal = useAuthModal((s) => s.open);

  /* ── URL-derived state ── */
  const q = searchParams.get("q") || "";
  const contentType = searchParams.get("content") || "all"; 
  const sortBy = searchParams.get("sort") || "latest"; 
  const activeGrades = searchParams.getAll("grade");
  const activeSubjects = searchParams.getAll("subject");
  const activeTypes = searchParams.getAll("type");
  const activeSyllabi = searchParams.getAll("syllabus");
  const activeMediums = searchParams.getAll("medium");

  /* ── Local UI state ── */
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  /* ── Fetch user role from session ── */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role) setUserRole(profile.role);
          });
      }
    });
  }, []);

  /* ── URL param updater ── */
  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value !== null && value !== "") {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  /* ── Toggle multi-select filter ── */
  const toggleFilter = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length ? next : null });
  };

  /* ── Active filter count ── */
  const activeFilterCount =
    activeGrades.length +
    activeSubjects.length +
    activeTypes.length +
    activeSyllabi.length +
    activeMediums.length;

  /* ── Clear all filters ── */
  const clearAllFilters = () => {
    updateParams({
      grade: null, subject: null, type: null, syllabus: null, medium: null,
    });
  };

  /* ── API fetch ── */
  const searchParamsStr = searchParams.toString();
  
  useEffect(() => {
    async function fetchVisuals() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        const currentParams = new URLSearchParams(searchParamsStr);
        
        const q = currentParams.get("q");
        if (q) params.set("q", q);
        
        const content = currentParams.get("content");
        if (content === "free") params.set("premium", "false");
        if (content === "premium") params.set("premium", "true");
        
        const sort = currentParams.get("sort") || "latest";
        params.set("sort", sort);
        
        currentParams.getAll("grade").forEach(g => params.append("grade", g));
        currentParams.getAll("subject").forEach(s => params.append("subject", s));
        currentParams.getAll("type").forEach(t => params.append("type", t));
        currentParams.getAll("syllabus").forEach(s => params.append("syllabus", s));
        currentParams.getAll("medium").forEach(m => params.append("medium", m));
        
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setVisuals(data.images || []);
        } else {
          setVisuals([]);
        }
      } catch (e) {
        console.error("Failed to fetch visuals", e);
        setVisuals([]);
      }
      setIsLoading(false);
    }

    fetchVisuals();
  }, [searchParamsStr]);

  /* ── Search submit ── */
  const handleSearchSubmit = (term: string) => {
    updateParams({ q: term || null });
  };

  /* ── Download handler ── */
  const handleDownload = (visual: Visual) => {
    if (visual.is_premium) {
      openAuthModal(visual.file_url);
      return;
    }
    const downloadUrl = visual.file_url.includes('?') 
      ? `${visual.file_url}&download=` 
      : `${visual.file_url}?download=`;
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = visual.title || "eduvisuals-download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Save/heart toggle ── */
  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <div className="mx-auto w-full max-w-[1440px] pt-20 md:pt-24 px-3 md:px-6 pb-8">
        
        {/* ── Search Bar and Tabs ── */}
        <div className="bg-white p-3 md:p-5 rounded-2xl border border-[rgba(0,57,60,0.08)] mb-4 md:mb-5 flex flex-col gap-3 md:gap-4">
          <SearchBar 
            initialValue={q} 
            onSubmit={handleSearchSubmit} 
            className="w-full"
          />

          {/* ── Content Type Tabs ── */}
          <div style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "flex-start", flexWrap: "wrap" }}>
            {(["all", "free", "premium"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => updateParams({ content: tab === "all" ? null : tab })}
                style={{
                  padding: "0.35rem 1rem", borderRadius: "2rem",
                  border: contentType === tab ? "none" : "1px solid rgba(0,57,60,0.15)",
                  background: contentType === tab ? "#073238" : "transparent",
                  color: contentType === tab ? "#ffffff" : "#00393c",
                  fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {tab === "premium" && <Crown size={12} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />}
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Filters and Sort Container ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 pt-2 border-t border-gray-100">
            
            {/* Desktop Filter Pills */}
            <div className="hidden md:flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 mr-1 flex-shrink-0">Filters:</span>
              
              <FilterDropdown 
                title="Grade" 
                options={GRADES} 
                active={activeGrades} 
                isOpen={activeDropdown === "Grade"} 
                onToggleDropdown={() => setActiveDropdown(activeDropdown === "Grade" ? null : "Grade")} 
                onClose={() => setActiveDropdown(null)}
                onToggleOption={(v) => toggleFilter("grade", v, activeGrades)} 
              />
              
              <FilterDropdown 
                title="Subject" 
                options={SUBJECTS} 
                active={activeSubjects} 
                isOpen={activeDropdown === "Subject"} 
                onToggleDropdown={() => setActiveDropdown(activeDropdown === "Subject" ? null : "Subject")} 
                onClose={() => setActiveDropdown(null)}
                onToggleOption={(v) => toggleFilter("subject", v, activeSubjects)} 
              />

              <FilterDropdown 
                title="Type" 
                options={TYPES} 
                active={activeTypes} 
                isOpen={activeDropdown === "Type"} 
                onToggleDropdown={() => setActiveDropdown(activeDropdown === "Type" ? null : "Type")} 
                onClose={() => setActiveDropdown(null)}
                onToggleOption={(v) => toggleFilter("type", v, activeTypes)} 
              />

              <FilterDropdown 
                title="Syllabus" 
                options={SYLLABUSES} 
                active={activeSyllabi} 
                isOpen={activeDropdown === "Syllabus"} 
                onToggleDropdown={() => setActiveDropdown(activeDropdown === "Syllabus" ? null : "Syllabus")} 
                onClose={() => setActiveDropdown(null)}
                onToggleOption={(v) => toggleFilter("syllabus", v, activeSyllabi)} 
              />

              <FilterDropdown 
                title="Medium" 
                options={MEDIUMS} 
                active={activeMediums} 
                isOpen={activeDropdown === "Medium"} 
                onToggleDropdown={() => setActiveDropdown(activeDropdown === "Medium" ? null : "Medium")} 
                onClose={() => setActiveDropdown(null)}
                onToggleOption={(v) => toggleFilter("medium", v, activeMediums)} 
              />

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="ml-1 flex items-center gap-1 text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={14} /> Clear ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Mobile Main Filter Button */}
            <div className="md:hidden w-full relative">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "MobileFilters" ? null : "MobileFilters")}
                  className={cn(
                    "flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border font-semibold shadow-sm transition-colors",
                    activeDropdown === "MobileFilters" || activeFilterCount > 0 ? "border-[#073238] bg-[#073238]/5 text-[#073238]" : "border-gray-200 bg-white text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-[#073238] text-white text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform", activeDropdown === "MobileFilters" && "rotate-180")} />
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex-shrink-0 px-3 flex items-center justify-center rounded-xl bg-red-50 text-red-500 font-bold border border-red-100"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {activeDropdown === "MobileFilters" && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
                  
                  {/* Grade */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Grade</div>
                    <div className="flex flex-wrap gap-2">
                      {GRADES.map(opt => (
                        <button key={opt} onClick={() => toggleFilter("grade", opt, activeGrades)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", activeGrades.includes(opt) ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>{opt}</button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</div>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(opt => (
                        <button key={opt} onClick={() => toggleFilter("subject", opt, activeSubjects)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", activeSubjects.includes(opt) ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>{opt}</button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type</div>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map(opt => (
                        <button key={opt} onClick={() => toggleFilter("type", opt, activeTypes)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", activeTypes.includes(opt) ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>{opt}</button>
                      ))}
                    </div>
                  </div>

                  {/* Syllabus */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Syllabus</div>
                    <div className="flex flex-wrap gap-2">
                      {SYLLABUSES.map(opt => (
                        <button key={opt} onClick={() => toggleFilter("syllabus", opt, activeSyllabi)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", activeSyllabi.includes(opt) ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>{opt}</button>
                      ))}
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medium</div>
                    <div className="flex flex-wrap gap-2">
                      {MEDIUMS.map(opt => (
                        <button key={opt} onClick={() => toggleFilter("medium", opt, activeMediums)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", activeMediums.includes(opt) ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>{opt}</button>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative flex-shrink-0 w-full md:w-auto mt-1 md:mt-0">
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value === "latest" ? null : e.target.value })}
                className="w-full md:w-auto appearance-none bg-white border border-[rgba(0,57,60,0.15)] rounded-full py-2 pl-3 pr-8 text-sm text-[#00393c] cursor-pointer font-medium outline-none"
              >
                <option value="latest">Latest</option>
                <option value="downloaded">Most Downloaded</option>
              </select>
              <ChevronDown
                size={14}
                style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#073238" }}
              />
            </div>
          </div>
        </div>

        {/* ── Admin / Teacher Upload Banner ── */}
        {(userRole === "admin" || userRole === "team_creator") && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(90deg, #073238, #0a4a52)",
              borderRadius: "0.75rem", padding: "0.85rem 1.25rem",
              marginBottom: "1.25rem", gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Upload size={16} style={{ color: "#4dd9e0" }} />
              <span style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: 500 }}>
                You can upload educational visuals to this library.
              </span>
            </div>
            <Link
              href="/upload"
              style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                background: "#4dd9e0", color: "#073238", textDecoration: "none",
                padding: "0.4rem 1rem", borderRadius: "0.5rem",
                fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap",
              }}
            >
              Upload Portal <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* ── Top Bar: Results count ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <span style={{ color: "#00393c", fontSize: "0.9rem", fontWeight: 500, marginRight: "auto" }}>
            {isLoading ? "Loading…" : `${visuals.length} visual${visuals.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {/* ── Active Filter Chips ── */}
        {activeFilterCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
            {activeGrades.map((g) => (
              <FilterChip key={`grade-${g}`} label={g} onRemove={() => toggleFilter("grade", g, activeGrades)} />
            ))}
            {activeSubjects.map((s) => (
              <FilterChip key={`subject-${s}`} label={s} onRemove={() => toggleFilter("subject", s, activeSubjects)} />
            ))}
            {activeTypes.map((t) => (
              <FilterChip key={`type-${t}`} label={t} onRemove={() => toggleFilter("type", t, activeTypes)} />
            ))}
            {activeSyllabi.map((s) => (
              <FilterChip key={`syllabus-${s}`} label={s} onRemove={() => toggleFilter("syllabus", s, activeSyllabi)} />
            ))}
            {activeMediums.map((m) => (
              <FilterChip key={`medium-${m}`} label={m} onRemove={() => toggleFilter("medium", m, activeMediums)} />
            ))}
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {isLoading && (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ breakInside: "avoid" }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && visuals.length === 0 && (
          <EmptyState
            hasFilters={activeFilterCount > 0 || !!q}
            onClearFilters={clearAllFilters}
            userRole={userRole}
          />
        )}

        {/* ── Visuals Grid ── */}
        {!isLoading && visuals.length > 0 && (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {visuals.map((visual) => (
                <div key={visual.id} style={{ breakInside: "avoid" }}>
                  <VisualCard
                    visual={visual}
                    isSaved={savedIds.has(visual.id)}
                    onSave={() => toggleSave(visual.id)}
                    onDownload={() => handleDownload(visual)}
                  />
                </div>
              ))}
            </div>

            {/* Load More placeholder — future pagination */}
            {visuals.length >= 50 && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  style={{
                    background: "#073238", color: "#ffffff", border: "none",
                    borderRadius: "0.75rem", padding: "0.75rem 2rem",
                    fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        /* Hide scrollbar for filter pills row */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════ */

/* ── FilterDropdown ── */
function FilterDropdown({
  title,
  options,
  active,
  isOpen,
  onToggleDropdown,
  onClose,
  onToggleOption,
}: {
  title: string;
  options: string[];
  active: string[];
  isOpen: boolean;
  onToggleDropdown: () => void;
  onClose: () => void;
  onToggleOption: (v: string) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={onToggleDropdown}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors whitespace-nowrap",
          active.length > 0 || isOpen
            ? "border-[#073238] bg-[#073238]/5 text-[#073238]"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        {title}
        {active.length > 0 && (
          <span className="bg-[#073238] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {active.length}
          </span>
        )}
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-3 w-56 z-50 flex flex-col gap-2 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isActive = active.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggleOption(opt)}
                  style={{ accentColor: "#073238", width: 16, height: 16 }}
                />
                <span className={cn("text-sm", isActive ? "font-semibold text-[#073238]" : "text-gray-700")}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── FilterChip ── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.3rem",
        background: "rgba(7,50,56,0.08)", border: "1px solid rgba(7,50,56,0.15)",
        borderRadius: "2rem", padding: "0.25rem 0.65rem",
        fontSize: "0.78rem", color: "#073238", cursor: "pointer", fontWeight: 500,
      }}
    >
      {label}
      <X size={12} />
    </button>
  );
}

/* ── VisualCard ── */
function VisualCard({
  visual, isSaved, onSave, onDownload,
}: {
  visual: Visual;
  isSaved: boolean;
  onSave: () => void;
  onDownload: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(visual.thumbnailUrl || visual.thumbnail_url || visual.file_url);
  const isPremiumVisual = visual.isPremium ?? visual.is_premium ?? false;

  return (
    <Link
      href={`/image/${visual.id}`}
      className="group block relative w-full rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #e8f5f6, #d0ecee)",
      }}
    >
      {/* ── Image ── */}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={visual.title}
          onError={() => {
            const fallbackSrc = visual.thumbnailUrl || visual.thumbnail_url;
            if (imgSrc === fallbackSrc && visual.file_url && visual.file_url !== fallbackSrc) {
              setImgSrc(visual.file_url);
            } else {
              setImgSrc("");
            }
          }}
          className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] block object-cover object-top"
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center">
          <FileImage size={40} style={{ color: "rgba(7,50,56,0.25)" }} />
        </div>
      )}

      {/* ── Premium badge (Always visible) ── */}
      {isPremiumVisual && (
        <div className="absolute top-3 left-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1 z-10 shadow-sm">
          <Crown size={12} /> Premium
        </div>
      )}

      {/* ── Overlay (Hover only, hidden on mobile) ── */}
      <div className="card-overlay absolute inset-0 z-0 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-between bg-black/40">

        <div className="relative z-10 flex justify-end p-3 pointer-events-auto">
          {/* Top right actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-sm transition-colors shadow-sm"
            >
              <Heart size={16} fill={isSaved ? "#ef4444" : "none"} stroke={isSaved ? "#ef4444" : "currentColor"} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownload(); }}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-sm transition-colors shadow-sm flex items-center justify-center"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="relative z-10 p-4 pointer-events-auto mt-auto">
          {/* Bottom left content */}
          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 mb-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {visual.title}
          </h3>
          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            {visual.subject && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {visual.subject}
              </span>
            )}
            {visual.grade && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {visual.grade}
              </span>
            )}
            {visual.type && (
              <span className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                {visual.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── SkeletonCard ── */
function SkeletonCard() {
  return (
    <div
      style={{
        background: "#ffffff", border: "1px solid rgba(0,57,60,0.08)",
        borderRadius: "1rem", overflow: "hidden",
        display: "block",
      }}
    >
      <div
        style={{
          width: "100%", aspectRatio: "4/3",
          background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ padding: "0.85rem", flex: 1 }}>
        <div style={{ height: 14, background: "#f0f0f0", borderRadius: 4, marginBottom: 8, width: "75%" }} />
        <div style={{ height: 12, background: "#f0f0f0", borderRadius: 4, marginBottom: 8, width: "50%" }} />
        <div style={{ height: 12, background: "#f0f0f0", borderRadius: 4, width: "35%" }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

/* ── EmptyState ── */
function EmptyState({
  hasFilters, onClearFilters, userRole,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  userRole: string | null;
}) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "5rem 2rem", textAlign: "center",
        background: "#ffffff", borderRadius: "1rem",
        border: "1px dashed rgba(0,57,60,0.2)",
      }}
    >
      <div
        style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #e8f5f6, #d0ecee)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        {hasFilters ? (
          <Filter size={36} style={{ color: "rgba(7,50,56,0.35)" }} />
        ) : (
          <Upload size={36} style={{ color: "rgba(7,50,56,0.35)" }} />
        )}
      </div>

      <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#00393c", margin: "0 0 0.5rem" }}>
        {hasFilters ? "No matching visuals" : "No visuals yet"}
      </h2>
      <p style={{ color: "#6b7280", fontSize: "0.95rem", maxWidth: 380, margin: "0 0 1.75rem" }}>
        {hasFilters
          ? "Try adjusting your filters or search term to find what you're looking for."
          : "Be the first to contribute! Admins and teachers can upload educational visuals."}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            style={{
              background: "#ffffff", border: "1.5px solid rgba(7,50,56,0.2)",
              borderRadius: "0.75rem", padding: "0.6rem 1.4rem",
              fontSize: "0.875rem", fontWeight: 600, color: "#073238", cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        )}

        {(userRole === "admin" || userRole === "team_creator") && (
          <Link
            href="/upload"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "#073238", color: "#ffffff", textDecoration: "none",
              borderRadius: "0.75rem", padding: "0.6rem 1.4rem",
              fontSize: "0.875rem", fontWeight: 700,
            }}
          >
            <Upload size={15} />
            Upload a Visual
          </Link>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT — wrapped in Suspense for useSearchParams
═══════════════════════════════════════════════════════════════════════ */

export default function VisualsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid rgba(7,50,56,0.15)",
              borderTopColor: "#073238",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
