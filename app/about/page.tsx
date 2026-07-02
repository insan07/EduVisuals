"use client";

import React from "react";
import Link from "next/link";
import { Crown, Sparkles, BookOpen, GraduationCap, Users, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        
        {/* 1. HEADER HERO */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-border mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-black uppercase text-brand tracking-wider">
              Our Vision & Mission
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand tracking-tight leading-none mb-3">
            About LearnPik
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-muted max-w-xl mx-auto font-medium">
            Empowering Global students and educators with high-fidelity, local curriculum-aligned visual study aids.
          </p>
        </div>

        {/* 2. THE PROBLEM & SOLUTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 text-red-500">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-brand mb-3">
                The Learning Challenge
              </h3>
              <p className="text-xs text-[rgba(0,57,60,0.7)] leading-relaxed font-medium">
                Traditional textbooks are often dense, text-heavy, and difficult to digest during high-stakes exam preparations. Research shows that the human brain processes visual information 60,000 times faster than text, yet high-quality, syllabus-aligned educational diagrams are incredibly hard to find in the World.
              </p>
            </div>
          </div>

          <div className="bg-white border border-brand rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-md relative ring-1 ring-[rgba(7,50,56,0.05)]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand/5 border border-[rgba(7,50,56,0.15)] flex items-center justify-center mb-5 text-brand">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-brand mb-3 flex items-center gap-1">
                Our Visual Solution <Sparkles className="w-4 h-4 text-brand" />
              </h3>
              <p className="text-xs text-[rgba(0,57,60,0.7)] leading-relaxed font-medium">
                LearnPik bridges this gap by offering a curated repository of clean, high-resolution, AI-upscaled educational mind maps, anatomy diagrams, cycle flowcharts, and cheat sheets. Every visual asset is tailored specifically to the National, Cambridge, and Edexcel syllabi, reviewed by educators, and offered in high-resolution vector and HD formats.
              </p>
            </div>
          </div>

        </div>

        {/* 3. CORE VALUES SECTION */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black text-center text-brand mb-8">
            What Drives Us
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center select-none">
            <div className="flex flex-col items-center p-2">
              <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center text-brand mb-3.5 border border-brand-border">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-brand mb-1.5">Syllabus Alignment</h4>
              <p className="text-[10px] text-brand-muted font-semibold leading-relaxed">
                Directly mapping to international and local curriculum frameworks to guarantee visual revision precision.
              </p>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center text-brand mb-3.5 border border-brand-border">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-brand mb-1.5">Editorial Review</h4>
              <p className="text-[10px] text-brand-muted font-semibold leading-relaxed">
                All community uploaded visuals undergo strict moderator review to check for errors.
              </p>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center text-brand mb-3.5 border border-brand-border">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-brand mb-1.5">Open Accessibility</h4>
              <p className="text-[10px] text-brand-muted font-semibold leading-relaxed">
                Ensuring a robust free tier tier remains open forever for underprivileged students.
              </p>
            </div>
          </div>
        </div>

        {/* 4. FOOTER CALL TO ACTION */}
        <div className="text-center bg-gradient-to-tr from-[#002d30] to-[#073238] rounded-3xl p-8 md:p-12 text-white border border-brand shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08)_0%,transparent_50%)] pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-black mb-2">
            Accelerate Your Learning Journey
          </h3>
          <p className="text-xs text-white/80 max-w-xl mx-auto mb-6 leading-relaxed">
            Join thousands of Global students, teachers, and visual creators collaborating to build the country's largest curriculum-aligned graphic learning archive.
          </p>
          <div className="flex flex-wrap justify-center gap-3 font-extrabold text-xs">
            <Link
              href="/visuals"
              className="bg-white text-brand hover:bg-[#f3f3f3] px-6 py-3 rounded-xl transition-all shadow"
            >
              Explore Visuals
            </Link>
            <Link
              href="/pricing"
              className="bg-brand/50 border border-white/20 hover:bg-brand px-6 py-3 rounded-xl transition-all text-white"
            >
              Get Premium
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
