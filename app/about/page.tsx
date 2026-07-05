import React from "react";
import { Sparkles, Globe, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Learnpik",
  description: "Learn about Learnpik's mission to transform education through high-fidelity visual assets.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="max-w-4xl mx-auto text-left mb-20 mt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand tracking-tight leading-none mb-6">
          Elevating Educational Visuals
        </h1>
        <p className="text-lg md:text-xl text-brand-faint max-w-2xl font-medium leading-relaxed">
          We believe that complex concepts deserve clear, high-fidelity representations. Learnpik was built to bridge the gap between educators and premium visual assets.
        </p>
      </div>

      {/* 2. THE STORY */}
      <div className="max-w-4xl mx-auto mb-24">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">Visual learning shouldn't be constrained by resources.</h2>
        <div className="prose prose-lg text-brand-faint">
          <p className="mb-4 font-medium">
            Founded with a passion for accessible education, Learnpik provides educators, students, and institutions with a curated library of educational graphics, diagrams, and illustrations designed to make learning intuitive.
          </p>
          <p className="font-medium">
            Whether you are a teacher preparing a complex biology presentation, a student crafting a visual report, or an institution standardizing educational materials, our platform equips you with the visual tools necessary to communicate ideas effectively and professionally.
          </p>
        </div>
      </div>

      {/* 3. OUR STANDARDS (VALUES GRID) */}
      <div className="max-w-4xl mx-auto border-t border-brand-border pt-16">
        <h2 className="text-2xl font-extrabold mb-10">Our Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="flex flex-col items-start text-left">
            <h3 className="text-lg font-extrabold mb-3">Uncompromising Quality</h3>
            <p className="text-sm text-brand-faint font-medium leading-relaxed">
              Every visual on our platform undergoes rigorous review for accuracy, clarity, and aesthetic consistency. We only host premium, production-ready assets.
            </p>
          </div>

          <div className="flex flex-col items-start text-left">
            <h3 className="text-lg font-extrabold mb-3">Accessible Education</h3>
            <p className="text-sm text-brand-faint font-medium leading-relaxed">
              We structure our pricing and platform features to support educators globally, ensuring premium learning resources aren't locked behind prohibitive enterprise barriers.
            </p>
          </div>

          <div className="flex flex-col items-start text-left">
            <h3 className="text-lg font-extrabold mb-3">Creator Empowerment</h3>
            <p className="text-sm text-brand-faint font-medium leading-relaxed">
              We champion talented designers and educational content creators by providing a dedicated marketplace that accurately values and rewards their expertise.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
