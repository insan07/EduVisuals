"use client";

import React from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname.startsWith("/uploader")) {
    return null;
  }

  return (
    <footer className="bg-brand text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        {/* Left Section: Logo, Tagline & Flag */}
        <div className="flex flex-col gap-3 max-w-sm">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-7 h-7 transition-transform duration-300 group-hover:scale-110 translate-y-0.9">
              <div
                style={{
                  backgroundColor: "#ffffff",
                  maskImage: "url('/logo.png?v=3')",
                  WebkitMaskImage: "url('/logo.png?v=3')",
                  maskSize: "100%",
                  WebkitMaskSize: "100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <span className="text-white font-bold text-xl md:text-2xl tracking-tight">
              Learn<span className="text-white group-hover:text-emerald-300 transition-colors">pik</span>
            </span>
          </Link>
          <p className="text-white/70 text-sm font-normal leading-relaxed">
            The Premier Educational Visual Library. High-quality, curriculum-aligned visuals for premium educational experiences.
          </p>
        </div>

        {/* Right Section: Links */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold">
          <Link
            href="/about"
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            Terms of Service
          </Link>
        </div>

      </div>

      {/* Bottom Copyright bar */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
        <p>&copy; {currentYear} Learnpik.com. All rights reserved.</p>
        <p>Premium Education Visuals Platform</p>
      </div>
    </footer>
  );
}
