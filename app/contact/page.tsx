"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Mail, Phone, MapPin, Send, ShieldCheck, MessageSquare, Clock, Globe } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setSent(true);
      setIsSubmitting(false);
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setSent(false);
      }, 3000); // Reset form after 3 seconds showing success
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-surface selection:bg-brand selection:text-white flex flex-col relative overflow-hidden">
      
      {/* ── Premium Background Elements ── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#073238] to-brand-surface z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[600px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow">
        
        {/* HEADER */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-black uppercase text-white tracking-widest">
              We're Here to Help
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
            Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-200">Conversation</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Whether you have a question about premium features, need technical support, or want to partner with us, our global team is ready to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Details */}
          <div className="lg:col-span-5 flex flex-col gap-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-brand-faint uppercase tracking-wider mb-1">Email Us</h3>
              <p className="text-xl font-black text-brand mb-2">info@learnpik.com</p>
              <p className="text-sm text-brand-muted font-medium">Our friendly team is here to help you.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-brand-faint uppercase tracking-wider mb-1">Global Headquarters</h3>
              <p className="text-xl font-black text-brand mb-2">Sri Lanka</p>
              <p className="text-sm text-brand-muted font-medium">Available for international inquiries.</p>
            </div>

            <div className="bg-gradient-to-br from-[#073238] to-[#0a4a52] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <MessageSquare className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">Response Time</h3>
                <p className="text-xl font-black text-white mb-2">Under 24 Hours</p>
                <p className="text-sm text-white/80 font-medium">We pride ourselves on rapid, helpful support.</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 lg:p-12 shadow-xl border border-brand/5 relative overflow-hidden">
              
              {sent ? (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <Send className="w-10 h-10 text-emerald-600 ml-1" />
                  </div>
                  <h3 className="text-2xl font-black text-brand mb-3">Message Sent!</h3>
                  <p className="text-brand-muted font-medium max-w-sm">
                    Thank you for reaching out. Our support team will review your message and get back to you shortly.
                  </p>
                </div>
              ) : null}

              <div className="mb-8">
                <h2 className="text-2xl font-black text-brand mb-2">Send a Message</h2>
                <p className="text-brand-muted font-medium text-sm">Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-brand ml-1">Your Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-[#f8f9fa] border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl px-5 py-4 text-brand font-medium outline-none transition-all w-full placeholder:text-brand-faint"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-brand ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="bg-[#f8f9fa] border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl px-5 py-4 text-brand font-medium outline-none transition-all w-full placeholder:text-brand-faint"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand ml-1">Subject</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-[#f8f9fa] border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl px-5 py-4 text-brand font-medium outline-none transition-all w-full appearance-none cursor-pointer"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Billing / Premium Inquiry">Billing & Premium</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Feedback / Suggestion">Feedback & Suggestions</option>
                    <option value="Partnership">Partnership Inquiry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand ml-1">Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you today?"
                    rows={5}
                    className="bg-[#f8f9fa] border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl px-5 py-4 text-brand font-medium outline-none transition-all w-full resize-none placeholder:text-brand-faint"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !name || !email || !message}
                  className="mt-2 w-full bg-brand hover:bg-[#00393c] text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-brand-faint">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Your data is protected by industry-standard encryption.</span>
                </div>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
