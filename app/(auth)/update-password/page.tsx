"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Toast from "@/components/Toast";
import { PremiumLoader } from "@/components/PremiumLoader";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    // Supabase redirects here with an access_token in the URL hash after clicking the email link.
    // The supabase-js client automatically parses this and sets the session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage({ text: "No active password reset session found. Please request a new link.", isError: true });
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", isError: true });
      return;
    }

    if (isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        setMessage({ text: "Password updated successfully! Redirecting to dashboard...", isError: false });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: any) {
        setMessage({ text: err.message || "Failed to update password.", isError: true });
        setIsLoading(false);
      }
    } else {
      setMessage({ text: "Password updated successfully! Redirecting...", isError: false });
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-brand-surface relative w-full">
      <Toast />
      
      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-brand font-bold hover:opacity-80 transition-opacity">
        <ArrowLeft size={16} />
        Back to Login
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-brand-border shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand text-white rounded-xl mb-4 font-black text-xl">
            E
          </div>
          <h2 className="text-2xl font-black text-brand mb-2">Reset Password</h2>
          <p className="text-brand-faint text-sm">Enter your new secure password below.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] text-xs pl-3.5 pr-10 py-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-[#073238]/10 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand/50 hover:text-brand"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!isSupabaseConfigured() && false)}
            className="w-full bg-brand hover:bg-brand text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md shadow-black/5 mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <PremiumLoader />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
