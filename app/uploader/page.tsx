"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function UploaderRouterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUploaderStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/?auth=required&next=/uploader");
        return;
      }

      const { data: uploaderProfile } = await supabase
        .from("uploader_profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (uploaderProfile) {
        router.push("/uploader/dashboard");
      } else {
        router.push("/uploader/onboarding");
      }
    }

    checkUploaderStatus();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface pt-20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <p className="text-brand font-bold">Checking uploader status...</p>
      </div>
    </div>
  );
}
