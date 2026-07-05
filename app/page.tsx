"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/store/useAuthModal";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar";
import {
  ArrowRight,
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
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand font-sans">

      {/* 1. HERO SECTION (Split Layout) */}
      <section className="relative pt-18 pb-4 lg:pb-12 px-4 lg:px-12 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center min-h-0 lg:min-h-[85vh] overflow-hidden lg:overflow-visible">

        {/* Left Side: Content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left relative z-20 lg:pr-8 lg:pl-10 w-full">
          
          <h1 className="text-5xl md:text-6xl lg:text-[3.25rem] font-black tracking-tight mb-6 md:mb-8 leading-[1.15] lg:leading-[1.05] text-[#111827] w-full">
            <span className="block lg:inline">Learn visually <br className="hidden md:block" /></span>
            <span className="block lg:inline lg:whitespace-nowrap mt-2 lg:mt-0">
              with <br className="block md:hidden" />
              <span className="inline-block mt-2 lg:mt-0 text-brand"><ChangingText /></span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-lg mb-8 lg:mb-10 font-medium leading-relaxed mx-auto lg:mx-0">
            Access world-class diagrams, worksheets, mind maps, and illustrations engineered for all major international syllabuses. Accelerate your memory retention today.
          </p>

          {/* Premium Search Bar */}
          <div className="w-full max-w-xl mb-8 lg:mb-6 bg-white p-2 rounded-full border border-gray-200 shadow-md flex items-center transition-all hover:shadow-lg mx-auto lg:mx-0">
            <div className="flex-1 w-full">
              <SearchBar darkHero={false} />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
            <Link
              href="/visuals"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#0f172a] hover:bg-black transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <Zap className="w-5 h-5 fill-white text-white" />
              Start Exploring Now
            </Link>
          </div>
        </div>

        {/* Right Side: Shuffled Image Grid (3 Images) */}
        <div className="relative hidden lg:flex w-full h-[300px] sm:h-[400px] lg:h-[500px] items-center justify-center z-10 scale-95 lg:scale-90 mt-4 lg:mt-0">
          {/* Main Mindmap */}
          <div className="absolute top-[5%] right-[15%] w-[50%] h-[50%] rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white rotate-6 hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 z-50">
            <Image src="/mindmap.png" alt="Educational Mindmap" fill className="object-cover" priority />
          </div>
          {/* Kids Worksheet */}
          <div className="absolute bottom-[5%] left-[5%] w-[55%] h-[60%] rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white -rotate-6 hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 z-40">
            <Image src="/kids.png" alt="Kids Worksheet" fill className="object-cover" />
          </div>
          {/* Cheatsheet */}
          <div className="absolute top-[30%] right-[-5%] w-[45%] h-[45%] rounded-3xl overflow-hidden shadow-xl border-[6px] border-white rotate-12 hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 z-30">
             <Image src="/cheatsheet.png" alt="Physics Cheat Sheet" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* POPULAR COLLECTIONS */}
      <section className="py-6 lg:py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-12">
            <h2 className="text-xl md:text-2xl font-black text-brand mb-3 tracking-tight">Explore Popular Collections</h2>
            <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base">
              Discover our most downloaded premium resource packs, curated specifically for top-performing students and educators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, title: "Biology Mind Maps", count: "1,240 Visuals", image: "/mindmap.png", link: "/visuals?q=biology" },
              { id: 2, title: "Kids Worksheets", count: "850 Visuals", image: "/kids.png", link: "/visuals?q=kids" },
              { id: 3, title: "Physics Cheat Sheets", count: "420 Visuals", image: "/cheatsheet.png", link: "/visuals?q=physics" },
              { id: 4, title: "Astronomy Illustrations", count: "315 Visuals", image: "/illustration.png", link: "/visuals?q=astronomy" },
              { id: 5, title: "Medical & Anatomy", count: "930 Visuals", image: "/diagram.png", link: "/visuals?q=anatomy" },
              { id: 6, title: "Revision Flashcards", count: "1,500 Visuals", image: "/flashcard.png", link: "/visuals?q=flashcard" },
            ].map(col => (
              <Link href={col.link} key={col.id} className="group flex flex-col w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 bg-white">
                <div className="relative h-48 w-full overflow-hidden border-b border-gray-100">
                  <Image src={col.image} alt={col.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <div className="p-5 flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{col.count}</span>
                  <h3 className="text-base font-bold text-brand tracking-tight">{col.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
             <Link href="/visuals" className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-brand font-bold bg-white hover:bg-gray-50 transition-colors text-sm shadow-sm">
                Explore More Collections <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-white border-y border-brand-border py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-brand-border">

          <div className="flex flex-col items-center text-center px-8 w-full">
            <LibraryBig className="w-8 h-8 text-brand mb-3" />
            <span className="text-3xl font-black text-brand mb-1">10,000+</span>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Educational Visuals</span>
          </div>

          <div className="flex flex-col items-center text-center px-8 pt-8 md:pt-0 w-full">
            <Globe2 className="w-8 h-8 text-brand mb-3" />
            <span className="text-3xl font-black text-brand mb-1">15+</span>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">International Syllabuses</span>
          </div>

          <div className="flex flex-col items-center text-center px-8 pt-8 md:pt-0 w-full">
            <BrainCircuit className="w-8 h-8 text-brand mb-3" />
            <span className="text-3xl font-black text-brand mb-1">60,000x</span>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Faster Processing</span>
          </div>

        </div>
      </section>

      {/* 3. WHY LEARNPIK (Features) */}
      <section className="py-24 px-4 bg-brand-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand mb-4 tracking-tight">The ultimate learning edge.</h2>
            <p className="text-brand-muted font-medium max-w-2xl mx-auto text-lg">
              Scientifically accurate visual aids designed specifically to align with local and international educational standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-brand-border flex flex-col">
              <Zap className="w-8 h-8 text-brand mb-6" />
              <h3 className="text-xl font-bold text-brand mb-3">Learn 60,000x Faster</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                The human brain processes visual information significantly faster than text. Cut down revision time and improve memory retention with precision diagrams.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-brand-border flex flex-col">
              <ShieldCheck className="w-8 h-8 text-brand mb-6" />
              <h3 className="text-xl font-bold text-brand mb-3">Curriculum Aligned</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Every visual is precisely categorized by grade and syllabus framework, ensuring you study exactly what you need.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-brand-border flex flex-col">
              <Users className="w-8 h-8 text-brand mb-6" />
              <h3 className="text-xl font-bold text-brand mb-3">Community Driven</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                A collaborative hub where students and elite educators share high-quality visual resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHO IS IT FOR */}
      <section className="py-24 px-4 bg-white border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand mb-4 tracking-tight">Built for modern education.</h2>
            <p className="text-brand-muted font-medium max-w-2xl mx-auto text-lg">
              Empowering every tier of the educational ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mb-6 text-brand">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-brand text-xl mb-3">Students</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Download high-resolution mind maps and cheat sheets to turbocharge your exam preparations.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mb-6 text-brand">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-brand text-xl mb-3">Educators</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Enhance presentations and handouts with professional assets that keep students engaged.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mb-6 text-brand">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-brand text-xl mb-3">Institutions</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Provide premium visual libraries to your entire student base with volume licensing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="py-24 px-4 bg-brand text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">
            Ready to elevate your learning?
          </h2>
          <p className="text-brand-surface/80 font-medium mb-10 text-lg max-w-xl leading-relaxed">
            Join thousands of global students using Learnpik to study smarter, not harder.
          </p>
          <Link
            href="/visuals"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-brand font-bold hover:bg-gray-100 transition-colors"
          >
            Start Exploring Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

const changingWords = ["Mind Maps", "Cheat Sheets", "Worksheets", "Diagrams"];

function ChangingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % changingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-teal-500">
      {changingWords[index]}
    </span>
  );
}
