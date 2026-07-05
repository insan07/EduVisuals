"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {  Settings as SettingsIcon, Save, Upload, User } from "lucide-react";
import { PremiumLoader } from "@/components/PremiumLoader";

export default function UploaderSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("uploader_profiles")
        .select("*, profiles(avatar_url)")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.short_bio || "");
        setPortfolio(data.portfolio_url || "");
        if (data.profiles && (data.profiles as any).avatar_url) {
          setAvatarUrl((data.profiles as any).avatar_url);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    
    let currentAvatarUrl = avatarUrl;
    
    // Upload new avatar if selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("visuals")
        .upload(filePath, avatarFile);
        
      if (uploadError) {
        alert("Failed to upload profile picture.");
        setSaving(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from("visuals")
        .getPublicUrl(filePath);
        
      currentAvatarUrl = publicUrl;
      setAvatarUrl(currentAvatarUrl);
      
      // Update profiles table
      await supabase
        .from("profiles")
        .update({ avatar_url: currentAvatarUrl })
        .eq("id", profile.id);
    }

    // Update uploader_profiles table
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
        <PremiumLoader className="w-8 h-8 text-brand animate-spin" />
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

      <div className="bg-white rounded-xl border border-brand-border p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-bold text-brand mb-4">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0">
                {avatarPreview || avatarUrl ? (
                  <img src={avatarPreview || avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-brand-border text-brand font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4" /> Choose New Picture
                </button>
                <p className="text-xs text-brand-muted font-medium">JPEG, PNG or WEBP. Max 2MB.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          <hr className="border-brand-border" />
          
          <div>
            <label className="block text-sm font-bold text-brand mb-2">Display Name</label>
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm font-medium text-brand focus:outline-none focus:border-brand/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand mb-2">Short Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="e.g., I create engaging Mind Maps and diagrams to help high school students master complex Science and Math concepts."
              className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand/50 transition-all resize-none h-24 placeholder:text-gray-400"
            />
            <div className="text-right text-xs text-brand-faint mt-1 font-semibold">{bio.length}/200</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand mb-2">Portfolio / Social Link</label>
            <input 
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm font-medium text-brand focus:outline-none focus:border-brand/50 transition-all"
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
              className="bg-brand text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#0a4a52] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              {saving ? <PremiumLoader className="text-white" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
