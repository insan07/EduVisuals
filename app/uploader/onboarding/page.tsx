"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, CheckCircle2, Shield, Upload, FileImage, Loader2, Sparkles, GraduationCap } from "lucide-react";
import Link from "next/link";

const SUBJECT_OPTIONS = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "Languages", "Programming", "History", "Geography", "Art & Design", "Business Studies", "Economics"];
const AUDIENCE_OPTIONS = ["Primary (Grades 1-5)", "Middle School (Grades 6-9)", "O/Level (Grades 10-11)", "A/Level (Grades 12-13)", "University / Higher Ed", "Professional"];
const CONTENT_TYPE_OPTIONS = ["Video Lessons", "Notes / PDF", "Quiz / Assessment", "Slides / Presentations", "Practice Problems", "Diagrams / Visuals"];

export default function UploaderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [qualification, setQualification] = useState("");
  const [subjectAreas, setSubjectAreas] = useState<string[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [customAudienceInput, setCustomAudienceInput] = useState("");
  
  const [agreedOriginal, setAgreedOriginal] = useState(false);
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUser(session.user);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
        
      if (profile?.full_name) {
        setDisplayName(profile.full_name);
      } else {
        setDisplayName(session.user.email?.split("@")[0] || "");
      }
    }
    loadUser();
  }, [router]);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const isStep1Valid = displayName.trim().length > 0 && 
                       subjectAreas.length > 0 && 
                       targetAudiences.length > 0;
                       
  const isStep2Valid = agreedOriginal && agreedGuidelines;

  const handleSubmit = async () => {
    if (!user || !isStep1Valid || !isStep2Valid) return;
    setLoading(true);

    try {
      // 1. Insert into uploader_profiles (trigger will handle role update)
      const { error: uploaderError } = await supabase
        .from("uploader_profiles")
        .insert({
          id: user.id,
          display_name: displayName,
          highest_qualification: qualification,
          subject_areas: subjectAreas,
          target_audiences: targetAudiences,
          short_bio: bio,
          portfolio_url: portfolio,
          original_content_agreed: agreedOriginal,
          guidelines_agreed: agreedGuidelines,
        });

      if (uploaderError) {
        console.error("Error creating uploader profile:", uploaderError);
        alert("There was an error creating your profile. Ensure you have run the database setup script.");
        setLoading(false);
        return;
      }

      // 2. Refresh session to get new role
      await supabase.auth.refreshSession();

      // Redirect to upload interface
      router.push("/uploader/upload");

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans selection:bg-brand selection:text-white">
      
      {/* LEFT PANEL - BRANDING (Hidden on Mobile, Sticky on Desktop) */}
      <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#073238] to-[#041a1d] text-white p-12 flex-col justify-between relative overflow-hidden sticky top-0 h-screen">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group mb-16">
            <div className="relative flex items-center justify-center w-8 h-8 transition-transform duration-300 group-hover:scale-110">
              <div
                style={{
                  backgroundColor: "#ffffff",
                  maskImage: "url('/logo.png?v=2')",
                  WebkitMaskImage: "url('/logo.png?v=2')",
                  maskSize: "180%",
                  WebkitMaskSize: "180%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <span className="font-black text-2xl tracking-tight">
              EduVisuals
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 text-xs font-bold shadow-sm self-start">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Creator Program</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
            Empower the Next Generation of Learners.
          </h1>
          <p className="text-lg text-white/70 font-medium max-w-md leading-relaxed">
            Join thousands of top educators sharing premium visual resources, study guides, and diagrams with a global audience.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-0.5">Global Reach</p>
            <p className="text-xs text-white/60 font-medium">Your content will help students from primary to university level master complex concepts instantly.</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM WIZARD */}
      <div className="w-full md:w-7/12 bg-white flex flex-col min-h-screen">
        
        {/* Mobile Logo (Only visible on small screens) */}
        <div className="md:hidden p-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div
                style={{
                  backgroundColor: "#073238",
                  maskImage: "url('/logo.png?v=2')",
                  WebkitMaskImage: "url('/logo.png?v=2')",
                  maskSize: "180%",
                  WebkitMaskSize: "180%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <span className="font-black text-brand text-lg tracking-tight">
              EduVisuals
            </span>
          </Link>
          <span className="text-xs font-bold text-brand bg-brand/5 px-2 py-1 rounded-md">Creator Program</span>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 flex flex-col px-6 py-10 md:px-16 lg:px-24">
          <div className="w-full max-w-xl mx-auto flex-1 flex flex-col">
            
            {/* Header / Progress */}
            <div className="mb-10">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
                Step {step} of 2
              </div>
              <h2 className="text-3xl font-black text-brand mb-2">
                {step === 1 ? "Complete your profile" : "Terms & Guidelines"}
              </h2>
              <p className="text-brand-muted font-medium">
                {step === 1 ? "Tell us about your expertise and what you plan to share." : "Please review our content policies before you start uploading."}
              </p>
            </div>

            {/* STEP 1: Profile Form */}
            {step === 1 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                
                {/* Standard Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-brand">Display Name *</label>
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#f8f9fa] border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-brand">Qualifications</label>
                    <input 
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. B.Sc Math"
                      className="w-full bg-[#f8f9fa] border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Pill Selectors */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand">Subject Area(s) *</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {SUBJECT_OPTIONS.map(sub => (
                      <button
                        key={sub}
                        onClick={() => toggleSelection(sub, subjectAreas, setSubjectAreas)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                          subjectAreas.includes(sub) 
                            ? 'bg-brand border-brand text-white shadow-md scale-[1.02]' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-brand'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                    {subjectAreas.filter(s => !SUBJECT_OPTIONS.includes(s)).map(sub => (
                      <button
                        key={sub}
                        onClick={() => toggleSelection(sub, subjectAreas, setSubjectAreas)}
                        className="px-4 py-2 rounded-full text-xs font-bold transition-all border-2 bg-brand border-brand text-white shadow-md scale-[1.02]"
                      >
                        {sub}
                      </button>
                    ))}
                    <input 
                      type="text" 
                      placeholder="+ Add Other (Press Enter)"
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customSubjectInput.trim() && !subjectAreas.includes(customSubjectInput.trim())) {
                            setSubjectAreas([...subjectAreas, customSubjectInput.trim()]);
                            setCustomSubjectInput("");
                          }
                        }
                      }}
                      className="bg-[#f8f9fa] border-2 border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-brand focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-gray-400 w-48"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand">Target Audience *</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {AUDIENCE_OPTIONS.map(aud => (
                      <button
                        key={aud}
                        onClick={() => toggleSelection(aud, targetAudiences, setTargetAudiences)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                          targetAudiences.includes(aud) 
                            ? 'bg-brand border-brand text-white shadow-md scale-[1.02]' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-brand'
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                    {targetAudiences.filter(s => !AUDIENCE_OPTIONS.includes(s)).map(aud => (
                      <button
                        key={aud}
                        onClick={() => toggleSelection(aud, targetAudiences, setTargetAudiences)}
                        className="px-4 py-2 rounded-full text-xs font-bold transition-all border-2 bg-brand border-brand text-white shadow-md scale-[1.02]"
                      >
                        {aud}
                      </button>
                    ))}
                    <input 
                      type="text" 
                      placeholder="+ Add Other (Press Enter)"
                      value={customAudienceInput}
                      onChange={(e) => setCustomAudienceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customAudienceInput.trim() && !targetAudiences.includes(customAudienceInput.trim())) {
                            setTargetAudiences([...targetAudiences, customAudienceInput.trim()]);
                            setCustomAudienceInput("");
                          }
                        }
                      }}
                      className="bg-[#f8f9fa] border-2 border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-brand focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-gray-400 w-48"
                    />
                  </div>
                </div>

                {/* Content Types removed as per request */}
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand flex justify-between">
                    <span>Short Bio</span>
                    <span className="text-gray-400 font-medium">{bio.length}/200</span>
                  </label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 200))}
                    placeholder="Share your background in creating educational visuals, diagrams, or study materials..."
                    className="w-full bg-[#f8f9fa] border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all resize-none h-24 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand">Portfolio Link</label>
                  <input 
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="e.g. YouTube channel, LinkedIn"
                    className="w-full bg-[#f8f9fa] border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-brand focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Next Button */}
                <div className="mt-4 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full bg-brand text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0a4a52] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    Continue to Guidelines
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Guidelines */}
            {step === 2 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand text-lg mb-1">Original Content Policy</h3>
                      <p className="text-sm text-brand-muted leading-relaxed font-medium">
                        EduVisuals strictly prohibits the uploading of copyrighted materials you do not own. All visuals, diagrams, and notes must be your original creation or explicitly licensed for free distribution.
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                      <input 
                        type="checkbox"
                        checked={agreedOriginal}
                        onChange={(e) => setAgreedOriginal(e.target.checked)}
                        className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-brand checked:border-brand transition-colors cursor-pointer"
                      />
                      <CheckCircle2 className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-bold text-brand group-hover:text-[#00393c] transition-colors leading-relaxed">
                      I confirm that I will only upload original content or content I have the legal right to share.
                    </span>
                  </label>
                </div>

                <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <FileImage className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand text-lg mb-1">Quality Guidelines</h3>
                      <p className="text-sm text-brand-muted leading-relaxed font-medium">
                        To maintain a premium library, all uploads are subject to review. We prioritize high-resolution, legible, and academically accurate materials. Blurry photos of handwritten notes may be rejected.
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                      <input 
                        type="checkbox"
                        checked={agreedGuidelines}
                        onChange={(e) => setAgreedGuidelines(e.target.checked)}
                        className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-brand checked:border-brand transition-colors cursor-pointer"
                      />
                      <CheckCircle2 className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-bold text-brand group-hover:text-[#00393c] transition-colors leading-relaxed">
                      I have read and agree to adhere to the EduVisuals quality standards.
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full sm:w-1/3 bg-white text-brand border-2 border-gray-200 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!isStep2Valid || loading}
                    className="w-full sm:w-2/3 bg-brand text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0a4a52] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Setting up account...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Complete Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
    </div>
  );
}
