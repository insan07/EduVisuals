import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-surface pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto bg-white border border-brand-border rounded-3xl p-8 md:p-12 shadow-sm text-brand">
        <h1 className="text-3xl font-black mb-6">Privacy Policy</h1>
        <p className="text-sm text-brand-muted mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-sm leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <p className="text-brand-muted">We collect information that you provide directly to us, such as when you create an account (name, email), subscribe to premium features (billing information), or contact our support team. We also collect usage data, such as your search history and download activity, to improve the platform.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <p className="text-brand-muted mb-2">We use the collected information to:</p>
            <ul className="list-disc pl-5 text-brand-muted space-y-1">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information.</li>
              <li>Send you technical notices, security alerts, and support messages.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">3. Data Security</h2>
            <p className="text-brand-muted">We use industry-standard security measures, including Supabase Auth and database RLS (Row Level Security), to protect your personal information from unauthorized access, use, or disclosure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Third-Party Services</h2>
            <p className="text-brand-muted">We may share your data with trusted third-party service providers (like payment processors) only to the extent necessary to provide our services. We do not sell your personal data to third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Your Rights</h2>
            <p className="text-brand-muted">You have the right to access, update, or delete your personal information at any time through your dashboard. If you need assistance, please contact our support team.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Contact Us</h2>
            <p className="text-brand-muted">If you have any questions about this Privacy Policy, please contact us at MOHAMEDINSAN07@GMAIL.COM.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
