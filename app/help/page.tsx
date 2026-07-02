"use client";
import { Sparkles, Mail, HelpCircle, ShieldCheck } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-24 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-border mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-black uppercase text-brand tracking-wider">
              24/7 Support Desk
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand tracking-tight leading-none mb-4">
            Get Help
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-muted max-w-xl mx-auto font-medium">
            Need assistance, want to report an issue, or have a billing inquiry? Send an email to our support team and we will get back to you within 24 hours.
          </p>
        </div>

        {/* Contact Action */}
        <div className="bg-white border border-brand-border p-10 md:p-14 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center">
          <HelpCircle className="w-12 h-12 text-brand/20 mb-4" />
          <h3 className="font-extrabold text-xl text-brand mb-2">
            Send us a Message
          </h3>
          <p className="text-sm text-brand-muted font-semibold mb-8 max-w-md">
            We handle all support tickets via email to ensure you get the fastest, most personalized help possible.
          </p>
          
          <a href="mailto:support@learnpik.com?subject=Learnpik Support Request"
            className="w-full sm:w-auto px-10 py-4 bg-brand hover:opacity-90 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Email Support Team
          </a>
        </div>

        {/* SECURITY & SLA DISCLAIMER */}
        <div className="text-center border-t border-brand-border pt-8 flex flex-col items-center gap-2 text-xs font-bold text-brand-faint">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Secure Customer Relationship Management Protocol</span>
          </div>
        </div>

      </div>
    </div>
  );
}
