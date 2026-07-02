"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, Upload, Settings, LogOut, ArrowLeft, Menu, X } from "lucide-react";

export default function UploaderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/uploader/dashboard", icon: LayoutDashboard },
    { name: "Upload Visual", href: "/uploader/upload", icon: Upload },
    { name: "My Uploads", href: "/uploader/my-uploads", icon: ImageIcon },
    { name: "Settings", href: "/uploader/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-brand-border px-4 py-3 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-7 h-7">
            <div
              style={{
                backgroundColor: "#073238",
                maskImage: "url('/logo.png?v=2')",
                WebkitMaskImage: "url('/logo.png?v=2')",
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
          <span className="font-black text-brand text-lg tracking-tight">Learnpik</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-brand hover:bg-[#f3f3f3] rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-64 bg-white border-r border-brand-border flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex-1 flex flex-col">
          
          <Link href="/" className="flex items-center gap-2 group mb-8">
            <div className="relative flex items-center justify-center w-8 h-8 transition-transform duration-300 group-hover:scale-110">
              <div
                style={{
                  backgroundColor: "#073238",
                  maskImage: "url('/logo.png?v=2')",
                  WebkitMaskImage: "url('/logo.png?v=2')",
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
            <span className="text-brand font-black text-xl tracking-tight leading-none">
              Learn<span className="text-brand group-hover:text-brand transition-colors">pik</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-sm">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand leading-none">Uploader</h2>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Portal</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 flex-1 mt-4 md:mt-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "text-brand-muted hover:bg-[#f3f3f3] hover:text-brand"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-brand-border flex flex-col gap-2">
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-brand hover:bg-brand/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Learnpik
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
