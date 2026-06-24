"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subject");
      if (sub === "Billing") {
        setSubject("Billing / Premium Inquiry");
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
    setTimeout(() => {
      alert("Support message dispatched successfully! Our team will contact you within 24 hours.");
      setName("");
      setEmail("");
      setMessage("");
      setSent(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-border mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-black uppercase text-brand tracking-wider">
              Reach Out
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand tracking-tight leading-none mb-3">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-muted max-w-xl mx-auto font-medium">
            Have questions or suggestions? Reach out directly.
          </p>
        </div>

        {/* DETAILS GRID */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-4">
          
          {/* Box 1: Email */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex items-start gap-4 flex-1 max-w-xs">
            <div className="w-10 h-10 rounded-lg bg-[#f3f3f3] flex items-center justify-center text-brand border border-brand-border flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-xs font-semibold">
              <span className="text-[10px] font-bold text-brand-faint uppercase">Email</span>
              <span className="text-brand font-black mt-1.5 text-sm">mohamedinsan07@gmail.com</span>
            </div>
          </div>

          {/* Box 2: Phone */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex items-start gap-4 flex-1 max-w-xs">
            <div className="w-10 h-10 rounded-lg bg-[#f3f3f3] flex items-center justify-center text-brand border border-brand-border flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-xs font-semibold">
              <span className="text-[10px] font-bold text-brand-faint uppercase">Direct Hotline</span>
              <span className="text-brand font-black mt-1.5 text-sm">+94 77 991 0080</span>
            </div>
          </div>

          {/* Box 3: Address */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex items-start gap-4 flex-1 max-w-xs">
            <div className="w-10 h-10 rounded-lg bg-[#f3f3f3] flex items-center justify-center text-brand border border-brand-border flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-xs font-semibold">
              <span className="text-[10px] font-bold text-brand-faint uppercase">Location</span>
              <span className="text-brand font-black mt-1.5 text-sm">Puttalam, Sri Lanka</span>
            </div>
          </div>

        </div>

        {/* SECURITY & SLA DISCLAIMER */}
        <div className="max-w-md mx-auto text-center border-t border-brand-border pt-8 flex flex-col items-center gap-2 text-xs font-bold text-brand-faint select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Secure Customer Relationship Management Protocol</span>
          </div>
        </div>

      </div>
    </div>
  );
}
