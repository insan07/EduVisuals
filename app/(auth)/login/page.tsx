"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("return") || "/dashboard";

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(returnUrl);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push(returnUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, returnUrl]);

  const handleGoogleSignIn = async () => {
    const redirectTo = `${window.location.origin}${returnUrl}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-brand-surface relative w-full">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-brand font-bold hover:opacity-80 transition-opacity">
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-brand-border shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand text-white rounded-xl mb-4 font-black text-xl">
            E
          </div>
          <h2 className="text-2xl font-black text-brand mb-2">Welcome Back</h2>
          <p className="text-brand-faint text-sm">Sign in to access premium educational visuals and resources.</p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-brand-border hover:border-brand rounded-xl font-bold text-brand transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        
        <div className="mt-8 text-center text-xs text-brand-faint">
          By signing in, you agree to our <Link href="/terms" className="underline hover:text-brand">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-brand">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
