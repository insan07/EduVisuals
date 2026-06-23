import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(ip, "search", { limit: 100, windowMs: 60000 });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "relevant";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 24;
  const offset = (page - 1) * pageSize;

  const grades = searchParams.getAll("grade");
  const subjects = searchParams.getAll("subject");
  const types = searchParams.getAll("type");
  const syllabuses = searchParams.getAll("syllabus");
  const mediums = searchParams.getAll("medium");
  const premiumParam = searchParams.get("premium");

  // If Supabase not configured, return helpful empty state
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ images: [], total: 0, page, hasMore: false, mock: true });
  }

  try {
    // Build base query joining images with image_tags
    let query = supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        file_url,
        is_premium,
        download_count,
        view_count,
        created_at,
        image_tags (
          tag,
          tag_type
        )
      `, { count: "exact" })
      .eq("is_published", true)
      .eq("status", "approved");

    // Full-text search on title + description
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Tag-based filters — filter by image_ids that have matching tags
    if (grades.length > 0) {
      const { data: gradeTagImages } = await supabase
        .from("image_tags")
        .select("image_id")
        .eq("tag_type", "grade")
        .in("tag", grades);
      const ids = (gradeTagImages || []).map((r: any) => r.image_id);
      if (ids.length === 0) return NextResponse.json({ images: [], total: 0, page, hasMore: false });
      query = query.in("id", ids);
    }

    if (subjects.length > 0) {
      const { data: subjectTagImages } = await supabase
        .from("image_tags")
        .select("image_id")
        .eq("tag_type", "subject")
        .in("tag", subjects);
      const ids = (subjectTagImages || []).map((r: any) => r.image_id);
      if (ids.length === 0) return NextResponse.json({ images: [], total: 0, page, hasMore: false });
      query = query.in("id", ids);
    }

    if (types.length > 0) {
      const { data: typeTagImages } = await supabase
        .from("image_tags")
        .select("image_id")
        .eq("tag_type", "type")
        .in("tag", types);
      const ids = (typeTagImages || []).map((r: any) => r.image_id);
      if (ids.length === 0) return NextResponse.json({ images: [], total: 0, page, hasMore: false });
      query = query.in("id", ids);
    }

    if (premiumParam !== null && premiumParam !== "") {
      query = query.eq("is_premium", premiumParam === "true");
    }

    // Sorting
    if (sort === "popular") query = query.order("download_count", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("download_count", { ascending: false }); // default relevance

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Flatten tags into subject/grade/type fields for frontend
    const images = (data || []).map((img: any) => {
      const tags = img.image_tags || [];
      const subject = tags.find((t: any) => t.tag_type === "subject")?.tag || "General";
      const grade = tags.find((t: any) => t.tag_type === "grade")?.tag || "General";
      const type = tags.find((t: any) => t.tag_type === "type")?.tag || "Diagram";
      const syllabus = tags.find((t: any) => t.tag_type === "syllabus")?.tag || "";
      const medium = tags.find((t: any) => t.tag_type === "medium")?.tag || "";
      return {
        id: img.id,
        title: img.title,
        description: img.description,
        thumbnailUrl: img.thumbnail_url,
        file_url: img.file_url,
        isPremium: img.is_premium,
        downloadCount: img.download_count,
        subject,
        grade,
        type,
        syllabus,
        medium,
      };
    });

    const total = count || 0;
    return NextResponse.json({
      images,
      total,
      page,
      hasMore: offset + pageSize < total,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed", images: [], total: 0 }, { status: 500 });
  }
}
