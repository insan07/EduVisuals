"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/searchStore";

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    query,
    filters,
    sort,
    results,
    loading,
    error,
    hasMore,
    setQuery,
    setFilter,
    setSort,
    loadMore,
    search,
  } = useSearchStore();

  const isInitialMount = useRef(true);

  // 1. Sync Zustand store state WITH URL search parameters on Mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      const q = searchParams.get("q") || "";
      const sortVal = (searchParams.get("sort") || "relevant") as any;
      const grades = searchParams.getAll("grade");
      const subjects = searchParams.getAll("subject");
      const types = searchParams.getAll("type");
      const syllabuses = searchParams.getAll("syllabus");
      const mediums = searchParams.getAll("medium");
      const premiumVal = searchParams.get("premium");

      // Set Zustand store states directly
      useSearchStore.setState({
        query: q,
        sort: sortVal,
        filters: {
          grade: grades,
          subject: subjects,
          type: types,
          premium: premiumVal === "true" ? true : premiumVal === "false" ? false : null,
          syllabus: syllabuses,
          medium: mediums,
        },
      });

      // Execute search
      search();
    }
  }, [searchParams, search]);

  // 2. Sync URL parameters with Zustand store updates
  useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort !== "relevant") params.set("sort", sort);

    filters.grade.forEach((g) => params.append("grade", g));
    filters.subject.forEach((s) => params.append("subject", s));
    filters.type.forEach((t) => params.append("type", t));
    filters.syllabus.forEach((sy) => params.append("syllabus", sy));
    filters.medium.forEach((m) => params.append("medium", m));
    
    if (filters.premium !== null) {
      params.set("premium", String(filters.premium));
    }

    const queryStr = params.toString();
    const targetUrl = `/visuals${queryStr ? `?${queryStr}` : ""}`;
    
    // Smooth URL push update without resetting page layout
    router.replace(targetUrl);
  }, [query, filters, sort, router]);

  // 3. Infinite scroll scroll-listener hook
  const handleScroll = () => {
    if (typeof window === "undefined") return;
    
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    // Trigger loadMore if scrolled within 100px of page bottom
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  return {
    query,
    filters,
    sort,
    results,
    loading,
    error,
    hasMore,
    setQuery,
    setFilter,
    setSort,
    loadMore,
  };
}
