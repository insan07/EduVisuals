"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Crown, Eye, EyeOff, Sparkles, User, GraduationCap, School, Info } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AuthModal() {
  const { isOpen, close, triggerSuccess, intendedDownload } = useAuthModal();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);
  const [googleDisabled, setGoogleDisabled] = useState(false);
  
  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign Up inputs
  const [name, setName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Student" | "Teacher" | "Institution">("Student");

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setToastMessage(customEvent.detail || "");
      setShowToast(true);
    };
    window.addEventListener("show-auth-toast", handleShowToast);
    return () => {
      window.removeEventListener("show-auth-toast", handleShowToast);
    };
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!isOpen) return null;

  // Mock Authentication Success Helper
  // unified Authentication Success Handler
  const handleAuthSuccess = (email: string, role: string, tier: "Free" | "Premium") => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        // Save user session details
        localStorage.setItem(
          "edu_user",
          JSON.stringify({ email, role, tier })
        );
        // Dispatch a custom event to notify all listening components to re-render
        window.dispatchEvent(new Event("auth-changed"));
      }
      triggerSuccess(); // Triggers the blocked download action and closes the modal
    }, 850);
  };

  const triggerToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    setShowToast(true);
  };

  const handleGoogleLogin = async () => {
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
          },
        });
        if (error) {
          // Provider not enabled in Supabase Dashboard
          if (error.message?.toLowerCase().includes("provider") || error.status === 400) {
            setGoogleDisabled(true);
            triggerToast("Google login is not configured yet. Please use Email & Password below.", true);
          } else {
            triggerToast(error.message || "Google authentication failed.", true);
          }
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        setIsLoading(false);
        triggerToast(err.message || "Google authentication failed.", true);
      }
    } else {
      handleAuthSuccess("google.student@gmail.com", "Student", "Free");
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) return;
    
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password: signInPassword,
        });
        if (error) throw error;

        if (data.user) {
          // Fetch public profile to get role and tier mapping
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, subscription_status")
            .eq("id", data.user.id)
            .single();

          const dbRole = profile?.role || "free_user";
          const dbTier = profile?.subscription_status === "premium" ? "Premium" : "Free";

          // Map db role back to select-friendly display case
          let displayRole = "Student";
          if (dbRole === "team_creator") displayRole = "Teacher";
          else if (dbRole === "admin") displayRole = "admin";

          handleAuthSuccess(data.user.email || signInEmail, displayRole, dbTier);
        }
      } catch (err: any) {
        setIsLoading(false);
        triggerToast(err.message || "Sign in failed. Check credentials.", true);
      }
    } else {
      const isPremium = signInEmail.toLowerCase().includes("premium");
      handleAuthSuccess(signInEmail, "Student", isPremium ? "Premium" : "Free");
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !signUpEmail || !signUpPassword) return;
    
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: signUpEmail,
          password: signUpPassword,
          options: {
            data: {
              name: name,
              role: selectedRole,
            },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;

        setIsLoading(false);
        triggerToast("Check your email to confirm registration!");
        setActiveTab("signin");
      } catch (err: any) {
        setIsLoading(false);
        triggerToast(err.message || "Registration failed.", true);
      }
    } else {
      handleAuthSuccess(signUpEmail, selectedRole, "Free");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300 bg-brand/40 backdrop-blur-sm">
      
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 z-0" onClick={close} />

      {/* Modal Card: light premium layout */}
      <div className="relative z-10 w-full max-w-[400px] h-full sm:h-auto bg-white border border-brand-border sm:rounded-[20px] p-6 md:p-8 flex flex-col justify-between sm:justify-start shadow-2xl animate-in zoom-in-95 slide-in-from-bottom sm:slide-in-from-none duration-300 select-none">
        
        <div>
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f3f3f3] hover:bg-[#e8e8e8] text-brand/70 hover:text-brand transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Crown Logo Header */}
          <div className="flex flex-col items-center text-center mt-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#073238]/10 to-[#073238]/5 border border-brand-border flex items-center justify-center mb-3">
              <Crown className="w-7 h-7 text-brand" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-brand">
              Sign in to Download
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-1">
              Join 50,000+ Global students. It&apos;s free.
            </p>
            {intendedDownload && (
              <span className="text-[10px] text-brand font-black bg-[#f3f3f3] border border-brand-border px-2 py-0.5 rounded-full mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand" />
                Resuming blocked download
              </span>
            )}
          </div>

          {/* TABS selector */}
          <div className="flex border-b border-brand-border mb-6">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider text-center transition-all ${
                activeTab === "signin"
                  ? "border-b-2 border-brand text-brand"
                  : "text-brand-muted hover:text-brand/80"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider text-center transition-all ${
                activeTab === "signup"
                  ? "border-b-2 border-brand text-brand"
                  : "text-brand-muted hover:text-brand/80"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center rounded-[20px]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
              <p className="text-xs text-brand font-bold mt-4">Authenticating session...</p>
            </div>
          )}

          {/* ================= SIGN IN TAB ================= */}
          {activeTab === "signin" && (
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
              
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleDisabled}
                className={`w-full bg-white border text-brand font-black text-xs h-12 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                  googleDisabled
                    ? "opacity-50 cursor-not-allowed border-red-200 bg-red-50"
                    : "border-brand-border hover:bg-slate-50 hover:shadow-md hover:-translate-y-[0.5px]"
                }`}
              >
                {/* Google logo G */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              {googleDisabled && (
                <div className="-mt-1 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2 text-[10px] font-semibold text-amber-800">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span>Google login isn't enabled yet in the dashboard. Use <strong>Email & Password</strong> below — it works fully right now.</span>
                </div>
              )}

              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-[rgba(0,57,60,0.15)] flex-1" />
                <span className="text-[10px] text-[rgba(0,57,60,0.5)] font-bold uppercase">or</span>
                <div className="h-px bg-[rgba(0,57,60,0.15)] flex-1" />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs px-3.5 py-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-[#073238]/10 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerToast("Forgot password flow triggered")}
                    className="text-[10px] font-bold text-brand hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs pl-3.5 pr-10 py-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-[#073238]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand/50 hover:text-brand"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md shadow-black/5 mt-2"
              >
                Sign In
              </button>

              <div className="text-center mt-2">
                <span className="text-[11px] text-brand-muted font-semibold">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-brand font-black hover:underline"
                  >
                    Sign up free →
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ================= CREATE ACCOUNT TAB ================= */}
          {activeTab === "signup" && (
            <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
              
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs px-3.5 py-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-[#073238]/10 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs px-3.5 py-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-[#073238]/10 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs px-3.5 py-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-[#073238]/10 transition-all"
                />
              </div>

              {/* Role selector radio group pills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  I am a...
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Student", icon: GraduationCap },
                    { label: "Teacher", icon: User },
                    { label: "Institution", icon: School },
                  ].map((role) => {
                    const RoleIcon = role.icon;
                    const isSelected = selectedRole === role.label;
                    return (
                      <button
                        key={role.label}
                        type="button"
                        onClick={() => setSelectedRole(role.label as any)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                          isSelected
                            ? "bg-brand border-brand text-white shadow shadow-black/5"
                            : "bg-[#f3f3f3] border-brand-border text-brand-muted hover:border-brand/40"
                        }`}
                      >
                        <RoleIcon className="w-4.5 h-4.5" />
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md shadow-black/5 mt-2"
              >
                Create Free Account
              </button>

              <div className="text-center mt-2">
                <span className="text-[11px] text-brand-muted font-semibold">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="text-brand font-black hover:underline"
                  >
                    Sign In →
                  </button>
                </span>
              </div>
            </form>
          )}

        </div>

        {/* Fine print footer */}
        <p className="text-[9px] text-brand-muted/60 text-center leading-normal mt-6 sm:mt-8 select-none">
          By signing in, you agree to our <br />
          <Link href="/terms" onClick={close} className="underline hover:text-brand">Terms of Service</Link> &amp;{" "}
          <Link href="/privacy" onClick={close} className="underline hover:text-brand">Privacy Policy</Link>
        </p>

      </div>

      {/* Development-only Toast notification within auth modal */}
      {showToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 border font-bold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom duration-300 ${
          toastIsError
            ? "bg-red-600 border-red-700 text-white"
            : "bg-brand border-brand-border text-white"
        }`}>
          <Info className="w-4 h-4 text-white" />
          {toastMessage}
        </div>
      )}

    </div>
  );
}

