import React from "react";
import Link from "next/link";
import { Crown } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-brand-border py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Left Section: Logo, Tagline & Flag */}
        <div className="flex flex-col gap-3 max-w-sm">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 transition-transform duration-300 group-hover:scale-110 translate-y-1">
              <div 
                style={{
                  backgroundColor: "#073238",
                  maskImage: "url('/logo.png')",
                  WebkitMaskImage: "url('/logo.png')",
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
            <span className="text-brand font-bold text-xl md:text-2xl tracking-tight">
              Edu<span className="text-brand group-hover:text-brand transition-colors">Visuals</span>
            </span>
          </Link>
          <p className="text-[rgba(0,57,60,0.7)] text-sm font-normal leading-relaxed">
            Sri Lanka&apos;s Educational Visual Library. High-quality, curriculum-aligned visuals for premium educational experiences.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[rgba(0,57,60,0.7)] mt-1 font-semibold">
            <span>Made in Sri Lanka</span>
            <span role="img" aria-label="Sri Lanka Flag">🇱🇰</span>
          </div>
        </div>

        {/* Right Section: Links */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold">
          <Link
            href="/about"
            className="text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors duration-300"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors duration-300"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors duration-300"
          >
            Terms of Service
          </Link>
        </div>

      </div>

      {/* Bottom Copyright bar */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[rgba(0,57,60,0.45)]">
        <p>&copy; {currentYear} EduVisuals. All rights reserved.</p>
        <p>Premium Education Visuals Platform</p>
      </div>
    </footer>
  );
}
