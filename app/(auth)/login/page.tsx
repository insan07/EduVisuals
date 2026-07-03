"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (typeof document !== "undefined") {
      document.cookie = `returnUrl=${encodeURIComponent(returnUrl)}; path=/; max-age=3600`;
    }
    
    if (credentialResponse.credential) {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });
      
      if (error) {
        console.error("Error signing in with Google ID token", error);
        alert(error.message || "Failed to sign in with Google");
      }
      // successful login will be caught by the onAuthStateChange listener
    }
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

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Google Login Failed');
              alert('Google Login Failed. Please try again.');
            }}
            shape="rectangular"
            theme="outline"
            size="large"
            width="320"
          />
        </div>
        
        <div className="mt-8 text-center text-xs text-brand-faint">
          By signing in, you agree to our <Link href="/terms" className="underline hover:text-brand">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-brand">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
