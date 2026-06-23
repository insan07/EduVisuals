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
              24/7 Support Desk
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand tracking-tight leading-none mb-3">
            Contact Support Team
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-muted max-w-xl mx-auto font-medium">
            Have questions about your Premium subscription, billing, or suggestions? Reach out directly.
          </p>
        </div>

        {/* DETAILS & FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
          
          {/* Contact Details (2 columns) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            
            {/* Box 1: Email */}
            <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#f3f3f3] flex items-center justify-center text-brand border border-brand-border flex-shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col text-xs font-semibold">
                <span className="text-[10px] font-bold text-brand-faint uppercase">Email Support Desk</span>
                <span className="text-brand font-black mt-1">support@eduvisuals.lk</span>
                <span className="text-[10px] text-[rgba(0,57,60,0.5)] mt-0.5">Average response time: 2 hours</span>
              </div>
            </div>

            {/* Box 2: Phone */}
            <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#f3f3f3] flex items-center justify-center text-brand border border-brand-border flex-shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col text-xs font-semibold">
                <span className="text-[10px] font-bold text-brand-faint uppercase">Direct Hotline</span>
                <span className="text-brand font-black mt-1">+94 (11) 234-5678</span>
                <span className="text-[10px] text-[rgba(0,57,60,0.5)] mt-0.5">Mon - Fri: 8:00 AM - 5:00 PM</span>
              </div>
            </div>

            {/* Box 3: Address */}
            <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#f3f3f3] flex items-center justify-center text-brand border border-brand-border flex-shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col text-xs font-semibold">
                <span className="text-[10px] font-bold text-brand-faint uppercase">Headquarters</span>
                <span className="text-brand font-black mt-1">123 Galle Road, Colombo 03, Sri Lanka</span>
              </div>
            </div>

          </div>

          {/* Contact Form (3 columns) */}
          <div className="md:col-span-3 bg-white border border-brand-border p-6 md:p-8 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-sm text-brand border-b border-brand-border pb-3.5 mb-5 flex items-center gap-1.5">
              <HelpCircle className="w-4.5 h-4.5 text-brand" />
              Submit Help Ticket
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-faint uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohamed Insan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-faint uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. insan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-faint uppercase">Reason for Contact</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand px-3.5 py-3 rounded-xl outline-none"
                >
                  <option>General Support</option>
                  <option>Billing / Premium Inquiry</option>
                  <option>Content Contribution</option>
                  <option>School Partnerships</option>
                  <option>Report Content / Error</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-faint uppercase">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your message or inquiry here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-3.5 py-3 rounded-xl outline-none focus:border-brand transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sent}
                className="w-full bg-brand hover:bg-brand disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 mt-2"
              >
                <Send className="w-4 h-4" />
                {sent ? "Sending..." : "Submit Ticket"}
              </button>
            </form>
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
