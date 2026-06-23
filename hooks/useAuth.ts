"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  subscription_status: string;
  isPremium: boolean;
  isAdmin: boolean;
  isTeam: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUser(null); setLoading(false); return; }

    let profile: any = null;
    const { data: p } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url, subscription_status")
      .eq("id", session.user.id)
      .single();
    profile = p;

    // Auto-create profile if missing (handles existing Google users)
    if (!profile) {
      const newProfile = {
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
        avatar_url: session.user.user_metadata?.avatar_url || null,
        role: "free_user",
        subscription_status: "free",
      };
      await supabase.from("profiles").insert(newProfile);
      profile = newProfile;
    }

    const role = profile?.role || "free_user";
    const sub = profile?.subscription_status || "free";
    const isPremium = sub === "premium" || sub === "institution";
    const isAdmin = role === "admin" || role === "moderator";
    const isTeam = isAdmin || role === "team_creator";

    const authUser: AuthUser = {
      id: session.user.id,
      email: session.user.email || "",
      name: profile?.full_name || session.user.email?.split("@")[0] || "User",
      avatar: profile?.avatar_url || null,
      role,
      subscription_status: sub,
      isPremium,
      isAdmin,
      isTeam,
    };

    // Sync localStorage so existing components still work
    localStorage.setItem("edu_user", JSON.stringify({
      email: authUser.email,
      role: authUser.role,
      tier: isPremium ? "Premium" : "Free",
      name: authUser.name,
      avatar: authUser.avatar,
    }));
    window.dispatchEvent(new Event("auth-changed"));

    setUser(authUser);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") loadUser();
      if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("edu_user");
        window.dispatchEvent(new Event("auth-changed"));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Use this in protected pages — redirects to home if not logged in
export function useRequireAuth(allowedRoles?: string[]) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/?auth=required");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return { user, loading };
}
