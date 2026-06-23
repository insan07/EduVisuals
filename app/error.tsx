"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <AlertOctagon size={80} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-black text-brand mb-3">Something went wrong</h1>
      <p className="text-brand-faint max-w-md mx-auto mb-6 text-sm md:text-base">
        An unexpected error occurred while processing your request.
      </p>
      
      {process.env.NODE_ENV === "development" && (
        <pre className="bg-red-50 text-red-700 p-4 rounded-xl max-w-2xl w-full overflow-auto text-left text-xs mb-8 border border-red-100">
          {error.message}
        </pre>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-brand text-white font-bold hover:-translate-y-0.5 transition-all shadow-md"
        >
          Try Again
        </button>
        <Link 
          href="/" 
          className="px-6 py-3 rounded-xl border border-brand-border bg-white text-brand font-bold hover:bg-brand-surface transition-colors shadow-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
