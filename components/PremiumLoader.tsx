import React from "react";

interface PremiumLoaderProps {
  className?: string;
}

export function PremiumLoader({ className = "" }: PremiumLoaderProps) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-1 ${className}`}>
      <div 
        className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" 
        style={{ animationDelay: '0ms', animationDuration: '1s' }} 
      />
      <div 
        className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" 
        style={{ animationDelay: '150ms', animationDuration: '1s' }} 
      />
      <div 
        className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" 
        style={{ animationDelay: '300ms', animationDuration: '1s' }} 
      />
    </div>
  );
}
