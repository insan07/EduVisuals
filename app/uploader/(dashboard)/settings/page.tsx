"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Settings as SettingsIcon, Save } from "lucide-react";

export default function UploaderSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("uploader_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.short_bio || "");
        setPortfolio(data.portfolio_url || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("uploader_profiles")
      .update({
        display_name: displayName,
        short_bio: bio,
        portfolio_url: portfolio,
        updated_at: new Date().toISOString()
      })
      .eq("id", profile.id);
      
    if (error) {
      alert("Failed to save profile updates.");
    } else {
      alert("Profile updated successfully!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" /> Account Settings
        </h1>
        <p className="text-brand-muted font-medium">Update your public contributor profile information.</p>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-bold text-brand mb-2">Display Name</label>
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-brand-border rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand mb-2">Short Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              className="w-full bg-[#f8f9fa] border border-brand-border rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand transition-all resize-none h-24"
            />
            <div className="text-right text-xs text-brand-muted mt-1 font-semibold">{bio.length}/200</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand mb-2">Portfolio / Social Link</label>
            <input 
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-brand-border rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand transition-all"
            />
          </div>

          <hr className="border-brand-border" />

          {/* Read Only Data */}
          <div>
            <label className="block text-sm font-bold text-brand mb-2">Registered Subjects</label>
            <div className="flex flex-wrap gap-2">
              {profile?.subject_areas?.map((sub: string) => (
                <span key={sub} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
                  {sub}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">To change your primary subject areas, please contact support.</p>
          </div>

          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-brand text-white font-bold px-8 py-3 rounded-xl hover:bg-[#0a4a52] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
