"use client";

import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { downloadWithWatermark } from "@/lib/watermark";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthModal } from "@/store/useAuthModal";
import { useCollectionModal } from "@/store/useCollectionModal";
import SearchBar from "@/components/SearchBar";
import DiscoveryHub from "@/components/DiscoveryHub";
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
  Layers,
} from "lucide-react";
import VisualCard, { Visual } from "@/components/VisualCard";

/* ─────────────────────────────── Types ─────────────────────────────── */


/* ─────────────────────────── Static Filter Options ─────────────────────────── */

const SUBJECTS: (string | { group: string; options: string[] })[] = [
  { group: "Sciences", options: ["Physics", "Chemistry", "Biology", "Environmental Science"] },
  "Mathematics & Statistics",
  { group: "Engineering", options: ["Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Computer/Software Engineering", "Chemical Engineering", "Electronics"] },
  { group: "Computer Science / IT", options: ["Programming", "AI/ML", "Cybersecurity", "Data Science"] },
  "Medicine & Health Sciences",
  "Business, Economics & Finance",
  "Law",
  { group: "Arts & Humanities", options: ["History", "Literature", "Philosophy", "Languages"] },
  { group: "Social Sciences", options: ["Psychology", "Sociology", "Political Science"] },
  "Architecture & Design",
  "Agriculture"
];
const GRADES = ["Pre-primary / Kindergarten", "Primary / Elementary", "Middle School", "High School", "O/L (Ordinary Level)", "A/L (Advanced Level)", "Undergraduate", "Postgraduate", "Doctoral / PhD", "Professional / Certifications"];
const TYPES = ["Mind Map", "Diagram", "Graph", "Flowchart", "Timeline", "Illustration", "Comparison Table", "Cheat Sheet"];
const SYLLABUSES: (string | { group: string; options: string[] })[] = [
  { group: "International", options: ["IB Diploma", "Cambridge IGCSE", "Cambridge A-Level", "Edexcel/Pearson"] },
  { group: "US", options: ["Common Core", "AP (Advanced Placement)", "State Standards"] },
  { group: "UK", options: ["National Curriculum", "AQA", "OCR"] },
  { group: "India", options: ["CBSE", "ICSE", "State Boards"] },
  { group: "Sri Lanka", options: ["National Syllabus", "Local University"] },
  "National Curriculum (Other)",
  { group: "Exam-Prep", options: ["SAT", "GRE", "GMAT", "JEE", "NEET", "IELTS"] }
];
const MEDIUMS = ["English", "Sinhala", "Tamil", "Mandarin Chinese", "Spanish", "Hindi", "Arabic", "French", "Portuguese", "Russian", "Bengali", "German", "Japanese", "Indonesian/Malay", "Urdu", "Other"];

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
  const openCollectionModal = useCollectionModal((s) => s.open);

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



  /* ── Fetch user session data ── */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const userId = data.user.id;
        
        // Fetch role
        supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
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
  const handleDownload = async (visual: Visual) => {
    if (visual.is_premium) {
      openAuthModal("signin", visual.file_url);
      return;
    }
    
    try {
      await downloadWithWatermark(visual.file_url!, visual.title || "learnpik-download");
    } catch (e) {
      console.error("Watermark generation failed, falling back to direct download", e);
      const downloadUrl = visual.file_url!.includes('?') 
        ? `${visual.file_url}&download=` 
        : `${visual.file_url}?download=`;
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = visual.title || "learnpik-download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /* ── Save/heart toggle ── */
  const toggleSave = (id: string, title?: string) => {
    openCollectionModal(id, title);
  };

  /* ════════════════════════════ RENDER ════════════════════════════════ */
  const isEmbedded = pathname === "/";

  return (
    <div style={{ background: "#f8f9fa", minHeight: isEmbedded ? "auto" : "100vh" }}>
      <div className={cn("mx-auto w-full max-w-[1440px] px-3 md:px-6 pb-8", isEmbedded ? "pt-4 md:pt-6" : "pt-20 md:pt-24")}>
        
        {/* ── Search Bar and Filters ── */}
        <div className="bg-white p-3 md:p-5 rounded-2xl border border-[rgba(0,57,60,0.08)] mb-4 md:mb-5 flex flex-col gap-3 md:gap-4 shadow-sm">
          
          {/* Top row: Search Bar */}
          <SearchBar 
            initialValue={q} 
            onSubmit={handleSearchSubmit} 
            className="w-full"
          />

          {/* Bottom row: Tabs, Filters, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            
            <div className="flex items-center flex-wrap gap-3 w-full md:w-auto">
              {/* Desktop Filters - Using flex-wrap instead of overflow-x to fix dropdown clipping */}
              <div className="hidden md:flex flex-wrap items-center gap-2">
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
                    className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Clear all filters"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden flex-1">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "MobileFilters" ? null : "MobileFilters")}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-sm transition-colors",
                    activeDropdown === "MobileFilters" || activeFilterCount > 0 
                      ? "border-[#073238] bg-[#073238]/5 text-[#073238]" 
                      : "border-gray-200 bg-white text-gray-700"
                  )}
                >
                  <Filter size={16} />
                  <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value === "latest" ? null : e.target.value })}
                  className="w-full appearance-none bg-white border border-[rgba(0,57,60,0.15)] rounded-full py-1.5 pl-3 pr-8 text-sm text-[#00393c] cursor-pointer font-bold outline-none hover:bg-gray-50 transition-colors"
                >
                  <option value="latest">Latest</option>
                  <option value="relevant">Relevant</option>
                  <option value="downloaded">Most Downloaded</option>
                </select>
                <ChevronDown
                  size={14}
                  style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#073238" }}
                />
              </div>
            </div>
          </div>

          {/* Mobile Filters Expanded View */}
          {activeDropdown === "MobileFilters" && (
            <div className="md:hidden mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#073238] text-sm">Filters</span>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <MobileFilterGroup title="Grade" options={GRADES} active={activeGrades} onToggle={(v) => toggleFilter("grade", v, activeGrades)} />
              <MobileFilterGroup title="Subject" options={SUBJECTS} active={activeSubjects} onToggle={(v) => toggleFilter("subject", v, activeSubjects)} />
              <MobileFilterGroup title="Type" options={TYPES} active={activeTypes} onToggle={(v) => toggleFilter("type", v, activeTypes)} />
              <MobileFilterGroup title="Syllabus" options={SYLLABUSES} active={activeSyllabi} onToggle={(v) => toggleFilter("syllabus", v, activeSyllabi)} />
              <MobileFilterGroup title="Medium" options={MEDIUMS} active={activeMediums} onToggle={(v) => toggleFilter("medium", v, activeMediums)} />
            </div>
          )}
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
              href="/uploader/upload"
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

        {/* ── Discovery Hub (Only when no search/filters) ── */}
        {!isLoading && activeFilterCount === 0 && !q && !isEmbedded && (
          <div className="mb-12">
            <DiscoveryHub />
            <h2 className="text-xl md:text-2xl font-black text-[#00393c] tracking-tight mt-12 mb-6 px-2">All Visuals</h2>
          </div>
        )}

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

        {/* ── Search Results & All Visuals Grid ── */}
        <>
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
                        onSave={() => toggleSave(visual.id, visual.title)}
                        onDownload={() => handleDownload(visual)}
                      />
                    </div>
                  ))}
                </div>

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
          </>
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
  options: (string | { group: string; options: string[] })[];
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
          {options.map((opt, idx) => {
            if (typeof opt === 'string') {
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
            } else {
              return (
                <div key={opt.group} className={cn("mb-1", idx > 0 && "mt-3 border-t border-gray-100 pt-2")}>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-2">{opt.group}</div>
                  {opt.options.map(subOpt => {
                    const isActive = active.includes(subOpt);
                    return (
                      <label
                        key={subOpt}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => onToggleOption(subOpt)}
                          style={{ accentColor: "#073238", width: 16, height: 16 }}
                        />
                        <span className={cn("text-sm", isActive ? "font-semibold text-[#073238]" : "text-gray-700")}>
                          {subOpt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

/* ── MobileFilterGroup ── */
function MobileFilterGroup({ title, options, active, onToggle }: { title: string, options: (string | {group: string, options: string[]})[], active: string[], onToggle: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          if (typeof opt === 'string') {
            const isActive = active.includes(opt);
            return (
              <button key={opt} onClick={() => onToggle(opt)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", isActive ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>
                {opt}
              </button>
            );
          } else {
            return (
              <div key={opt.group} className="w-full mt-2 mb-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{opt.group}</div>
                <div className="flex flex-wrap gap-2">
                  {opt.options.map((subOpt) => {
                    const isActive = active.includes(subOpt);
                    return (
                      <button key={subOpt} onClick={() => onToggle(subOpt)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors border", isActive ? "bg-[#073238] text-white border-[#073238]" : "bg-gray-50 text-gray-700 border-transparent")}>
                        {subOpt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
        })}
      </div>
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
            href="/uploader/upload"
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
