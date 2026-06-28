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

    let isMemorySearch = false;
    let queryWords: string[] = [];

    // Multi-word fuzzy search strategy:
    // If there is a search term, we will fetch up to 400 results matching the other filters,
    // and then perform a Levenshtein-based fuzzy match in memory to tolerate spelling mistakes.
    if (q) {
      isMemorySearch = true;
      queryWords = q.trim().split(/\s+/).filter(w => w.length > 0);
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

    // Pagination or Broad Fetch for memory search
    if (isMemorySearch) {
      query = query.limit(500); // Fetch a larger chunk for fuzzy filtering
    } else {
      query = query.range(offset, offset + pageSize - 1);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    // Helper for fuzzy string matching (Levenshtein)
    function levenshtein(a: string, b: string): number {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + indicator
          );
        }
      }
      return matrix[b.length][a.length];
    }

    function getFuzzyScore(text: string, queryWord: string, weight: number): number {
      if (!text) return 0;
      const textLower = text.toLowerCase();
      const qLower = queryWord.toLowerCase();
      
      if (textLower === qLower) return 10 * weight; // Exact match
      
      if (textLower.includes(qLower)) {
        const regex = new RegExp(`\\b${qLower}\\b`);
        if (regex.test(textLower)) return 8 * weight; // Exact word match
        return 5 * weight; // Substring match
      }
      
      const textWords = textLower.split(/[\s,.-]+/);
      
      // Dynamic max distance based on word length to prevent massive false positives
      // e.g., if qLower is "6", we don't want it matching "a" (dist 1).
      let maxDist = 0;
      if (qLower.length >= 3 && qLower.length <= 5) maxDist = 1;
      else if (qLower.length > 5) maxDist = 2;

      if (maxDist === 0) return 0;

      for (const tw of textWords) {
        if (Math.abs(tw.length - qLower.length) <= maxDist) {
          const dist = levenshtein(tw, qLower);
          if (dist <= maxDist) {
            return (3 - dist) * weight;
          }
        }
      }
      return 0;
    }

      // Base normalized query for exact phrase matching
      const exactQuery = q.trim().toLowerCase();

      let images = (data || []).map((img: any) => {
        const tags = img.image_tags || [];
        const subject = tags.find((t: any) => t.tag_type === "subject")?.tag || "General";
        const grade = tags.find((t: any) => t.tag_type === "grade")?.tag || "General";
        const type = tags.find((t: any) => t.tag_type === "type")?.tag || "Diagram";
        const syllabus = tags.find((t: any) => t.tag_type === "syllabus")?.tag || "";
        const medium = tags.find((t: any) => t.tag_type === "medium")?.tag || "";
        
        let searchScore = 0;
        let matchCount = 0;
        
        if (isMemorySearch && queryWords.length > 0) {
          // 1. EXACT PHRASE BONUS
          // If the exact phrase appears in the title or tags, give a massive boost.
          if (img.title.toLowerCase().includes(exactQuery)) searchScore += 100;
          if (subject.toLowerCase().includes(exactQuery)) searchScore += 80;
          if (grade.toLowerCase().includes(exactQuery)) searchScore += 80;
          if (img.description && img.description.toLowerCase().includes(exactQuery)) searchScore += 40;

          // 2. INDIVIDUAL WORD SCORING
          for (let i = 0; i < queryWords.length; i++) {
            const word = queryWords[i];
            let wordScore = 0;
            
            wordScore += getFuzzyScore(img.title, word, 5);
            wordScore += getFuzzyScore(subject, word, 4);
            wordScore += getFuzzyScore(grade, word, 4);
            
            const typeNoSpace = type.replace(/\s+/g, '').toLowerCase();
            const wordLower = word.toLowerCase();
            wordScore += getFuzzyScore(type, word, 4);
            if (typeNoSpace.includes(wordLower) || wordLower.includes(typeNoSpace)) {
              wordScore += 4;
            }
            
            wordScore += getFuzzyScore(syllabus, word, 3);
            wordScore += getFuzzyScore(medium, word, 3);
            wordScore += getFuzzyScore(img.description, word, 1);
            
            if (wordScore > 0) {
              matchCount++;
              // Give a slight positional boost to the first few words typed by the user
              const positionalBoost = 1 + ((queryWords.length - i) * 0.15);
              searchScore += (wordScore * positionalBoost);
            }
          }
          
          if (matchCount === 0 && searchScore === 0) {
            searchScore = -1; // No words matched at all
          } else {
            // 3. EXPONENTIAL MATCH MULTIPLIER
            // If they typed 4 words, an image that matches all 4 gets a massive 16x multiplier
            // An image that only matches 1 word gets a 1x multiplier.
            searchScore *= (matchCount * matchCount);
          }
        }

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
        searchScore, // internal use
      };
    });

    let totalCount = count || 0;

    // Apply memory fuzzy filter and sort if needed
    if (isMemorySearch && queryWords.length > 0) {
      images = images.filter((img: any) => img.searchScore > 0);
      
      if (sort === "relevant") {
        images.sort((a: any, b: any) => {
          if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;
          return b.downloadCount - a.downloadCount;
        });
      }

      totalCount = images.length;
      
      // Pagination slice
      images = images.slice(offset, offset + pageSize);
    }

    // Remove internal fields
    const finalImages = images.map((img: any) => {
      const { searchScore, ...rest } = img;
      return rest;
    });

    return NextResponse.json({
      images: finalImages,
      total: totalCount,
      page,
      hasMore: offset + pageSize < totalCount,
    });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
