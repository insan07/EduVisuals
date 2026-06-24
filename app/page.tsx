"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import heroBg from "../public/hero_bg.png";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/store/useAuthModal";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar";
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building 
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const openAuth = useAuthModal((state) => state.open);
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "required") {
      setTimeout(() => useAuthModal.getState().open(), 200);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand font-sans selection:bg-brand selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-24 md:pt-40 md:pb-36 px-4 overflow-hidden flex flex-col items-center text-center">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0">
          <Image src={heroBg} alt="Educational Visuals Background" fill priority className="object-cover object-center scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        
        {/* Content */}
        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 text-xs font-bold text-white shadow-sm animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>The best educational visuals for Sri Lankan students</span>
        </div>

        <h1 className="relative text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mb-6 leading-[1.1] animate-fade-in-up" style={{ color: "#ccfbf1", textShadow: "0 2px 10px rgba(0,0,0,0.5)", animationDelay: '100ms' }}>
          Master Your Studies with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-200">Visual Learning</span>
        </h1>
        
        <p className="relative text-sm md:text-lg text-white/90 max-w-2xl mb-10 font-medium leading-relaxed animate-fade-in-up drop-shadow-md" style={{ animationDelay: '200ms' }}>
          Access high-quality diagrams, mind maps, and illustrations tailored for O/L, A/L, and University syllabuses. Simplify complex concepts and boost your memory retention today.
        </p>

        {/* Hero Search */}
        <div className="relative w-full max-w-2xl mb-10 animate-fade-in-up shadow-2xl rounded-2xl group z-20" style={{ animationDelay: '300ms' }}>
          <SearchBar darkHero={true} placeholder="Search for Biology, Chemistry, O/L Mind Maps..." />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Link
            href="/visuals"
            style={{ backgroundColor: "#ffffff", color: "#073238" }}
            className="w-full sm:w-auto px-8 py-4 rounded-md font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg"
          >
            Explore Visuals
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          {!user && (
            <button
              onClick={() => openAuth("Unlock Full Access", () => router.push("/visuals"))}
              className="w-full sm:w-auto px-8 py-4 rounded-md bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all shadow-sm active:scale-95"
            >
              Sign Up Free
            </button>
          )}
        </div>
      </section>

      {/* 2. WHY EDUVISUALS */}
      <section className="py-20 px-4 bg-white border-y border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand mb-4">Why choose EduVisuals?</h2>
            <p className="text-brand-muted font-medium max-w-2xl mx-auto">
              We focus on delivering high-quality, scientifically accurate visuals designed specifically to align with local educational standards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-border transition-colors group">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-brand mb-3">Learn Faster</h3>
              <p className="text-sm text-brand-muted leading-relaxed font-medium">
                Visual representations help your brain process complex information 60,000 times faster than text alone. Cut down your revision time.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-border transition-colors group">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-brand mb-3">Curriculum Aligned</h3>
              <p className="text-sm text-brand-muted leading-relaxed font-medium">
                Every visual is categorized by grade and syllabus (O/L, A/L, Cambridge, etc.) ensuring you study exactly what you need for exams.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-border transition-colors group">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-brand mb-3">Community Driven</h3>
              <p className="text-sm text-brand-muted leading-relaxed font-medium">
                Visuals are uploaded, reviewed, and curated by top educators and subject matter experts to guarantee accuracy and quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO IS IT FOR */}
      <section className="py-20 px-4 bg-brand-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand mb-4">Built for Everyone</h2>
            <p className="text-brand-muted font-medium max-w-2xl mx-auto">
              Whether you are preparing for exams or teaching a classroom, EduVisuals provides the assets you need.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
            <div className="flex-1 bg-white p-6 rounded-2xl border border-brand-border flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-[#f3f3f3] rounded-lg text-brand">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand text-lg mb-1">Students</h4>
                <p className="text-xs text-brand-muted font-medium leading-relaxed">
                  Download high-resolution mind maps and cheat sheets to turbocharge your exam preparations.
                </p>
              </div>
            </div>

            <div className="flex-1 bg-white p-6 rounded-2xl border border-brand-border flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-[#f3f3f3] rounded-lg text-brand">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand text-lg mb-1">Teachers & Tutors</h4>
                <p className="text-xs text-brand-muted font-medium leading-relaxed">
                  Enhance your presentations, handouts, and smart-board lessons with professional educational assets.
                </p>
              </div>
            </div>

            <div className="flex-1 bg-white p-6 rounded-2xl border border-brand-border flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-[#f3f3f3] rounded-lg text-brand">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand text-lg mb-1">Institutions</h4>
                <p className="text-xs text-brand-muted font-medium leading-relaxed">
                  Provide premium visual libraries to your entire student base with our volume licensing options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING TEASER */}
      <section className="py-24 px-4 bg-white border-y border-brand-border text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block px-3 py-1 rounded bg-[#f3f3f3] text-brand font-black text-[10px] uppercase tracking-wider mb-4 border border-brand-border">
            Transparent Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand mb-6">
            Free forever. Premium when you need it.
          </h2>
          <p className="text-sm md:text-base text-brand-muted font-medium mb-8 leading-relaxed">
            Thousands of standard curriculum visuals are completely free. For advanced university-level diagrams and exclusive high-res bundles, unlock Premium for a flat, affordable rate.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-brand hover:text-brand uppercase tracking-wide hover:underline underline-offset-4 transition-all"
          >
            View Pricing Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="py-20 px-4 bg-brand text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white drop-shadow-sm">Ready to elevate your learning?</h2>
          <p className="text-white/80 font-medium mb-10 text-sm md:text-base">
            Join thousands of Sri Lankan students using EduVisuals to study smarter, not harder.
          </p>
          <Link
            href="/visuals"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-white text-brand font-black hover:bg-[#f3f3f3] transition-all shadow-lg hover:shadow-xl active:scale-95 group"
          >
            Start Exploring Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
