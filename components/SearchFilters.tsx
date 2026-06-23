"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Crown, Sparkles } from "lucide-react";
import { useSearchStore } from "@/lib/searchStore";
import { cn } from "@/lib/utils";

export default function SearchFilters() {
  const { filters, setFilter, clearFilters } = useSearchStore();

  const [expanded, setExpanded] = useState({
    grade: true,
    subject: true,
    type: true,
    content: true,
    syllabus: false,
    medium: false,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const grades = ["OL", "AL", "Grade 6-9", "University", "General"];
  const subjects = [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Combined Science",
    "ICT",
    "History",
    "Geography",
    "Commerce",
    "Sinhala",
    "Tamil",
    "English",
  ];
  const types = ["Mind Map", "Diagram", "Graph", "Flowchart", "Illustration", "Summary"];
  const syllabuses = ["National Syllabus", "Cambridge", "Edexcel", "London", "University"];
  const mediums = ["English Medium", "Sinhala Medium", "Tamil Medium"];

  const handleCheckboxChange = (
    key: "grade" | "subject" | "type" | "syllabus" | "medium",
    item: string
  ) => {
    const activeList = filters[key];
    const updated = activeList.includes(item)
      ? activeList.filter((x) => x !== item)
      : [...activeList, item];
    setFilter(key, updated);
  };

  const handlePremiumChange = (val: boolean | null) => {
    setFilter("premium", val);
  };

  return (
    <div className="flex flex-col gap-6 select-none bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
      
      {/* HEADER */}
      <div className="flex justify-between items-center pb-3 border-b border-brand-border">
        <h3 className="font-extrabold text-sm text-brand flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand" />
          Quick Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-[10px] font-bold text-brand hover:text-brand hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Clear All
        </button>
      </div>

      {/* 1. GRADE FILTER */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection("grade")}
          className="flex justify-between items-center w-full font-bold text-xs uppercase tracking-wider text-brand py-1"
        >
          <span>Grade Level</span>
          {expanded.grade ? <ChevronUp className="w-4 h-4 text-brand" /> : <ChevronDown className="w-4 h-4 text-brand" />}
        </button>
        {expanded.grade && (
          <div className="mt-2.5 flex flex-col gap-2">
            {grades.map((g) => {
              const checked = filters.grade.includes(g);
              return (
                <label key={g} className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange("grade", g)}
                    className="accent-[#073238] w-4 h-4 border-brand-border rounded focus:ring-[#073238]"
                  />
                  <span>{g}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. CONTENT TYPE (FREE / PREMIUM) */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection("content")}
          className="flex justify-between items-center w-full font-bold text-xs uppercase tracking-wider text-brand py-1"
        >
          <span>Content Tier</span>
          {expanded.content ? <ChevronUp className="w-4 h-4 text-brand" /> : <ChevronDown className="w-4 h-4 text-brand" />}
        </button>
        {expanded.content && (
          <div className="mt-2.5 flex flex-col gap-2">
            <label className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
              <input
                type="radio"
                name="tier"
                checked={filters.premium === null}
                onChange={() => handlePremiumChange(null)}
                className="accent-[#073238] w-4 h-4"
              />
              <span>All Levels</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
              <input
                type="radio"
                name="tier"
                checked={filters.premium === false}
                onChange={() => handlePremiumChange(false)}
                className="accent-[#073238] w-4 h-4"
              />
              <span className="flex items-center gap-1">
                Free Only
                <span className="text-[8px] font-black uppercase px-1 rounded bg-[#f3f3f3] text-brand border border-brand-border">Free</span>
              </span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
              <input
                type="radio"
                name="tier"
                checked={filters.premium === true}
                onChange={() => handlePremiumChange(true)}
                className="accent-[#073238] w-4 h-4"
              />
              <span className="flex items-center gap-1">
                Premium Only
                <span className="text-[8px] font-black uppercase px-1 rounded bg-brand text-white flex items-center gap-0.5 border border-brand-border">
                  <Crown className="w-2 h-2 text-white" /> Premium
                </span>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 3. SUBJECT FILTER */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection("subject")}
          className="flex justify-between items-center w-full font-bold text-xs uppercase tracking-wider text-brand py-1"
        >
          <span>Subject</span>
          {expanded.subject ? <ChevronUp className="w-4 h-4 text-brand" /> : <ChevronDown className="w-4 h-4 text-brand" />}
        </button>
        {expanded.subject && (
          <div className="mt-2.5 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {subjects.map((s) => {
              const checked = filters.subject.includes(s);
              return (
                <label key={s} className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange("subject", s)}
                    className="accent-[#073238] w-4 h-4 border-brand-border rounded focus:ring-[#073238]"
                  />
                  <span>{s}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. VISUAL TYPE FILTER */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection("type")}
          className="flex justify-between items-center w-full font-bold text-xs uppercase tracking-wider text-brand py-1"
        >
          <span>Visual Format</span>
          {expanded.type ? <ChevronUp className="w-4 h-4 text-brand" /> : <ChevronDown className="w-4 h-4 text-brand" />}
        </button>
        {expanded.type && (
          <div className="mt-2.5 flex flex-col gap-2">
            {types.map((t) => {
              const checked = filters.type.includes(t);
              return (
                <label key={t} className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange("type", t)}
                    className="accent-[#073238] w-4 h-4 border-brand-border rounded focus:ring-[#073238]"
                  />
                  <span>{t}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. SYLLABUS FILTER (COLLAPSED) */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection("syllabus")}
          className="flex justify-between items-center w-full font-bold text-xs uppercase tracking-wider text-brand py-1"
        >
          <span>Syllabus</span>
          {expanded.syllabus ? <ChevronUp className="w-4 h-4 text-brand" /> : <ChevronDown className="w-4 h-4 text-brand" />}
        </button>
        {expanded.syllabus && (
          <div className="mt-2.5 flex flex-col gap-2">
            {syllabuses.map((sy) => {
              const checked = filters.syllabus.includes(sy);
              return (
                <label key={sy} className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange("syllabus", sy)}
                    className="accent-[#073238] w-4 h-4 border-brand-border rounded focus:ring-[#073238]"
                  />
                  <span>{sy}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. MEDIUM FILTER (COLLAPSED) */}
      <div>
        <button
          onClick={() => toggleSection("medium")}
          className="flex justify-between items-center w-full font-bold text-xs uppercase tracking-wider text-brand py-1"
        >
          <span>Language Medium</span>
          {expanded.medium ? <ChevronUp className="w-4 h-4 text-brand" /> : <ChevronDown className="w-4 h-4 text-brand" />}
        </button>
        {expanded.medium && (
          <div className="mt-2.5 flex flex-col gap-2">
            {mediums.map((m) => {
              const checked = filters.medium.includes(m);
              return (
                <label key={m} className="flex items-center gap-2.5 text-xs text-brand font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange("medium", m)}
                    className="accent-[#073238] w-4 h-4 border-brand-border rounded focus:ring-[#073238]"
                  />
                  <span>{m}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
