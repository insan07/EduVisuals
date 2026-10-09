"use client";

import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";

export default function LiquidHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, lightX: 50, lightY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-12 deg to +12 deg)
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    // Calculate light reflection percentages
    const lightX = (x / rect.width) * 100;
    const lightY = (y / rect.height) * 100;

    setTransform({ rotateX, rotateY, lightX, lightY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({ rotateX: 0, rotateY: 0, lightX: 50, lightY: 50 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-sm sm:max-w-md lg:max-w-[460px] aspect-square flex items-center justify-center perspective-[1200px] select-none cursor-pointer group py-2"
    >
      {/* 1. Ambient Caustic Liquid Radial Glow */}
      <div 
        className="absolute inset-2 rounded-full bg-gradient-to-tr from-emerald-400/35 via-teal-400/30 to-cyan-400/35 blur-[70px] pointer-events-none animate-liquid-pulse transition-all duration-700"
        style={{
          transform: isHovered 
            ? `scale(1.15) translate3d(${transform.rotateY * 1.5}px, ${-transform.rotateX * 1.5}px, 0)`
            : 'scale(1)',
        }}
      />

      {/* 2. Embedded 3D Liquid Emblem (No Outer Box Card Frame) */}
      <div
        className="relative w-full h-full animate-liquid-float flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
        }}
      >
        {/* Dynamic Specular Light Reflection Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 opacity-50 group-hover:opacity-85 rounded-3xl"
          style={{
            background: `radial-gradient(circle at ${transform.lightX}% ${transform.lightY}%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 45%, transparent 75%)`,
          }}
        />

        {/* Seamless 3D Liquid Emblem Image (Embedded directly into the page) */}
        <div className="relative w-full h-full z-20 filter drop-shadow-[0_20px_40px_rgba(7,50,56,0.25)]">
          <Image
            src="/hero_3d_liquid_clean.png"
            alt="Learnpik 3D Liquid Visual Emblem"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 460px"
            className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Shimmer Wave Effect */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-3xl">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-liquid-shimmer opacity-40" />
        </div>
      </div>
    </div>
  );
}
