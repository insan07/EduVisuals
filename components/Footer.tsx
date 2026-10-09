"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Mail, ArrowRight, Facebook, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on uploader portal
  if (pathname.startsWith("/uploader")) {
    return null;
  }

  return (
    <footer className="bg-[#031518] text-white pt-20 pb-8 px-4 sm:px-6 lg:px-8 mt-auto relative overflow-hidden border-t border-white/5">
      
      {/* Decorative Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Section: Newsletter & Brand */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 border-b border-white/10 pb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-max">
              <img 
                src="/logo-white.png?v=4" 
                alt="Learnpik" 
                className="h-7 md:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            
            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-sm">
              The premier educational visual library. Empowering global students and educators with high-resolution, curriculum-aligned academic assets.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-black uppercase tracking-wider text-xs mb-2">Platform</h4>
              <Link href="/visuals" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Visual Library</Link>
              <Link href="/pricing" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Pricing</Link>
              <Link href="/search" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Advanced Search</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-black uppercase tracking-wider text-xs mb-2">Creators</h4>
              <Link href="/uploader/onboarding" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Become a Creator</Link>
              <Link href="/uploader" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Creator Portal</Link>
              <Link href="#" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Content Guidelines</Link>
            </div>

            <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
              <h4 className="text-white font-black uppercase tracking-wider text-xs mb-2">Company</h4>
              <Link href="/about" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">About Us</Link>
              <Link href="/contact" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Contact Support</Link>
              <Link href="/privacy" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Privacy Policy</Link>
              <Link href="/terms" className="text-white/60 hover:text-emerald-300 text-sm font-medium transition-colors w-max">Terms of Service</Link>
            </div>
          </div>
        </div>



        {/* Bottom Copyright bar */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-white/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500/50" />
            <p>&copy; {currentYear} Learnpik.com. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <span>Made with precision for global education.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
