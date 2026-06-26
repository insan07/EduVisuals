"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Crown,
  Search,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Home as HomeIcon,
  Download as DownloadIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Upload as UploadIcon,
  LogOut as LogOutIcon,
  ChevronDown,
  Mail,
  Info,
  HelpCircle,
  Users,
  LayoutDashboard as LayoutDashboardIcon,
  User as UserIcon
} from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface NavUser {
  email: string;
  role: string;
  tier: string;
  name: string;
  avatar: string | null;
  displayRole: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    const handleCloseAll = () => {
      setShowProfileDropdown(false);
      setShowResourcesDropdown(false);
      setShowLanguageDropdown(false);
    };
    window.addEventListener("click", handleCloseAll);
    return () => window.removeEventListener("click", handleCloseAll);
  }, []);

  async function loadUserProfile(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, subscription_status, full_name, avatar_url")
      .eq("id", userId)
      .single();

    const roleLabels: Record<string, string> = {
      admin: "Admin",
      moderator: "Moderator", 
      team_creator: "Creator",
      premium_user: "Premium",
      free_user: "Student",
    };

    setUser({
      email: "", // not needed in nav
      role: profile?.role || "free_user",
      tier: profile?.subscription_status === "premium" ? "Premium" : "Free",
      name: profile?.full_name || "User",
      avatar: profile?.avatar_url || null,
      displayRole: roleLabels[profile?.role || "free_user"] || "Student",
    });
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          document.cookie = `sb-access-token=${session?.access_token}; path=/; max-age=604800; samesite=lax`;
        } else if (event === 'SIGNED_OUT') {
          document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("edu_user"); // cleanup legacy
    setUser(null);
    window.dispatchEvent(new Event("auth-changed")); // notify other components
    router.push("/");
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Disable body scroll when menu is open
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm"
            : "bg-white border-b border-brand-border"
        } ${isDashboard ? "hidden md:block" : ""}`}
      >
        {/* Height: 64px desktop (h-16), 56px mobile (h-14) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group z-50">
              <div className="relative flex items-center justify-center w-9 h-9 transition-transform duration-300 group-hover:scale-110 translate-y-1.5">
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

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 ml-8 text-sm font-bold text-brand select-none whitespace-nowrap">
              <Link href="/" className="hover:text-brand transition-colors">Home</Link>
              <Link href="/visuals" className="hover:text-brand transition-colors">Visuals</Link>
              
              {/* Company Dropdown Trigger */}
              <div 
                className="relative py-2"
                onMouseEnter={() => setShowResourcesDropdown(true)}
                onMouseLeave={() => setShowResourcesDropdown(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowResourcesDropdown(!showResourcesDropdown);
                  }}
                  className="flex items-center gap-0.5 hover:text-brand transition-colors focus:outline-none cursor-pointer"
                >
                  Company
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showResourcesDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Company Dropdown Card */}
                {showResourcesDropdown && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white border border-brand-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-sm font-semibold text-brand">
                    <Link
                      href="/contact"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-muted" />
                      Contact Us
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-brand-muted" />
                      About Us
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-brand-muted" />
                      Get Help
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/pricing" className="hover:text-brand transition-colors">Pricing</Link>
              <Link href="/partner" className="text-sm font-bold text-brand-muted hover:text-brand transition-colors flex items-center gap-1 ml-2">
                <StarIcon className="w-4 h-4" /> Become a Partner
              </Link>
            </div>
          </div>



          {/* Right: Actions */}
          <div className="flex items-center gap-3">




            {/* User Profile (Mobile + Desktop) or Login/Signup (Desktop) */}
            {user ? (
              <div className={`relative flex items-center gap-3 ${isOpen ? 'hidden md:flex' : ''}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="flex items-center gap-2 md:px-3 px-1.5 md:py-1.5 py-1.5 bg-[#f3f3f3] hover:bg-[#e8ecec] rounded-full border border-brand-border cursor-pointer transition-all duration-200 select-none"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 md:w-6 md:h-6 rounded-full object-cover shadow-sm" />
                  ) : (
                    <span className="w-7 h-7 md:w-6 md:h-6 rounded-full bg-purple text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden md:block text-xs font-bold text-brand max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                  {/* Dropdown Menu / Mobile Bottom Sheet */}
                  {showProfileDropdown && (
                    <>
                      {/* --- PROFILE DROPDOWN (ALL DEVICES) --- */}
                      <div className="absolute top-[calc(100%+12px)] -right-[48px] sm:-right-2 md:-right-2 w-64 bg-white border border-brand-border rounded-2xl shadow-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-semibold text-brand">
                        <div className="px-4 py-2.5 border-b border-brand-border flex flex-col select-none">
                          <span className="font-black truncate">{user.name}</span>
                          <span className="text-[9px] uppercase tracking-wide text-[rgba(0,57,60,0.5)] font-bold mt-0.5">{user.displayRole} · {user.tier} Tier</span>
                        </div>
                        
                        <div className="py-1">
                          {[
                            { label: "Overview Dashboard", tab: "overview", icon: HomeIcon },
                            { label: "My Downloads", tab: "downloads", icon: DownloadIcon },
                            { label: "Saved Collections", tab: "collections", icon: HeartIcon },
                            { label: "Subscription Billing", tab: "subscription", icon: StarIcon },
                            { label: "Account Settings", tab: "settings", icon: SettingsIcon },
                          ].map((item) => (
                            <Link
                              key={item.tab}
                              href={`/dashboard?tab=${item.tab}`}
                              onClick={() => {
                                setShowProfileDropdown(false);
                                setTimeout(() => {
                                  window.dispatchEvent(new Event("dashboard-tab-changed"));
                                }, 50);
                              }}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                            >
                              <item.icon className="w-3.5 h-3.5 text-brand-muted" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        {/* Creator or Admin actions */}
                        {(user.role === "admin" || user.role === "moderator" || user.role === "team_creator") && (
                          <div className="border-t border-brand-border py-1">
                            {(user.role === "admin" || user.role === "moderator") && (
                              <Link
                                href="/admin"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                              >
                                <ShieldIcon className="w-3.5 h-3.5 text-brand-muted" />
                                Admin Panel
                              </Link>
                            )}
                            <Link
                              href="/upload"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                            >
                              <UploadIcon className="w-3.5 h-3.5 text-brand-muted" />
                              Upload Portal
                            </Link>
                          </div>
                        )}

                        <div className="border-t border-brand-border pt-1">
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              handleSignOut();
                            }}
                            className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors font-bold cursor-pointer"
                          >
                            <LogOutIcon className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => useAuthModal.getState().open()}
                    className="px-5 py-2 text-brand border border-brand-border hover:bg-[#f3f3f3] text-sm font-bold rounded-md transition-all duration-300 cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => useAuthModal.getState().open()}
                    className="px-5 py-2 bg-brand hover:bg-brand text-white text-sm font-black rounded-md transition-all duration-300 shadow-sm hover:scale-[1.02] cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-[rgba(0,57,60,0.7)] hover:text-brand hover:bg-[#f3f3f3] rounded-full transition-all duration-300 z-50 relative"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6 text-brand" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>


      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-brand-surface z-40 flex flex-col justify-between pt-24 pb-8 px-6 md:hidden animate-in fade-in duration-300 overflow-y-auto">
          <div className="flex flex-col gap-6">

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-4 mt-2">
              <Link
                href="/"
                onClick={toggleMenu}
                className="text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors"
              >
                Home
              </Link>
              <Link
                href="/visuals"
                onClick={toggleMenu}
                className="text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors"
              >
                Visuals
              </Link>

              {/* Mobile Company Accordion */}
              <div className="flex flex-col">
                <button
                  onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                  className="flex items-center justify-between text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors w-full text-left focus:outline-none py-1"
                >
                  <span>Company</span>
                  <ChevronDown className={`w-4 h-4 text-[rgba(0,57,60,0.5)] transition-transform duration-200 ${mobileResourcesOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileResourcesOpen && (
                  <div className="flex flex-col gap-3 pl-4 mt-3 border-l border-brand-border animate-in slide-in-from-top-2 duration-200">
                    <Link
                      href="/contact"
                      onClick={toggleMenu}
                      className="flex items-center gap-2.5 text-sm font-bold text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors py-0.5"
                    >
                      <Mail className="w-4 h-4 text-[rgba(0,57,60,0.5)]" />
                      Contact Us
                    </Link>
                    <Link
                      href="/about"
                      onClick={toggleMenu}
                      className="flex items-center gap-2.5 text-sm font-bold text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors py-0.5"
                    >
                      <Info className="w-4 h-4 text-[rgba(0,57,60,0.5)]" />
                      About Us
                    </Link>
                    <Link 
                      href="/help" 
                      onClick={toggleMenu}
                      className="flex items-center gap-2.5 text-sm font-bold text-[rgba(0,57,60,0.7)] hover:text-brand transition-colors py-0.5"
                    >
                      <HelpCircle className="w-4 h-4 text-[rgba(0,57,60,0.5)]" />
                      Get Help
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                onClick={toggleMenu}
                className="text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/partner"
                onClick={toggleMenu}
                className="flex items-center gap-1.5 text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors"
              >
                <StarIcon className="w-4.5 h-4.5" /> Become a Partner
              </Link>
            </nav>


          </div>

          {/* User Section at the bottom */}
          {!user && (
            <div className="flex flex-col gap-3 mt-8 border-t border-brand-border/30 pt-6">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    toggleMenu();
                    useAuthModal.getState().open();
                  }}
                  className="w-full py-3.5 text-center border border-brand-border text-brand hover:bg-[#f3f3f3] rounded-md font-bold transition-all text-sm cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    toggleMenu();
                    useAuthModal.getState().open();
                  }}
                  className="w-full py-3.5 text-center bg-brand text-white hover:bg-brand rounded-md font-black transition-all text-sm shadow-md cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      )}      {/* Mobile Dashboard Header (Back Button) */}
      {isDashboard && (
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-brand-border flex items-center px-4 z-50 shadow-sm">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-brand font-bold hover:bg-[#f3f3f3] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </header>
      )}
    </>
  );
}
