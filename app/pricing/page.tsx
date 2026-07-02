"use client";

import React, { useState } from "react";
import { Crown, Check, X, Building, Sparkles } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModal";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const authModal = useAuthModal();

  const studentMonthlyPrice = 5.99;
  const studentYearlyPrice = 59.90;
  const institutionMonthlyPrice = 29.99;

  const handlePurchase = (planName: string) => {
    alert(`This will redirect to the secure checkout for the ${planName} plan.\n\nSee the "Payment Integration Guide" to connect Stripe!`);
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. PAGE HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-brand-border mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-black uppercase text-brand tracking-wider">
            Premium Study Visuals
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand tracking-tight leading-none mb-4">
          Unlock Premium LearnPik
        </h1>
        <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto mb-10 font-medium">
          Perfect for students, teachers, and institutions across the World. Cancel or change plans anytime.
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-extrabold transition-colors ${billingCycle === "monthly" ? "text-brand" : "text-brand-muted"}`}>
            Billed Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="w-14 h-7 bg-brand rounded-full p-1 transition-all duration-300 relative shadow-inner flex items-center"
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${
              billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"
            }`} />
          </button>
          <span className={`text-sm font-extrabold flex items-center gap-2 transition-colors ${billingCycle === "yearly" ? "text-brand" : "text-brand-muted"}`}>
            Billed Yearly
            <span className="text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-500 text-[#073238] px-2 py-0.5 rounded-full shadow-sm">
              Save 16%
            </span>
          </span>
        </div>
      </div>

      {/* 2. PRICING CARDS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20 select-none">
        
        {/* CARD 1: Free */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative transition-transform hover:-translate-y-1 duration-300">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-muted bg-gray-100 border border-brand-border px-3 py-1.5 rounded-full">
              Free Forever
            </span>
            <div className="mt-6 mb-5">
              <span className="text-4xl font-black text-brand">$0</span>
              <span className="text-sm text-brand-muted font-bold"> / life</span>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed mb-8 font-medium">
              Essential visual aid features for casual homework revisions.
            </p>
            <hr className="border-brand-border mb-8" />
            <ul className="space-y-4 text-sm font-semibold text-brand">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Browse all 10,000+ study visuals</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>5 watermarked downloads / day</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Save up to 10 favorites</span>
              </li>
              <li className="flex items-start gap-3 text-brand-muted opacity-60">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>No high-resolution HD downloads</span>
              </li>
              <li className="flex items-start gap-3 text-brand-muted opacity-60">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Watermarks on all download file templates</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => authModal.open("signup")}
            className="w-full mt-10 bg-white border-2 border-brand hover:bg-brand hover:text-white text-brand font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-sm"
          >
            Get Started Free
          </button>
        </div>

        {/* CARD 2: Student Premium (Featured) */}
        <div className="bg-white border-2 border-brand rounded-3xl p-8 flex flex-col justify-between shadow-xl relative scale-100 lg:scale-[1.05] z-10 transition-transform hover:-translate-y-2 duration-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#073238] text-[10px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow-md border border-yellow-300">
            Most Popular
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand bg-brand/5 border border-[rgba(7,50,56,0.15)] px-3 py-1.5 rounded-full">
                Student Plan
              </span>
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-1.5 rounded-lg border border-yellow-300 shadow-sm">
                <Crown className="w-4 h-4 text-[#073238] fill-[#073238]" />
              </div>
            </div>
            <div className="mt-6 mb-5">
              <span className="text-4xl font-black text-brand">
                ${billingCycle === "monthly" ? studentMonthlyPrice : studentYearlyPrice}
              </span>
              <span className="text-sm text-brand-muted font-bold">
                {billingCycle === "monthly" ? " / month" : " / year"}
              </span>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed mb-8 font-medium">
              Complete high-resolution visual aids encompassing all academic levels and professional studies.
            </p>
            <hr className="border-brand-border mb-8" />
            <ul className="space-y-4 text-sm font-semibold text-brand">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Everything in Free plan</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-extrabold text-[#073238]">Unlimited HD PNG + JPG downloads</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-extrabold text-[#073238]">No watermarks on downloads ever</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>SVG Vector formats included</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Save unlimited Collections and folders</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handlePurchase("Student Premium")}
            className="w-full mt-10 bg-brand hover:bg-[#0a4a52] text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Get Student Premium
          </button>
        </div>

        {/* CARD 3: Institution/School */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative transition-transform hover:-translate-y-1 duration-300">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand bg-gray-100 border border-brand-border px-3 py-1.5 rounded-full">
                Schools & Classes
              </span>
              <Building className="w-5 h-5 text-brand" />
            </div>
            <div className="mt-6 mb-5">
              <span className="text-4xl font-black text-brand">${institutionMonthlyPrice}</span>
              <span className="text-sm text-brand-muted font-bold"> / month</span>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed mb-8 font-medium">
              Multi-account features for tuition classes, schools, and study groups.
            </p>
            <hr className="border-brand-border mb-8" />
            <ul className="space-y-4 text-sm font-semibold text-brand">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Everything in Student Premium</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-extrabold">50 separate student accounts included</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>300dpi print-ready formats</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Bulk download and syllabus tools</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Invoice billing (PO support)</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handlePurchase("Institution")}
            className="w-full mt-10 bg-white border-2 border-brand-border hover:border-brand text-brand font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-sm"
          >
            Contact Sales
          </button>
        </div>

      </div>
    </div>
  );
}
