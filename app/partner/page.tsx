"use client";
import { Star, Mail, CheckCircle, Coins, Sparkles } from "lucide-react";

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      {/* HERO */}
      <section className="bg-white border-b border-brand-border py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 border border-brand-border rounded-full text-xs font-black text-brand uppercase tracking-wider mb-6">
            <Star className="w-3.5 h-3.5" /> Partner Program
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-brand mb-4 leading-tight">
            Create Educational Visuals.<br />
            <span className="text-brand">Earn With Us.</span>
          </h1>
          <p className="text-brand-muted text-sm md:text-base font-medium mb-10 max-w-2xl mx-auto">
            Are you a teacher, tutor, or designer? Partner with EduVisuals to share your high-quality diagrams, mind maps, and study materials with students worldwide.
          </p>
          
          <a href="mailto:MOHAMEDINSAN07@GMAIL.COM?subject=EduVisuals Partner Application"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-white font-black text-sm rounded-xl hover:opacity-90 transition-all shadow-lg">
            <Mail className="w-4 h-4" /> Email Us to Apply
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-brand text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step:"1", icon: <Mail className="w-8 h-8 text-white" />, bg: "from-blue-500 to-indigo-600", title:"Reach Out", desc:"Send us an email introducing yourself and your subject expertise." },
              { step:"2", icon: <CheckCircle className="w-8 h-8 text-[#073238]" />, bg: "from-amber-300 to-yellow-500", title:"Get Approved", desc:"Our team reviews your profile and gives you direct upload access." },
              { step:"3", icon: <Coins className="w-8 h-8 text-white" />, bg: "from-emerald-400 to-teal-600", title:"Upload & Earn", desc:"Upload visuals, get discovered by students, and earn revenue." },
            ].map(item => (
              <div key={item.step} className="bg-white border border-brand-border rounded-2xl p-8 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-brand mb-3 text-lg">{item.title}</h3>
                <p className="text-sm text-brand-muted font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
