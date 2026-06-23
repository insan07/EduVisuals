"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect from legacy /search to new /visuals
    router.replace("/visuals");
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center">
      <div className="animate-pulse text-sm text-[rgba(0,57,60,0.5)] font-bold">
        Redirecting to Visuals...
      </div>
    </div>
  );
}
