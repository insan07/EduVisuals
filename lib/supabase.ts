import { createClient } from "@supabase/supabase-js";

// Safe placeholder values to prevent initialization crashes when env variables are unset
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if a real Supabase configuration exists in the environment variables.
 */
export function isSupabaseConfigured(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "" &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
}
