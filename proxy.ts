import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Find Supabase session cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const projectRef = supabaseUrl.split("//")[1]?.split(".")[0] || "";
  const cookieName = `sb-${projectRef}-auth-token`;
  
  const hasSession = 
    !!request.cookies.get(cookieName)?.value ||
    !!request.cookies.get("sb-access-token")?.value;

  const protectedPaths = ["/dashboard", "/admin", "/upload", "/partner/dashboard"];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/upload/:path*", "/partner/:path*"],
};
