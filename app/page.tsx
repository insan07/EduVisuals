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
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Building,
  CheckCircle2,
  Globe2,
  BrainCircuit,
  LibraryBig
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const openAuth = useAuthModal((state) => state.open);
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "required") {
      const next = params.get("next");
      setTimeout(() => {
        if (next) {
          useAuthModal.getState().open("signin", undefined, () => {
            window.location.href = next;
          }, next);
        } else {
          useAuthModal.getState().open("signin");
        }
      }, 200);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand font-sans selection:bg-brand selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 px-4 overflow-hidden flex flex-col items-center text-center min-h-[90vh] justify-center">
        {/* Background Image & Dynamic Overlays */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroBg} 
            alt="Educational Visuals Background" 
            fill 
            priority 
            className="object-cover object-center scale-105" 
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#073238]/90 via-[#073238]/70 to-[#073238]/95" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent opacity-60 mix-blend-screen" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-60 mix-blend-screen" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 text-xs font-black uppercase tracking-widest text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>The Premier Educational Visual Library</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-2xl text-white">
            Master Complex Concepts with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
              Visual Learning
            </span>
          </h1>

          <p className="text-base md:text-xl text-white/80 max-w-2xl mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 drop-shadow-md">
            Access world-class diagrams, mind maps, and illustrations engineered for all major international syllabuses. Accelerate your memory retention today.
          </p>

          {/* Hero Search - Glassmorphism Wrapper */}
          <div className="w-full max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-black/40 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10 shadow-2xl">
              <SearchBar darkHero={true} />
            </div>
          </div>

          {/* CTAs & Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
            <Link
              href="/visuals"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-brand bg-white hover:bg-gray-100 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 group"
            >
              Explore Library
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!user && (
              <button
                onClick={() => openAuth("signup", "Join Learnpik for Free", () => router.push("/visuals"))}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all shadow-sm active:scale-95 hover:border-white/40"
              >
                Create Free Account
              </button>
            )}
          </div>
          
          <div className="mt-12 flex items-center gap-6 text-xs font-bold text-white/60 animate-in fade-in duration-1000 delay-700">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Forever Core</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Curriculum Aligned</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> High-Resolution</div>
          </div>

        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-white border-b border-brand/5 py-8 relative z-20 -mt-6 mx-4 md:mx-12 rounded-3xl shadow-xl flex flex-col md:flex-row justify-around items-center gap-8 px-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
            <LibraryBig className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand">10,000+</span>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Educational Visuals</span>
          </div>
        </div>
        <div className="hidden md:block w-px h-12 bg-brand/10" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Globe2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand">15+</span>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">International Syllabuses</span>
          </div>
        </div>
        <div className="hidden md:block w-px h-12 bg-brand/10" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand">60,000x</span>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Faster Processing</span>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID: WHY LEARNPIK */}
      <section className="py-24 px-4 bg-brand-surface relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute top-40 right-[-10%] w-96 h-96 bg-teal-400/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-brand mb-6 tracking-tight">The ultimate learning edge.</h2>
            <p className="text-brand-muted font-medium max-w-2xl mx-auto text-lg">
              We engineer scientifically accurate visual aids designed specifically to align with local and international educational standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Bento Box 1: Large */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 border border-brand/5 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500 translate-x-1/4 translate-y-1/4">
                <Zap className="w-96 h-96 text-brand" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-brand mb-4">Learn 60,000x Faster</h3>
                <p className="text-lg text-brand-muted font-medium max-w-md leading-relaxed">
                  The human brain processes visual information significantly faster than text. Cut down your revision time, improve memory retention, and ace your exams with precision diagrams.
                </p>
              </div>
            </div>

            {/* Bento Box 2 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-brand/5 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-brand/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7 text-brand" />
              </div>
              <h3 className="text-2xl font-black text-brand mb-4">Curriculum Aligned</h3>
              <p className="text-base text-brand-muted font-medium leading-relaxed">
                Every visual is precisely categorized by grade and syllabus framework, ensuring you study exactly what you need.
              </p>
            </div>

            {/* Bento Box 3 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-brand/5 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-brand/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-brand" />
              </div>
              <h3 className="text-2xl font-black text-brand mb-4">Community Driven</h3>
              <p className="text-base text-brand-muted font-medium leading-relaxed">
                A collaborative hub where students and elite educators share high-quality visual resources.
              </p>
            </div>

            {/* Bento Box 4: Large */}
            <div className="md:col-span-2 bg-[#073238] rounded-[2rem] p-8 md:p-12 shadow-2xl group relative overflow-hidden text-white">
               <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between h-full">
                 <div>
                   <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                     <Sparkles className="w-8 h-8 text-emerald-300" />
                   </div>
                   <h3 className="text-3xl font-black mb-4">Premium Quality Guaranteed</h3>
                   <p className="text-lg text-white/70 font-medium max-w-md leading-relaxed">
                     Our strict moderation queue ensures every diagram, illustration, and mind map meets rigorous academic standards before publication.
                   </p>
                 </div>
                 <div className="hidden md:flex items-center justify-center p-6 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10">
                    {/* Abstract UI representation of quality */}
                    <div className="flex flex-col gap-3 w-48">
                      <div className="h-4 bg-white/20 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-emerald-400/50 rounded-full w-3/4" />
                      <div className="h-4 bg-white/20 rounded-full w-5/6" />
                      <div className="mt-4 flex items-center justify-center gap-1 bg-emerald-500 text-white text-xs font-bold py-1.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </div>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WHO IS IT FOR */}
      <section className="py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-brand mb-6 tracking-tight">Built for modern education.</h2>
            <p className="text-brand-muted font-medium max-w-2xl mx-auto text-lg">
              Empowering every tier of the educational ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-brand-surface p-10 rounded-[2rem] border border-brand/5 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:bg-brand group-hover:text-white text-brand transition-colors duration-300">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="font-black text-brand text-2xl mb-4">Students</h4>
              <p className="text-base text-brand-muted font-medium leading-relaxed">
                Download high-resolution mind maps and cheat sheets to turbocharge your exam preparations and simplify late-night study sessions.
              </p>
            </div>

            <div className="bg-brand-surface p-10 rounded-[2rem] border border-brand/5 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:bg-brand group-hover:text-white text-brand transition-colors duration-300">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="font-black text-brand text-2xl mb-4">Educators</h4>
              <p className="text-base text-brand-muted font-medium leading-relaxed">
                Enhance your presentations, handouts, and smart-board lessons with professional educational assets that keep students engaged.
              </p>
            </div>

            <div className="bg-brand-surface p-10 rounded-[2rem] border border-brand/5 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:bg-brand group-hover:text-white text-brand transition-colors duration-300">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="font-black text-brand text-2xl mb-4">Institutions</h4>
              <p className="text-base text-brand-muted font-medium leading-relaxed">
                Provide premium visual libraries to your entire student base with our upcoming volume licensing and integration options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING TEASER (Hidden as requested) */}
      <section className="hidden py-24 px-4 bg-white border-y border-brand-border text-center relative overflow-hidden">
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

      {/* 6. FOOTER CTA */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#073238] to-[#041a1d] text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-xs font-bold text-white/80">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Start your journey
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight leading-tight">
            Ready to elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">learning?</span>
          </h2>
          <p className="text-white/70 font-medium mb-12 text-lg md:text-xl max-w-xl leading-relaxed">
            Join thousands of global students using Learnpik to study smarter, not harder.
          </p>
          <Link
            href="/visuals"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white text-[#073238] font-black hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 group text-lg"
          >
            Start Exploring Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
