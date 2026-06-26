import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const res = await fetch(url);
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
