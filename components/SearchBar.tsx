"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/searchStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  showSuggestionsInline?: boolean;
  darkHero?: boolean;
  onSubmit?: (term: string) => void;
}

export default function SearchBar({
  initialValue = "",
  placeholder = "Search educational diagrams, mind maps, layouts...",
  className = "",
  showSuggestionsInline = false,
  darkHero = false,
  onSubmit,
}: SearchBarProps) {
  const router = useRouter();
  const setStoreQuery = useSearchStore((state) => state.setQuery);

  const [inputVal, setInputVal] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const popularSubjects = [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "ICT",
    "History",
    "Geography",
  ];

  // Sync with initialValue changes
  useEffect(() => {
    setInputVal(initialValue);
  }, [initialValue]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edu_recent_searches");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          setRecentSearches([]);
        }
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save to recent searches helper
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("edu_recent_searches", JSON.stringify(updated));
    }
  };

  // Debounce search store updates
  const handleInputChange = (val: string) => {
    setInputVal(val);
    setShowDropdown(true);
    setActiveIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setSuggestions([]);
      debounceTimerRef.current = setTimeout(() => setStoreQuery(val), 300);
      return;
    }

    // Instantly show static suggestions for immediate UI feedback
    const instantFiltered = popularSubjects.filter((s) =>
      s.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(instantFiltered);

    debounceTimerRef.current = setTimeout(async () => {
      // Trigger Zustand store search
      setStoreQuery(val);

      // Live Supabase Autocomplete
      if (isSupabaseConfigured()) {
        try {
          // Query both titles and tags for rich suggestions
          const [titleRes, tagRes] = await Promise.all([
            supabase.from("images").select("title").ilike("title", `%${val}%`).eq("status", "approved").limit(4),
            supabase.from("image_tags").select("tag").ilike("tag", `%${val}%`).limit(3)
          ]);

          const combined = new Set<string>();
          
          if (titleRes.data) {
            titleRes.data.forEach((d: { title: string }) => combined.add(d.title));
          }
          if (tagRes.data) {
            tagRes.data.forEach((d: { tag: string }) => combined.add(d.tag));
          }

          if (combined.size > 0) {
            setSuggestions(Array.from(combined));
          }
          // If combined is 0, we just keep the instant static suggestions we already set
        } catch (err) {
          console.error("Search suggestion error:", err);
          // Keep instant suggestions
        }
      }
      // If not configured, we just keep the instant static suggestions
    }, 300);
  };

  const handleSearchSubmit = (term: string) => {
    const queryTerm = term.trim();
    saveRecentSearch(queryTerm);
    setShowDropdown(false);
    
    setStoreQuery(queryTerm);

    if (onSubmit) {
      onSubmit(queryTerm);
    } else {
      router.push(`/visuals?q=${encodeURIComponent(queryTerm)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = activeIndex + 1;
      const limit = suggestions.length + recentSearches.length;
      if (nextIdx < limit) {
        setActiveIndex(nextIdx);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = activeIndex - 1;
      if (prevIdx >= -1) {
        setActiveIndex(prevIdx);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        // Select active option from suggestions/recents
        if (activeIndex < suggestions.length) {
          const selected = suggestions[activeIndex];
          setInputVal(selected);
          handleSearchSubmit(selected);
        } else {
          const selected = recentSearches[activeIndex - suggestions.length];
          setInputVal(selected);
          handleSearchSubmit(selected);
        }
      } else {
        handleSearchSubmit(inputVal);
      }
    }
  };

  const clearSearch = () => {
    setInputVal("");
    setStoreQuery("");
    setSuggestions([]);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      
      {/* 1. INPUT BOX */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(inputVal);
        }}
        className={`relative w-full flex items-center transition-all duration-300 ${
          darkHero 
            ? "bg-white/10 backdrop-blur-xl border border-white/20 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-emerald-400/50 rounded-2xl shadow-inner" 
            : "bg-[#f3f3f3] border border-brand-border focus-within:border-brand focus-within:ring-4 focus-within:ring-[#073238]/5 rounded-full"
        }`}
      >
        <div className={`absolute left-4 pointer-events-none ${darkHero ? "text-white/60" : "text-brand-faint"}`}>
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={inputVal}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className={`w-full bg-transparent pl-11 pr-32 py-4 outline-none ${
            darkHero 
              ? "text-base md:text-lg font-semibold text-white placeholder:text-white/60 rounded-2xl" 
              : "text-sm text-brand placeholder:text-[rgba(0,57,60,0.45)] rounded-full"
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {inputVal && !darkHero && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 rounded-full text-brand-faint hover:text-brand hover:bg-slate-200/50 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {darkHero ? (
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all shadow-md active:scale-95 bg-white text-brand"
            >
              Search
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 bg-brand text-white hover:bg-[#00393c] flex items-center gap-2"
            >
              <span className="hidden sm:inline">Search</span>
              <Search className="w-4 h-4 sm:hidden" />
            </button>
          )}
        </div>
      </form>

      {/* 2. AUTO-COMPLETE DROPDOWN */}
      {showDropdown && (suggestions.length > 0 || recentSearches.length > 0 || !inputVal) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white border border-brand-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top duration-200">
          
          {/* Autocomplete Subject Matches */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-brand-border">
              <span className="text-[10px] font-black uppercase text-brand-faint px-3 py-1 block">
                Suggested Subject Matches
              </span>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputVal(item);
                    handleSearchSubmit(item);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold text-brand hover:bg-[#f3f3f3] rounded-lg transition-colors flex items-center gap-2 ${
                    activeIndex === idx ? "bg-[#f3f3f3]" : ""
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-b border-brand-border">
              <span className="text-[10px] font-black uppercase text-brand-faint px-3 py-1 block">
                Recent Searches
              </span>
              {recentSearches.map((item, idx) => {
                const totalIdx = suggestions.length + idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputVal(item);
                      handleSearchSubmit(item);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold text-brand hover:bg-[#f3f3f3] rounded-lg transition-colors flex items-center gap-2 ${
                      activeIndex === totalIdx ? "bg-[#f3f3f3]" : ""
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-brand-faint" />
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty query default: Popular categories list */}
          {!inputVal && (
            <div className="p-3">
              <span className="text-[10px] font-black uppercase text-brand-faint px-2 py-1 block mb-1">
                Explore Popular Categories
              </span>
              <div className="flex flex-wrap gap-2 p-1">
                {popularSubjects.map((sub, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputVal(sub);
                      handleSearchSubmit(sub);
                    }}
                    className="text-[10px] font-bold px-3 py-1.5 bg-[#f3f3f3] border border-brand-border text-brand rounded-full hover:border-brand transition-all"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
