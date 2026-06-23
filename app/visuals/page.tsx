"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthModal } from "@/store/useAuthModal";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Heart,
  Maximize2,
  Crown,
  ArrowRight,
  FileImage,
  Sparkles,
  Upload,
} from "lucide-react";

/* ─────────────────────────────── Types ─────────────────────────────── */

interface Visual {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string;
  is_premium: boolean;
  download_count: number;
  view_count: number;
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
  const contentType = searchParams.get("content") || "all"; // all | free | premium
  const sortBy = searchParams.get("sort") || "latest"; // latest | downloaded
  const activeGrades = searchParams.getAll("grade");
  const activeSubjects = searchParams.getAll("subject");
  const activeTypes = searchParams.getAll("type");
  const activeSyllabi = searchParams.getAll("syllabus");
  const activeMediums = searchParams.getAll("medium");

  /* ── Local UI state ── */
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(q);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    grade: true, subject: true, type: false, syllabus: false, medium: false,
  });
  // Fake user role – in a real app pull from Supabase session
  const [userRole, setUserRole] = useState<string | null>(null);

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

  /* ── Collapse section toggle ── */
  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
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
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput || null });
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
      {/* ── Body: Sidebar + Results ── */}
      <div className="mx-auto w-full max-w-[1280px] pt-20 md:pt-24 px-3 md:px-6 pb-8 flex flex-col md:flex-row items-start gap-4 md:gap-8">

        {/* ════════════ LEFT SIDEBAR (Desktop) ════════════ */}
        <aside
          className="visuals-sidebar"
          style={{
            width: 240, flexShrink: 0, background: "#ffffff",
            borderRadius: "1rem", border: "1px solid rgba(0,57,60,0.08)",
            padding: "1.25rem", position: "sticky", top: "5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <span style={{ fontWeight: 700, color: "#00393c", fontSize: "0.9rem" }}>Filters</span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  background: "rgba(7,50,56,0.07)", border: "none", borderRadius: "0.5rem",
                  padding: "0.25rem 0.6rem", fontSize: "0.75rem", color: "#073238",
                  cursor: "pointer", fontWeight: 600,
                }}
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Filter Section: Grade */}
          <FilterSection
            title="Grade"
            options={GRADES}
            active={activeGrades}
            expanded={expandedSections.grade}
            onToggle={() => toggleSection("grade")}
            onSelect={(v) => toggleFilter("grade", v, activeGrades)}
          />

          {/* Filter Section: Subject */}
          <FilterSection
            title="Subject"
            options={SUBJECTS}
            active={activeSubjects}
            expanded={expandedSections.subject}
            onToggle={() => toggleSection("subject")}
            onSelect={(v) => toggleFilter("subject", v, activeSubjects)}
          />

          {/* Filter Section: Type */}
          <FilterSection
            title="Type"
            options={TYPES}
            active={activeTypes}
            expanded={expandedSections.type}
            onToggle={() => toggleSection("type")}
            onSelect={(v) => toggleFilter("type", v, activeTypes)}
          />

          {/* Filter Section: Syllabus */}
          <FilterSection
            title="Syllabus"
            options={SYLLABUSES}
            active={activeSyllabi}
            expanded={expandedSections.syllabus}
            onToggle={() => toggleSection("syllabus")}
            onSelect={(v) => toggleFilter("syllabus", v, activeSyllabi)}
          />

          {/* Filter Section: Medium */}
          <FilterSection
            title="Medium"
            options={MEDIUMS}
            active={activeMediums}
            expanded={expandedSections.medium}
            onToggle={() => toggleSection("medium")}
            onSelect={(v) => toggleFilter("medium", v, activeMediums)}
          />
        </aside>

        {/* ════════════ MAIN RESULTS AREA ════════════ */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* ── Search Bar and Tabs ── */}
          <div className="bg-white p-3 md:p-5 rounded-2xl border border-[rgba(0,57,60,0.08)] mb-4 md:mb-5 flex flex-col gap-3 md:gap-4">
            <form onSubmit={handleSearch} style={{ position: "relative", width: "100%" }}>
              <Search
                size={18}
                style={{
                  position: "absolute", left: "1rem", top: "50%",
                  transform: "translateY(-50%)", color: "rgba(0,57,60,0.4)", zIndex: 1,
                }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search visuals by title…"
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem",
                  borderRadius: "0.75rem", border: "1px solid rgba(0,57,60,0.15)", outline: "none",
                  fontSize: "0.95rem", background: "#f8f9fa", color: "#00393c",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute", right: "0.375rem", top: "50%",
                  transform: "translateY(-50%)", background: "#073238", color: "#fff",
                  border: "none", borderRadius: "0.5rem", padding: "0.45rem 1rem",
                  fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                Search
              </button>
            </form>

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

          {/* ── Top Bar: Results count + Sort + View toggle + Mobile filter ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            {/* Mobile filter button */}
            <button
              className="mobile-filter-btn"
              onClick={() => setMobileFiltersOpen(true)}
              style={{
                display: "none", alignItems: "center", gap: "0.5rem",
                background: "#ffffff", border: "1px solid rgba(0,57,60,0.15)",
                borderRadius: "0.6rem", padding: "0.5rem 0.9rem",
                fontSize: "0.85rem", color: "#00393c", cursor: "pointer", fontWeight: 600,
              }}
            >
              <Filter size={15} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <span style={{ color: "#00393c", fontSize: "0.9rem", fontWeight: 500, marginRight: "auto" }}>
              {isLoading ? "Loading…" : `${visuals.length} visual${visuals.length !== 1 ? "s" : ""} found`}
            </span>

            {/* Sort dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value === "latest" ? null : e.target.value })}
                style={{
                  appearance: "none", background: "#ffffff",
                  border: "1px solid rgba(0,57,60,0.15)", borderRadius: "0.6rem",
                  padding: "0.45rem 2rem 0.45rem 0.85rem", fontSize: "0.85rem",
                  color: "#00393c", cursor: "pointer", fontWeight: 500, outline: "none",
                }}
              >
                <option value="latest">Latest</option>
                <option value="downloaded">Most Downloaded</option>
              </select>
              <ChevronDown
                size={14}
                style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#073238" }}
              />
            </div>

            {/* Grid / List toggle */}
            <div style={{ display: "flex", background: "#ffffff", border: "1px solid rgba(0,57,60,0.15)", borderRadius: "0.6rem", overflow: "hidden" }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "0.45rem 0.65rem", border: "none", cursor: "pointer",
                  background: viewMode === "grid" ? "#073238" : "transparent",
                  color: viewMode === "grid" ? "#ffffff" : "#00393c",
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "0.45rem 0.65rem", border: "none", cursor: "pointer",
                  background: viewMode === "list" ? "#073238" : "transparent",
                  color: viewMode === "list" ? "#ffffff" : "#00393c",
                }}
              >
                <List size={16} />
              </button>
            </div>
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
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
                  : "flex flex-col gap-3 md:gap-4"
              }
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} listMode={viewMode === "list"} />
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

          {/* ── Visuals Grid / List ── */}
          {!isLoading && visuals.length > 0 && (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
                    : "flex flex-col gap-3 md:gap-4"
                }
              >
                {visuals.map((visual) => (
                  <VisualCard
                    key={visual.id}
                    visual={visual}
                    listMode={viewMode === "list"}
                    isSaved={savedIds.has(visual.id)}
                    onSave={() => toggleSave(visual.id)}
                    onDownload={() => handleDownload(visual)}
                  />
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
        </main>
      </div>

      {/* ════════════ MOBILE FILTER DRAWER ════════════ */}
      {mobileFiltersOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.5)", display: "flex",
          }}
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            style={{
              width: 300, background: "#ffffff", height: "100%",
              overflowY: "auto", padding: "1.5rem",
              boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <span style={{ fontWeight: 700, color: "#00393c", fontSize: "1rem" }}>Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#073238" }}
              >
                <X size={20} />
              </button>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
                style={{
                  width: "100%", background: "rgba(7,50,56,0.07)", border: "none",
                  borderRadius: "0.5rem", padding: "0.5rem", fontSize: "0.85rem",
                  color: "#073238", cursor: "pointer", fontWeight: 600, marginBottom: "1rem",
                }}
              >
                Clear All Filters ({activeFilterCount})
              </button>
            )}

            <FilterSection title="Grade" options={GRADES} active={activeGrades} expanded={expandedSections.grade} onToggle={() => toggleSection("grade")} onSelect={(v) => toggleFilter("grade", v, activeGrades)} />
            <FilterSection title="Subject" options={SUBJECTS} active={activeSubjects} expanded={expandedSections.subject} onToggle={() => toggleSection("subject")} onSelect={(v) => toggleFilter("subject", v, activeSubjects)} />
            <FilterSection title="Type" options={TYPES} active={activeTypes} expanded={expandedSections.type} onToggle={() => toggleSection("type")} onSelect={(v) => toggleFilter("type", v, activeTypes)} />
            <FilterSection title="Syllabus" options={SYLLABUSES} active={activeSyllabi} expanded={expandedSections.syllabus} onToggle={() => toggleSection("syllabus")} onSelect={(v) => toggleFilter("syllabus", v, activeSyllabi)} />
            <FilterSection title="Medium" options={MEDIUMS} active={activeMediums} expanded={expandedSections.medium} onToggle={() => toggleSection("medium")} onSelect={(v) => toggleFilter("medium", v, activeMediums)} />

            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                width: "100%", background: "#073238", color: "#ffffff",
                border: "none", borderRadius: "0.75rem", padding: "0.75rem",
                fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", marginTop: "1rem",
              }}
            >
              View Results
            </button>
          </div>
        </div>
      )}

      {/* ── Responsive styles injected ── */}
      <style>{`
        @media (max-width: 768px) {
          .visuals-sidebar { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════ */

/* ── FilterSection ── */
function FilterSection({
  title, options, active, expanded, onToggle, onSelect,
}: {
  title: string;
  options: string[];
  active: string[];
  expanded: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: "0.25rem", borderBottom: "1px solid rgba(0,57,60,0.08)", paddingBottom: "0.75rem", marginTop: "0.75rem" }}>
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "0", marginBottom: expanded ? "0.65rem" : "0",
        }}
      >
        <span style={{ fontWeight: 600, color: "#00393c", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
          {active.length > 0 && (
            <span style={{ marginLeft: "0.4rem", background: "#073238", color: "#fff", borderRadius: "2rem", padding: "0.05rem 0.45rem", fontSize: "0.7rem" }}>
              {active.length}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={14} style={{ color: "#073238" }} /> : <ChevronDown size={14} style={{ color: "#073238" }} />}
      </button>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {options.map((opt) => {
            const isActive = active.includes(opt);
            return (
              <label
                key={opt}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  cursor: "pointer", padding: "0.25rem 0.3rem",
                  borderRadius: "0.4rem",
                  background: isActive ? "rgba(7,50,56,0.06)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onSelect(opt)}
                  style={{ accentColor: "#073238", width: 14, height: 14 }}
                />
                <span style={{ fontSize: "0.85rem", color: isActive ? "#073238" : "#374151", fontWeight: isActive ? 600 : 400 }}>
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
  visual, listMode, isSaved, onSave, onDownload,
}: {
  visual: Visual;
  listMode: boolean;
  isSaved: boolean;
  onSave: () => void;
  onDownload: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(visual.thumbnail_url || visual.file_url);

  return (
    <Link
      href={`/image/${visual.id}`}
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,57,60,0.08)",
        borderRadius: "1rem",
        overflow: "hidden",
        display: listMode ? "flex" : "block",
        alignItems: listMode ? "stretch" : undefined,
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit"
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(7,50,56,0.12)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
        (e.currentTarget as HTMLAnchorElement).style.transform = "none";
      }}
    >
      {/* ── Thumbnail ── */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: listMode ? 160 : "100%",
          aspectRatio: listMode ? "4/3" : "4/3",
          background: "linear-gradient(135deg, #e8f5f6, #d0ecee)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={visual.title}
            onError={() => {
              if (imgSrc === visual.thumbnail_url && visual.file_url && visual.file_url !== visual.thumbnail_url) {
                setImgSrc(visual.file_url);
              } else {
                setImgSrc("");
              }
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FileImage size={40} style={{ color: "rgba(7,50,56,0.25)" }} />
        )}

        {/* Premium badge */}
        {visual.is_premium && (
          <div
            style={{
              position: "absolute", top: "0.5rem", left: "0.5rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff", borderRadius: "0.4rem",
              padding: "0.2rem 0.5rem", fontSize: "0.7rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "0.25rem",
            }}
          >
            <Crown size={10} /> Premium
          </div>
        )}

        {/* Maximize overlay on hover */}
        <div
          className="card-overlay"
          style={{
            position: "absolute", inset: 0, background: "rgba(7,50,56,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s",
          }}
        >
          <Maximize2 size={24} style={{ color: "#ffffff" }} />
        </div>

        <style>{`
          div:hover > .card-overlay { opacity: 1 !important; }
        `}</style>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: "0.85rem", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.4rem" }}>
          <h3
            style={{
              fontSize: "0.875rem", fontWeight: 700, color: "#00393c",
              margin: 0, flex: 1, lineHeight: 1.35,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}
          >
            {visual.title}
          </h3>
        </div>

        {/* Tags row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.65rem" }}>
          {visual.subject && (
            <span style={{ background: "rgba(7,50,56,0.07)", color: "#073238", borderRadius: "0.3rem", padding: "0.15rem 0.45rem", fontSize: "0.72rem", fontWeight: 600 }}>
              {visual.subject}
            </span>
          )}
          {visual.grade && (
            <span style={{ background: "rgba(77,217,224,0.15)", color: "#0a5a64", borderRadius: "0.3rem", padding: "0.15rem 0.45rem", fontSize: "0.72rem", fontWeight: 600 }}>
              {visual.grade}
            </span>
          )}
          {visual.type && (
            <span style={{ background: "rgba(99,102,241,0.08)", color: "#4338ca", borderRadius: "0.3rem", padding: "0.15rem 0.45rem", fontSize: "0.72rem", fontWeight: 500 }}>
              {visual.type}
            </span>
          )}
        </div>

        {/* Bottom actions row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.78rem", color: "#6b7280" }}>
            <Download size={12} />
            {Number(visual?.download_count || 0).toLocaleString()}
          </span>

          <div style={{ display: "flex", gap: "0.4rem" }}>
            {/* Save / Heart */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
              style={{
                background: isSaved ? "rgba(239,68,68,0.1)" : "rgba(0,57,60,0.05)",
                border: "none", borderRadius: "0.5rem",
                padding: "0.35rem", cursor: "pointer",
                color: isSaved ? "#ef4444" : "#6b7280",
                display: "flex", alignItems: "center",
              }}
            >
              <Heart size={14} fill={isSaved ? "#ef4444" : "none"} />
            </button>

            {/* Download */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownload(); }}
              style={{
                background: "#073238", color: "#ffffff",
                border: "none", borderRadius: "0.5rem",
                padding: "0.35rem 0.65rem", cursor: "pointer",
                fontSize: "0.75rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "0.3rem",
              }}
            >
              <Download size={12} />
              {visual.is_premium ? "Unlock" : "Get"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── SkeletonCard ── */
function SkeletonCard({ listMode }: { listMode: boolean }) {
  return (
    <div
      style={{
        background: "#ffffff", border: "1px solid rgba(0,57,60,0.08)",
        borderRadius: "1rem", overflow: "hidden",
        display: listMode ? "flex" : "block",
      }}
    >
      <div
        style={{
          width: listMode ? 160 : "100%", aspectRatio: "4/3",
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
