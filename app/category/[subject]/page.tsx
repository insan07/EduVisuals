"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, BookOpen, Atom, Microscope, FlaskConical, HelpCircle, Search, Filter } from "lucide-react";
import ImageCard from "@/components/ImageCard";
import SearchFilters from "@/components/SearchFilters";

interface CategoryPageProps {
  params: Promise<{ subject: string }>;
}

// Mock database for categories content mapping
const mockCategoryVisuals = [
  { id: "1", title: "Plant Cell Structure Diagram", subject: "Biology", grade: "OL" as const, type: "Diagram" as const, isPremium: false, downloads: 1420, emoji: "🌿", colorClass: "from-emerald-50 to-emerald-100/50 text-emerald-600", topic: "Cell Biology", thumbnailUrl: "https://placehold.co/400x300/e8ecec/00393c?text=%F0%9F%8C%BF+Plant+Cell" },
  { id: "8", title: "Human Respiratory System Diagram", subject: "Biology", grade: "OL" as const, type: "Diagram" as const, isPremium: false, downloads: 1680, emoji: "🫁", colorClass: "from-rose-50 to-rose-100/50 text-rose-600", topic: "Human Body Systems", thumbnailUrl: "https://placehold.co/400x300/e8ecec/00393c?text=%F0%9F%AB%81+Lungs" },
  { id: "9", title: "High School Science Mind Maps (Full Syllabus)", subject: "Biology", grade: "OL" as const, type: "Mind Map" as const, isPremium: false, downloads: 3410, emoji: "📝", colorClass: "from-teal-50 to-teal-100/50 text-teal-600", topic: "Genetics & DNA", thumbnailUrl: "https://placehold.co/400x300/e8ecec/00393c?text=%F0%9F%93%9D+Science" },
  { id: "2", title: "Organic Chemistry Reaction Mechanism", subject: "Chemistry", grade: "AL" as const, type: "Mind Map" as const, isPremium: true, downloads: 890, emoji: "🧪", colorClass: "from-purple-50 to-purple-100/50 text-purple-600", topic: "Organic Reactions", thumbnailUrl: "https://placehold.co/400x300/e8ecec/00393c?text=%F0%9F%A7%AA+Organic" },
  { id: "7", title: "AC Generator Vector Diagram", subject: "Physics", grade: "AL" as const, type: "Diagram" as const, isPremium: true, downloads: 520, emoji: "⚡", colorClass: "from-indigo-50 to-indigo-100/50 text-indigo-600", topic: "Electromagnetism", thumbnailUrl: "https://placehold.co/400x300/e8ecec/00393c?text=%E2%9A%A1+AC+Gen" },
  { id: "4", title: "Gravitational Field Equations Map", subject: "Physics", grade: "University" as const, type: "Mind Map" as const, isPremium: true, downloads: 640, emoji: "🪐", colorClass: "from-blue-50 to-blue-100/50 text-blue-600", topic: "Quantum Mechanics", thumbnailUrl: "https://placehold.co/400x300/e8ecec/00393c?text=%F0%9F%AA%A5+Gravity" },
];

export default function CategoryLandingPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const subjectSlug = resolvedParams.subject.toLowerCase();

  // Convert slug to readable subject name
  let subjectName = "Biology";
  let subjectIcon = "🧬";

  if (subjectSlug.includes("chemistry")) {
    subjectName = "Chemistry";
    subjectIcon = "🧪";
  } else if (subjectSlug.includes("physics")) {
    subjectName = "Physics";
    subjectIcon = "⚡";
  } else if (subjectSlug.includes("history")) {
    subjectName = "History";
    subjectIcon = "🏰";
  } else if (subjectSlug.includes("geography")) {
    subjectName = "Geography";
    subjectIcon = "🗺️";
  }

  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("All");

  const filteredItems = mockCategoryVisuals.filter(
    (item) =>
      item.subject.toLowerCase() === subjectName.toLowerCase() &&
      (activeGradeFilter === "All" || item.grade === activeGradeFilter)
  );

  // Schema.org structured data metadata
  const schemaStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${subjectName} Diagrams & Mind Maps for Students & Educators | Learnpik`,
    "description": `Download free AI-generated ${subjectName.toLowerCase()} diagrams, mind maps, and study visuals for students and educators across all academic levels worldwide.`,
    "url": `https://learnpik.com/category/${subjectSlug}`,
    "provider": {
      "@type": "Organization",
      "name": "Learnpik",
      "logo": "https://learnpik.com/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Inject Structured Metadata schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaStructuredData) }}
      />

      {/* 1. BREADCRUMBS */}
      <nav className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-brand-faint mb-6 select-none">
        <Link href="/" className="hover:text-brand font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-brand-faint" />
        <span className="hover:text-brand font-medium">Syllabus Resources</span>
        <ChevronRight className="w-3.5 h-3.5 text-brand-faint" />
        <span className="text-brand font-bold">{subjectName}</span>
      </nav>

      {/* 2. SUBJECT HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand flex items-center gap-2">
            <span>{subjectIcon}</span>
            <span>{subjectName} Revision Resources</span>
          </h1>
          <p className="text-xs md:text-sm text-brand-muted font-semibold mt-1">
            Over {filteredItems.length + 18} curriculum-aligned diagrams, mind maps & study aids.
          </p>
        </div>

        {/* Grade Pills Filter */}
        <div className="flex gap-1.5 text-[10px] font-black uppercase">
          {["All", "OL", "AL", "University"].map((gr) => (
            <button
              key={gr}
              onClick={() => setActiveGradeFilter(gr)}
              className={`px-4.5 py-2.5 rounded-xl border font-bold transition-all ${
                activeGradeFilter === gr
                  ? "bg-brand border-brand text-white shadow-sm"
                  : "bg-white border-brand-border text-brand hover:border-brand"
              }`}
            >
              {gr} Resources
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <SearchFilters />
        </aside>

        {/* Results grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex justify-between items-center text-xs font-bold text-brand-muted">
            <span>Showing 1-{filteredItems.length} of {filteredItems.length} results</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ImageCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnailUrl={item.thumbnailUrl}
                subject={item.subject}
                grade={item.grade}
                type={item.type}
                isPremium={item.isPremium}
                downloadCount={item.downloads}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-3 py-16 text-center text-xs text-brand-faint bg-white border border-brand-border rounded-2xl shadow-sm italic">
                No visual resources found matching these filter combinations.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. RELATED SUBJECTS ROW */}
      <div className="max-w-7xl mx-auto border-t border-brand-border pt-12 mt-16">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand mb-6 flex items-center gap-1.5">
          <BookOpen className="w-4.5 h-4.5 text-brand" />
          Explore Related Subjects
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Chemistry", icon: FlaskConical, slug: "chemistry" },
            { name: "Physics", icon: Atom, slug: "physics" },
            { name: "Biology", icon: Microscope, slug: "biology" },
          ]
            .filter((x) => x.name !== subjectName)
            .map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="bg-white border border-brand-border hover:border-brand rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-lg bg-[#f3f3f3] text-brand flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-brand">
                  {item.name} Resources
                </span>
              </Link>
            ))}
        </div>
      </div>

    </div>
  );
}
