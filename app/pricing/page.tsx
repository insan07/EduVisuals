"use client";

import React, { useState } from "react";
import { Crown, Check, X, ShieldCheck, CreditCard, Sparkles, Building, Landmark, HelpCircle, ChevronRight } from "lucide-react";
import { formatLKR } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const studentMonthlyPrice = 499;
  const studentYearlyPrice = 4990;

  const handlePurchase = (planName: string) => {
    alert(`Redirecting to secure PayHere checkout for plan: ${planName} (${billingCycle})...`);
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* 1. PAGE HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-border mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span className="text-[10px] font-black uppercase text-brand tracking-wider">
            Premium Study Visuals
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand tracking-tight leading-none mb-3">
          Unlock Premium EduVisuals
        </h1>
        <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto mb-8 font-medium">
          Perfect for students, teachers, and institutions across Sri Lanka. Cancel or change plans anytime.
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-extrabold ${billingCycle === "monthly" ? "text-brand" : "text-[rgba(0,57,60,0.5)]"}`}>
            Billed Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 bg-brand rounded-full p-1 transition-all duration-300 relative"
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
              billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
            }`} />
          </button>
          <span className={`text-xs font-extrabold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-brand" : "text-[rgba(0,57,60,0.5)]"}`}>
            Billed Yearly
            <span className="text-[9px] font-black uppercase bg-brand text-white px-2 py-0.5 rounded-full shadow-sm">
              Save 2 Months
            </span>
          </span>
        </div>
      </div>

      {/* 2. PRICING CARDS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20 select-none">
        
        {/* CARD 1: Free */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[rgba(0,57,60,0.5)] bg-[#f3f3f3] border border-brand-border px-2.5 py-1 rounded-full">
              Free Forever
            </span>
            <div className="mt-5 mb-4">
              <span className="text-3xl font-black text-brand">{formatLKR(0)}</span>
              <span className="text-xs text-[rgba(0,57,60,0.5)] font-semibold"> / life</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed mb-6 font-medium">
              Essential visual aid features for casual homework revisions.
            </p>
            <hr className="border-brand-border mb-6" />
            <ul className="space-y-3.5 text-xs font-semibold text-[rgba(0,57,60,0.85)]">
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Browse all 10,000+ study visuals</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>5 watermarked downloads / day</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Save up to 10 favorites</span>
              </li>
              <li className="flex items-start gap-2.5 text-[rgba(0,57,60,0.45)]">
                <X className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                <span>No high-resolution HD downloads</span>
              </li>
              <li className="flex items-start gap-2.5 text-[rgba(0,57,60,0.45)]">
                <X className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                <span>Watermarks on all download file templates</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => alert("Creating free account...")}
            className="w-full mt-8 bg-white border border-brand-border hover:bg-[#f3f3f3] text-brand font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm"
          >
            Get Started Free
          </button>
        </div>

        {/* CARD 2: Student Premium (Featured) */}
        <div className="bg-white border-2 border-brand rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-md relative scale-100 lg:scale-[1.03] z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow border border-brand">
            Most Popular
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/5 border border-[rgba(7,50,56,0.15)] px-2.5 py-1 rounded-full">
                Student Plan
              </span>
              <Crown className="w-5 h-5 text-brand" />
            </div>
            <div className="mt-5 mb-4">
              <span className="text-3xl font-black text-brand">
                {billingCycle === "monthly" ? formatLKR(studentMonthlyPrice) : formatLKR(studentYearlyPrice)}
              </span>
              <span className="text-xs text-[rgba(0,57,60,0.5)] font-semibold">
                {billingCycle === "monthly" ? " / month" : " / year"}
              </span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed mb-6 font-medium">
              Complete high-resolution visual aids for O/L, A/L and University studies.
            </p>
            <hr className="border-brand-border mb-6" />
            <ul className="space-y-3.5 text-xs font-semibold text-[rgba(0,57,60,0.85)]">
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Everything in Free plan</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span className="font-extrabold">Unlimited HD PNG + JPG downloads</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span className="font-extrabold">No watermarks on downloads ever</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>SVG Vector formats included</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Save unlimited Collections and folders</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handlePurchase("Student Premium")}
            className="w-full mt-8 bg-brand hover:bg-brand text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md"
          >
            Get Student Premium
          </button>
        </div>

        {/* CARD 3: Institution/School */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-[#f3f3f3] border border-brand-border px-2.5 py-1 rounded-full">
                Schools & Classes
              </span>
              <Building className="w-5 h-5 text-brand" />
            </div>
            <div className="mt-5 mb-4">
              <span className="text-3xl font-black text-brand">{formatLKR(3999)}</span>
              <span className="text-xs text-[rgba(0,57,60,0.5)] font-semibold"> / month</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed mb-6 font-medium">
              Multi-account features for tuition classes, schools, and study groups.
            </p>
            <hr className="border-brand-border mb-6" />
            <ul className="space-y-3.5 text-xs font-semibold text-[rgba(0,57,60,0.85)]">
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Everything in Student Premium</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span className="font-extrabold">50 separate student accounts included</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>300dpi print-ready formats</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Bulk download and syllabus tools</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Invoice billing (PO support)</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handlePurchase("Institution Plan")}
            className="w-full mt-8 bg-white border border-brand-border hover:bg-[#f3f3f3] text-brand font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm"
          >
            Contact Institution Sales
          </button>
        </div>

      </div>

      {/* 3. COMPARISON TABLE */}
      <div className="max-w-4xl mx-auto mb-20 select-none">
        <h2 className="text-xl md:text-2xl font-black text-center text-brand mb-8">
          Compare Premium Features
        </h2>
        <div className="overflow-x-auto bg-white border border-brand-border rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-[#f3f3f3] text-brand-muted uppercase font-black text-[10px] tracking-wide">
                <th className="p-4">Visual Aids Features</th>
                <th className="p-4">Free Plan</th>
                <th className="p-4">Premium Student</th>
                <th className="p-4">Institution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,57,60,0.05)] text-brand font-semibold">
              <tr>
                <td className="p-4">Daily Download Limit</td>
                <td className="p-4">5 files / day</td>
                <td className="p-4 text-emerald-700 font-bold">Unlimited</td>
                <td className="p-4 text-emerald-700 font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4">Download Watermark</td>
                <td className="p-4 text-red-500">Watermarked</td>
                <td className="p-4 text-emerald-700">No Watermark</td>
                <td className="p-4 text-emerald-700">No Watermark</td>
              </tr>
              <tr>
                <td className="p-4">Available Formats</td>
                <td className="p-4">JPG only</td>
                <td className="p-4">PNG, JPG, SVG Vector</td>
                <td className="p-4">PNG, JPG, SVG, 300dpi PDF</td>
              </tr>
              <tr>
                <td className="p-4">Custom Collections</td>
                <td className="p-4">Max 1 folder</td>
                <td className="p-4 text-emerald-700">Unlimited</td>
                <td className="p-4 text-emerald-700">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4">Student Seats</td>
                <td className="p-4">1 user</td>
                <td className="p-4">1 user</td>
                <td className="p-4">50 accounts included</td>
              </tr>
              <tr>
                <td className="p-4">Online support</td>
                <td className="p-4">Community</td>
                <td className="p-4">Priority Email</td>
                <td className="p-4">Dedicated Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. FAQ SECTION */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-xl md:text-2xl font-black text-center text-brand mb-8">
          Pricing FAQ
        </h2>
        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-xs font-semibold">
          {[
            { q: "Is it safe to pay online?", a: "Yes. All online payments are securely processed by PayHere (licensed by the Central Bank of Sri Lanka) using 256-bit SSL encryption. We never store your card details." },
            { q: "Can I cancel my subscription anytime?", a: "Absolutely. You can cancel your subscription from your account dashboard settings in one click. No contracts or cancelation fees." },
            { q: "Do you accept bank transfers?", a: "Yes, for institution plans or yearly packages. Contact our billing support desk via email to receive our bank invoice account details." },
            { q: "Is there a student discount?", a: "Our student plan is already discounted at Rs. 499/month, which is over 50% cheaper than regular pricing to make it accessible across Sri Lanka." },
            { q: "What payment methods are accepted?", a: "We accept Visa, Mastercard, AMEX, Discover, Genie, EzCash, mCash, and internet banking via PayHere." },
            { q: "Can I share my account credentials?", a: "Free and Student Premium accounts are for single-user access only. Sharing may trigger safety locks. Schools or tuition groups should use the Institution Plan." },
          ].map((item, idx) => (
            <details key={idx} className="group border-b border-brand-border pb-3.5 last:border-0 last:pb-0 cursor-pointer">
              <summary className="font-extrabold list-none flex justify-between items-center text-brand">
                {item.q}
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-brand" />
              </summary>
              <p className="text-brand-muted font-medium leading-relaxed mt-2.5 pl-1">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* 5. PAYMENTS FOOTER */}
      <div className="max-w-md mx-auto text-center border-t border-brand-border pt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-faint">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>PayHere Secure 256-bit Encrypted Checkout</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase text-brand-faint">
          <span>Visa</span> · <span>Mastercard</span> · <span>mCash</span> · <span>EzCash</span> · <span>Genie</span>
        </div>
      </div>

    </div>
  );
}
