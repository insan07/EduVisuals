import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-surface pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto bg-white border border-brand-border rounded-3xl p-8 md:p-12 shadow-sm text-brand">
        <h1 className="text-3xl font-black mb-6">Terms and Conditions</h1>
        <p className="text-sm text-brand-muted mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-sm leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
            <p className="text-brand-muted">Welcome to Learnpik. By accessing our website, you agree to these terms and conditions. These terms govern your use of the platform, the download of visual assets, and the creation of an account.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">2. Intellectual Property Rights</h2>
            <p className="text-brand-muted">All visual content, educational diagrams, mind maps, and text available on Learnpik are the intellectual property of Learnpik or its contributors. You may not claim ownership of any content downloaded from this site.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">3. Use of Content</h2>
            <p className="text-brand-muted mb-2"><strong>Free Users:</strong> May download watermarked visuals for personal and educational use.</p>
            <p className="text-brand-muted"><strong>Premium Users:</strong> Are granted a license to download and use unwatermarked high-resolution and vector graphics in commercial, academic, and professional settings, provided that the original files are not resold or redistributed directly as standalone digital assets.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Partner/Contributor Accounts</h2>
            <p className="text-brand-muted">Approved contributors may upload visual content. By uploading, you grant Learnpik a non-exclusive license to display, distribute, and monetize the content on the platform. Contributors must ensure they hold the necessary rights to upload their content.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Disclaimer</h2>
            <p className="text-brand-muted">The educational materials on this site are provided "as is" without warranty of any kind. While we strive for absolute accuracy in our scientific and educational visuals, Learnpik is not liable for any academic or professional consequences arising from the use of our diagrams.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Modifications</h2>
            <p className="text-brand-muted">We reserve the right to modify these terms at any time. Continued use of the platform constitutes your consent to such changes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
