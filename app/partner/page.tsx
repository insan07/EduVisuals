"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthModal } from "@/store/useAuthModal";
import { Crown, Upload, TrendingUp, Users, CheckCircle, Star, BookOpen, Calculator } from "lucide-react";

const SUBJECTS = ["Biology","Chemistry","Physics","Mathematics","History","Geography","ICT","Commerce","Art","English","Sinhala","Tamil"];

export default function PartnerPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [step, setStep] = useState<"landing"|"apply"|"success">("landing");
  const [submitting, setSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [sliderValue, setSliderValue] = useState(500);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.email) setContactEmail(s.user.email);
      if (s) {
        supabase.from("partners").select("id, status").eq("user_id", s.user.id).single()
          .then(({ data }) => { if (data) setExistingApp(data); });
      }
    });
  }, []);

  const estimatedEarnings = Math.round(sliderValue * 0.15 * 30 + sliderValue * 0.05 * 2.5 * 30);

  const handleApply = async () => {
    if (!session) { useAuthModal.getState().open(); return; }
    if (!businessName || !description || selectedSubjects.length === 0 || !agreed) {
      alert("Please fill all required fields and agree to terms."); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("partners").insert({
      user_id: session.user.id,
      business_name: businessName,
      contact_email: contactEmail,
      description,
      portfolio_url: portfolioUrl,
      subject_specialties: selectedSubjects,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { alert("Error: " + error.message); return; }
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-brand-surface">

      {/* HERO */}
      <section className="bg-white border-b border-brand-border py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 border border-brand-border rounded-full text-xs font-black text-brand uppercase tracking-wider mb-6">
            <Star className="w-3.5 h-3.5" /> Partner Program
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-brand mb-4 leading-tight">
            Create Educational Visuals.<br />
            <span className="text-brand">Earn Real Money.</span>
          </h1>
          <p className="text-brand-muted text-sm md:text-base font-medium mb-8 max-w-2xl mx-auto">
            Upload AI-generated diagrams, mind maps and study visuals. Earn <strong>30% revenue share</strong> on every download of your content. Perfect for teachers, tutors and designers.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-10 text-center">
            {[["30%","Revenue Share"],["48hr","Review Time"],["Any Subject","All Accepted"],["Monthly","Payments"]].map(([n,l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-brand">{n}</p>
                <p className="text-xs text-brand-muted font-semibold">{l}</p>
              </div>
            ))}
          </div>
          {existingApp ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-sm">
              <CheckCircle className="w-4 h-4" />
              Application status: <span className="uppercase font-black">{existingApp.status}</span>
            </div>
          ) : (
            <button onClick={() => setStep("apply")}
              className="px-8 py-4 bg-brand text-white font-black text-sm rounded-xl hover:opacity-90 transition-all shadow-lg">
              Apply to Become a Partner →
            </button>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-brand text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step:"1", icon:"📝", title:"Apply", desc:"Submit your application with your subject expertise and a brief portfolio. Free to apply." },
              { step:"2", icon:"✅", title:"Get Approved", desc:"Our team reviews within 48 hours. You'll get an email. Approved = instant upload access." },
              { step:"3", icon:"💰", title:"Upload & Earn", desc:"Upload visuals, get discovered by students. Earn 30% of every download payment automatically." },
            ].map(item => (
              <div key={item.step} className="bg-white border border-brand-border rounded-2xl p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-black text-brand mb-2">{item.title}</h3>
                <p className="text-xs text-brand-muted font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNINGS CALCULATOR */}
      <section className="py-14 px-4 bg-white border-y border-brand-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-black text-brand mb-2">Earnings Calculator</h2>
          <p className="text-xs text-brand-muted mb-8">Estimate your monthly earnings based on content downloads</p>
          <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
            <label className="text-xs font-bold text-brand-muted uppercase">Monthly Downloads from Your Content</label>
            <p className="text-3xl font-black text-brand my-3">{sliderValue.toLocaleString()} downloads</p>
            <input type="range" min="50" max="10000" step="50" value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full accent-brand mb-6" />
            <div className="bg-white border border-brand-border rounded-xl p-5">
              <p className="text-xs text-brand-muted font-semibold mb-1">Estimated Monthly Earnings</p>
              <p className="text-4xl font-black text-brand">Rs. {estimatedEarnings.toLocaleString()}</p>
              <p className="text-[10px] text-brand-faint mt-2">Based on 30% share of Rs. 0.45/free download + Rs. 7.50/premium download</p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      {step === "apply" && (
        <section className="py-14 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-black text-brand mb-8 text-center">Partner Application</h2>
            <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Creator / Business Name *</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Science with Kasun, Lanka Study Diagrams"
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Contact Email *</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">About You & Your Content *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  placeholder="Tell us about your teaching/design experience, what subjects you cover, and examples of content you create..."
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all resize-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Subject Specialties * (choose all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s} type="button"
                      onClick={() => setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        selectedSubjects.includes(s) ? "bg-brand text-white border-brand" : "bg-[#f3f3f3] text-brand/70 border-brand-border hover:border-brand/40"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-wide">Portfolio / Sample Work URL (optional)</label>
                <input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)}
                  placeholder="Google Drive, Behance, Instagram, website link..."
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand text-xs px-4 py-3 rounded-xl outline-none focus:border-brand transition-all" />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-brand" />
                <span className="text-xs text-brand-muted font-medium">
                  I agree to EduVisuals.lk content guidelines. I will only upload original educational content that is curriculum-aligned and does not infringe copyright.
                </span>
              </label>

              <button onClick={handleApply} disabled={submitting}
                className="w-full py-4 bg-brand text-white font-black text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>Submitting...</> : "Submit Partner Application →"}
              </button>

              {!session && (
                <p className="text-center text-xs text-brand-muted">
                  You'll need to <button onClick={() => useAuthModal.getState().open()} className="font-black text-brand underline">sign in</button> to submit.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SUCCESS */}
      {step === "success" && (
        <section className="py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-brand mb-2">Application Submitted!</h2>
            <p className="text-brand-muted text-sm mb-6">We'll review your application within 48 hours and send an email to <strong>{contactEmail}</strong>.</p>
            <button onClick={() => router.push("/")} className="px-6 py-3 bg-brand text-white font-bold text-sm rounded-xl">
              Back to Home
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
