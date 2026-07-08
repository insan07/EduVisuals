import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Security check: Prevent SSRF by strictly allowing only trusted domains
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return new NextResponse("Invalid URL parameter", { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseHostname = "";
  try {
    if (supabaseUrl) {
      supabaseHostname = new URL(supabaseUrl).hostname;
    }
  } catch (e) {}

  const allowedHostnames = ["res.cloudinary.com"];
  if (supabaseHostname) {
    allowedHostnames.push(supabaseHostname);
  }

  if (!allowedHostnames.includes(parsedUrl.hostname)) {
    return new NextResponse("Forbidden: Untrusted image source", { status: 403 });
  }

  try {
    const res = await fetch(parsedUrl.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch upstream image: ${res.status}`);
    }

    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("content-type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=86400, immutable");
    // Enable CORS for canvas processing
    headers.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Error proxying image", { status: 500 });
  }
}
