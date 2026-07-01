import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieNext = request.cookies.get("returnUrl")?.value;
  const rawNext = searchParams.get("next");
  const next = (rawNext && rawNext !== "") ? rawNext : (cookieNext ? decodeURIComponent(cookieNext) : "/dashboard");

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Make sure profile exists for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", data.session.user.id)
        .single();
      
      if (!profile) {
        await supabase.from("profiles").insert({
          id: data.session.user.id,
          full_name: data.session.user.user_metadata?.full_name || 
                     data.session.user.email?.split("@")[0] || "User",
          avatar_url: data.session.user.user_metadata?.avatar_url || null,
          role: "free_user",
          subscription_status: "free",
        });
      }
      const res = NextResponse.redirect(`${origin}${next}#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`);
      res.cookies.set("sb-access-token", data.session.access_token, { path: "/", maxAge: 604800, sameSite: "lax" });
      res.cookies.delete("returnUrl");
      return res;
    }
  }
  
  // If no code, it's either an error or implicit flow (hash fragment).
  // The browser will append the hash fragment to this redirect automatically.
  // So we just redirect them to `next` instead of `/?auth=error`
  const res = NextResponse.redirect(`${origin}${next}`);
  res.cookies.delete("returnUrl");
  return res;
}
