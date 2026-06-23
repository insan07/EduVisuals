import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    supabase: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
