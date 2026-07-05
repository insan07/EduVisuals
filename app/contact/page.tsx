"use client";

import React, { useState } from "react";
import { Mail, MapPin, MessageSquare, Send } from "lucide-react";
import { PremiumLoader } from "@/components/PremiumLoader";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand pt-20 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-5xl mx-auto mt-8">
        <div className="text-left mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-brand tracking-tight leading-none mb-6">
            Get in touch
          </h1>
          <p className="text-lg text-brand-faint font-medium max-w-xl">
            Have a question, feedback, or need support with your account? We're here to help. Reach out to our team below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
          
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-2 bg-[#f8f9fa] p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-brand-border flex flex-col">
            <h3 className="text-2xl font-extrabold mb-10">Contact Information</h3>
            
            <div className="space-y-10 flex-grow">
              <div>
                <h4 className="font-bold text-xs flex items-center gap-2 mb-2 text-brand-faint uppercase tracking-wider"><Mail className="w-4 h-4 text-emerald-600" /> General Inquiries</h4>
                <a href="mailto:hello@learnpik.com" className="font-bold text-lg hover:text-emerald-600 transition-colors">hello@learnpik.com</a>
              </div>

              <div>
                <h4 className="font-bold text-xs flex items-center gap-2 mb-2 text-brand-faint uppercase tracking-wider"><MessageSquare className="w-4 h-4 text-blue-600" /> Support</h4>
                <a href="mailto:support@learnpik.com" className="font-bold text-lg hover:text-blue-600 transition-colors">support@learnpik.com</a>
              </div>

              <div>
                <h4 className="font-bold text-xs flex items-center gap-2 mb-2 text-brand-faint uppercase tracking-wider"><MapPin className="w-4 h-4 text-amber-600" /> Office</h4>
                <p className="font-bold text-base leading-snug">Global Remote<br/>Colombo, Sri Lanka</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-brand-border/60">
              <p className="text-xs font-medium text-brand-faint leading-relaxed">
                We aim to respond to all inquiries within 1-2 business days. For urgent matters regarding Premium accounts, please indicate "URGENT" in your subject line.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-3 p-8 md:p-12">
            <h3 className="text-2xl font-extrabold mb-8">Send us a message</h3>
            
            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center flex flex-col items-center justify-center h-[350px]">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-extrabold text-emerald-800 mb-2">Message Sent!</h4>
                <p className="text-sm font-medium text-emerald-700 max-w-xs mx-auto">
                  Thank you for reaching out. A member of our team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-brand-faint ml-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#f4f4f4] border-transparent focus:bg-white focus:border-brand-border focus:ring-2 focus:ring-brand/5 rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                      placeholder="Jane Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-faint ml-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#f4f4f4] border-transparent focus:bg-white focus:border-brand-border focus:ring-2 focus:ring-brand/5 rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-brand-faint ml-1">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#f4f4f4] border-transparent focus:bg-white focus:border-brand-border focus:ring-2 focus:ring-brand/5 rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-brand-faint ml-1">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#f4f4f4] border-transparent focus:bg-white focus:border-brand-border focus:ring-2 focus:ring-brand/5 rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-gray-400 resize-none"
                    placeholder="Provide details about your inquiry..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-brand hover:bg-brand/90 text-white font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                >
                  {isSubmitting ? <PremiumLoader className="text-white" /> : "Send Message"}
                  {!isSubmitting && <Send className="w-4 h-4 ml-1" />}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
