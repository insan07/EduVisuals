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

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setMobileSearchOpen(false); // Close mobile search when scrolling down
        setShowProfileDropdown(false);
        setShowResourcesDropdown(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Disable body scroll when menu is open
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('q') as HTMLInputElement;
    if (input.value.trim()) {
      router.push(`/visuals?q=${encodeURIComponent(input.value.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  if (pathname.startsWith("/uploader")) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-brand/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            : "bg-white border-b border-brand/5"
          } ${isVisible ? "translate-y-0" : "-translate-y-full"} ${isDashboard ? "hidden md:block" : ""}`}
      >
        {/* Height: 64px desktop (h-16), 56px mobile (h-14) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">

          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group z-50">
              <img 
                src="/logo.png?v=4" 
                alt="Learnpik" 
                className="h-7 md:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 ml-8 text-sm font-medium text-brand/80 select-none whitespace-nowrap">
              <Link href="/" className="px-4 py-2 rounded-full hover:bg-black/5 hover:text-brand transition-all">Home</Link>
              <Link href="/visuals" className="px-4 py-2 rounded-full hover:bg-black/5 hover:text-brand transition-all">Visuals</Link>

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
                  className="flex items-center gap-1 px-4 py-2 rounded-full hover:bg-black/5 hover:text-brand transition-all focus:outline-none cursor-pointer"
                >
                  Company
                  <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${showResourcesDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Company Dropdown Card */}
                {showResourcesDropdown && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border border-brand/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-sm font-medium text-brand/90">
                    <Link
                      href="/contact"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 hover:text-brand transition-colors"
                    >
                      <Mail className="w-4 h-4 opacity-70" />
                      Contact Us
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 hover:text-brand transition-colors"
                    >
                      <Info className="w-4 h-4 opacity-70" />
                      About Us
                    </Link>

                  </div>
                )}
              </div>

              <Link href="/pricing" className="hidden px-4 py-2 rounded-full hover:bg-black/5 hover:text-brand transition-all">Pricing</Link>
              {user ? (
                <Link href="/uploader" className="text-sm font-semibold text-white bg-brand hover:bg-brand/90 transition-all flex items-center gap-1.5 ml-4 px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <UploadIcon className="w-4 h-4" /> Creator Portal
                </Link>
              ) : (
                <button onClick={() => useAuthModal.getState().open("signup")} className="px-4 py-2 rounded-full text-sm font-bold text-[#073238] hover:bg-black/5 transition-all">Become a Creator</button>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/50 group-focus-within:text-brand transition-colors" />
              <input 
                name="q"
                type="text" 
                placeholder="Search visuals, worksheets..." 
                className="w-full bg-black/5 hover:bg-black/10 focus:bg-white border border-transparent focus:border-brand/20 rounded-full py-1.5 pl-9 pr-4 text-sm outline-none transition-all text-brand font-medium placeholder:font-normal placeholder:text-brand/50"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (isOpen) setIsOpen(false); // Close menu if open
              }}
              className="lg:hidden p-2 text-brand/70 hover:text-brand hover:bg-[#f3f3f3] rounded-full transition-all cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>




            {/* User Profile (Mobile + Desktop) or Login/Signup (Desktop) */}
            {user ? (
              <div className={`relative flex items-center gap-3 ${isOpen ? 'hidden md:flex' : ''}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full cursor-pointer transition-all duration-300 select-none hover:-translate-y-0.5 shadow-sm"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-[12px] font-black flex items-center justify-center shadow-sm ring-2 ring-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
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
                          // { label: "Subscription Billing", tab: "subscription", icon: StarIcon },
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

                      {/* Admin actions */}
                      {(user.role === "admin" || user.role === "moderator") && (
                        <div className="border-t border-brand-border py-1">
                          <Link
                            href="/admin"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f3f3f3] hover:text-brand transition-colors"
                          >
                            <ShieldIcon className="w-3.5 h-3.5 text-brand-muted" />
                            Admin Panel
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
                  onClick={() => useAuthModal.getState().open("signin")}
                  className="px-5 py-2.5 text-brand/80 hover:text-brand hover:bg-black/5 text-sm font-semibold rounded-full transition-all cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => useAuthModal.getState().open("signup")}
                  className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-full transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-brand/90 hover:-translate-y-0.5 cursor-pointer"
                >
                  Sign up
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

      {/* Mobile Search Bar Dropdown */}
      <div className={`fixed top-14 md:top-16 left-0 right-0 bg-white border-b border-brand/10 p-3 z-40 transition-all duration-300 lg:hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${mobileSearchOpen && isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/50" />
          <input 
            name="q"
            type="text" 
            placeholder="Search visuals..." 
            className="w-full bg-black/5 focus:bg-white border border-brand/10 focus:border-brand/20 rounded-full py-2 pl-9 pr-4 text-sm outline-none transition-all text-brand font-medium placeholder:font-normal"
          />
        </form>
      </div>

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

                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                onClick={toggleMenu}
                className="hidden text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors"
              >
                Pricing
              </Link>
              {user ? (
                <Link
                  href="/uploader"
                  onClick={toggleMenu}
                  className="flex items-center gap-1.5 text-[rgba(0,57,60,0.85)] text-base font-extrabold hover:text-brand transition-colors"
                >
                  <UploadIcon className="w-4 h-4" /> Creator Portal
                </Link>
              ) : (
                <button
                  onClick={() => {
                    toggleMenu();
                    useAuthModal.getState().open("signup");
                  }}
                  className="text-[#073238] text-base font-extrabold hover:text-brand transition-colors text-left"
                >
                  Become a Creator
                </button>
              )}
            </nav>


          </div>

          {/* User Section at the bottom */}
          {!user && (
            <div className="flex flex-col gap-3 mt-8 border-t border-brand-border/30 pt-6">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    toggleMenu();
                    useAuthModal.getState().open("signin");
                  }}
                  className="w-full py-3.5 text-center border border-brand-border text-brand hover:bg-[#f3f3f3] rounded-md font-bold transition-all text-sm cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    toggleMenu();
                    useAuthModal.getState().open("signup");
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
