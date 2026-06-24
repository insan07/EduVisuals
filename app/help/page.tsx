"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Send, HelpCircle, ShieldCheck } from "lucide-react";

export default function HelpPage() {
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
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-border mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-black uppercase text-brand tracking-wider">
              24/7 Support Desk
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand tracking-tight leading-none mb-3">
            Get Help
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-muted max-w-xl mx-auto font-medium">
            Submit a ticket to our support team and we will get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-brand-border p-6 md:p-10 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-sm text-brand border-b border-brand-border pb-3.5 mb-5 flex items-center gap-1.5">
            <HelpCircle className="w-4.5 h-4.5 text-brand" />
            Send a Message
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-faint uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohamed Insan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-4 py-3.5 rounded-xl outline-none focus:border-brand transition-all"
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
                  className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-4 py-3.5 rounded-xl outline-none focus:border-brand transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-brand-faint uppercase">Reason for Contact</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#f3f3f3] border border-brand-border text-brand px-4 py-3.5 rounded-xl outline-none"
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
                rows={5}
                placeholder="Type your message or inquiry here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#f3f3f3] border border-brand-border text-brand placeholder:text-[rgba(0,57,60,0.5)] px-4 py-3.5 rounded-xl outline-none focus:border-brand transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sent}
              className="w-full bg-brand hover:bg-brand disabled:opacity-50 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" />
              {sent ? "Sending..." : "Send Message"}
            </button>
          </form>
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
