"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Crown, Eye, EyeOff, Sparkles, User, GraduationCap, School, Info } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { GoogleLogin } from '@react-oauth/google';

export default function AuthModal() {
  const { isOpen, close, triggerSuccess, intendedDownload, nextUrl, initialTab } = useAuthModal();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);
  
  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign Up inputs
  const [name, setName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Student" | "Teacher" | "Institution">("Student");

  // Prevent scroll when modal is open and sync tab
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActiveTab(initialTab);
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const fallbackUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
        const finalNextUrl = nextUrl || fallbackUrl;
        if (typeof document !== "undefined") {
          document.cookie = `returnUrl=${encodeURIComponent(finalNextUrl)}; path=/; max-age=3600`;
        }
        
        if (credentialResponse.credential) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credentialResponse.credential,
          });
          
          if (error) throw error;
          
          if (data.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role, subscription_status")
              .eq("id", data.user.id)
              .single();

            const dbRole = profile?.role || "free_user";
            const dbTier = profile?.subscription_status === "premium" ? "Premium" : "Free";

            let displayRole = "Student";
            if (dbRole === "team_creator") displayRole = "Teacher";
            else if (dbRole === "admin") displayRole = "admin";

            handleAuthSuccess(data.user.email || "user@gmail.com", displayRole, dbTier);
          }
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
      const fallbackUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
      const finalNextUrl = nextUrl || fallbackUrl;

      if (typeof document !== "undefined") {
        document.cookie = `returnUrl=${encodeURIComponent(finalNextUrl)}; path=/; max-age=3600`;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: signUpEmail,
          password: signUpPassword,
          options: {
            data: {
              name: name,
              role: selectedRole,
            },
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(finalNextUrl)}` : undefined,
          },
        });
        if (error) throw error;

        if (data.session) {
          // Automatically logged in (Email confirmations disabled)
          handleAuthSuccess(data.user?.email || signUpEmail, selectedRole, "Free");
        } else {
          // Email confirmation required
          setIsLoading(false);
          triggerToast("Check your email to confirm registration!");
          setActiveTab("signin");
        }
      } catch (err: any) {
        setIsLoading(false);
        triggerToast(err.message || "Registration failed.", true);
      }
    } else {
      handleAuthSuccess(signUpEmail, selectedRole, "Free");
    }
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      triggerToast("Please enter your email address.", true);
      return;
    }
    
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(signInEmail, {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/update-password`,
        });
        if (error) throw error;
        
        triggerToast("Password reset email sent! Check your inbox.");
      } catch (err: any) {
        triggerToast(err.message || "Failed to send reset email.", true);
      } finally {
        setIsLoading(false);
      }
    } else {
      triggerToast("Password reset email sent! Check your inbox.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300 bg-brand/40 backdrop-blur-sm">
      
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 z-0" onClick={close} />

      {/* Modal Card: Minimal Layout */}
      <div className="relative z-10 w-full max-w-[420px] max-h-[95vh] overflow-y-auto sm:h-auto bg-white border border-brand-border sm:rounded-[24px] p-6 md:p-8 flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom sm:slide-in-from-none duration-300 select-none hide-scrollbar">
        
        <div>
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f3f3f3] hover:bg-[#e8e8e8] text-brand/70 hover:text-brand transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Minimal Header */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <h2 className="text-xl md:text-2xl font-black text-brand">
              {intendedDownload 
                ? "Sign in to Download" 
                : activeTab === "signin" 
                  ? "Welcome Back" 
                  : activeTab === "forgot"
                    ? "Reset Password"
                    : "Create an Account"}
            </h2>
            {intendedDownload && (
              <span className="text-[10px] text-brand font-black bg-[#f3f3f3] border border-brand-border px-2 py-0.5 rounded-full mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand" />
                Resuming blocked download
              </span>
            )}
          </div>

          {/* TABS selector */}
          {activeTab !== "forgot" && (
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
          )}

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center rounded-[24px]">
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute inset-0 rounded-full border-[3px] border-brand/10"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-brand border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 bg-brand rounded-full animate-pulse opacity-10"></div>
              </div>
            </div>
          )}

          {/* ================= SIGN IN TAB ================= */}
          {activeTab === "signin" && (
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
              
              {/* Google OAuth Button */}
              <div className="flex justify-center w-full min-h-[44px]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => triggerToast("Google Login Failed", true)}
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="360"
                  text="continue_with"
                />
              </div>

              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-[rgba(0,57,60,0.15)] flex-1" />
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">or continue with email</span>
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
                    onClick={() => setActiveTab("forgot")}
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

        {/* ================= FORGOT PASSWORD TAB ================= */}
        {activeTab === "forgot" && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 mt-6">
            <p className="text-xs text-brand-muted font-medium text-center mb-2 leading-relaxed">
              Enter the email address associated with your account, and we'll send you a link to reset your password.
            </p>
            
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

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md shadow-black/5 mt-2"
            >
              Send Reset Link
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className="text-xs text-brand font-black hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Fine print footer */}
        <p className="text-[9px] text-brand-muted/60 text-center leading-normal mt-6 sm:mt-8 select-none">
          By signing in, you agree to our <br />
          <Link href="/terms" onClick={close} className="underline hover:text-brand">Terms of Service</Link> &amp;{" "}
          <Link href="/privacy" onClick={close} className="underline hover:text-brand">Privacy Policy</Link>
        </p>

      </div>

      {/* Development-only Toast notification within auth modal */}
      {showToast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 border font-bold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top duration-300 ${
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

