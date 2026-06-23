import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(ip, "download", { limit: 10, windowMs: 60000 });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { imageId } = await request.json();
    if (!imageId) return NextResponse.json({ error: "Image ID required" }, { status: 400 });

    // Get auth token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Create Supabase client with user's JWT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required to download" }, { status: 401 });
    }

    // Get user profile (role + subscription + daily downloads)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, subscription_status, downloads_today, last_download_date")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Get the image details
    const { data: image } = await supabase
      .from("images")
      .select("id, file_url, thumbnail_url, watermarked_url, is_premium, title")
      .eq("id", imageId)
      .eq("is_published", true)
      .single();

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check premium access
    const isPremiumUser = profile.subscription_status === "premium" || 
                          profile.subscription_status === "institution" ||
                          profile.role === "admin" || 
                          profile.role === "moderator";

    if (image.is_premium && !isPremiumUser) {
      return NextResponse.json({ 
        error: "Premium subscription required", 
        requiresPremium: true 
      }, { status: 403 });
    }

    // Check daily download limit for free users
    const today = new Date().toISOString().split("T")[0];
    const isNewDay = profile.last_download_date !== today;
    const dailyCount = isNewDay ? 0 : (profile.downloads_today || 0);
    
    if (!isPremiumUser && dailyCount >= 5) {
      return NextResponse.json({ 
        error: "Daily download limit reached (5/day for free users)",
        limitReached: true,
        resetTime: "tomorrow"
      }, { status: 403 });
    }

    // Determine download URL
    const downloadUrl = isPremiumUser 
      ? image.file_url 
      : (image.watermarked_url || image.file_url);

    // Log the download
    await supabase.from("downloads").insert({
      user_id: user.id,
      image_id: imageId,
      download_type: isPremiumUser ? "premium_hd" : "free_watermarked",
      ip_address: ip,
    });

    // Update daily download counter
    await supabase.from("profiles").update({
      downloads_today: isNewDay ? 1 : dailyCount + 1,
      last_download_date: today,
    }).eq("id", user.id);

    // Increment image download count
    await supabase.rpc("increment_download_count", { image_id: imageId });

    return NextResponse.json({ 
      downloadUrl,
      isPremium: isPremiumUser,
      remainingToday: isPremiumUser ? "unlimited" : (4 - dailyCount),
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
