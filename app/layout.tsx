import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import Toast from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduVisuals.lk — Sri Lanka's Premium AI Educational Visual Library",
  description:
    "Sri Lanka's premier AI educational image platform. Access high-quality, local curriculum-aligned diagrams, illustrations, and visual aids for science, history, geography, and more.",
  metadataBase: new URL("https://eduvisuals.lk"),
  manifest: "/manifest.json",
  openGraph: {
    title: "EduVisuals.lk — Sri Lanka's Premium AI Educational Visual Library",
    description:
      "Sri Lanka's premier AI educational image platform. Access high-quality, local curriculum-aligned diagrams, illustrations, and visual aids for science, history, geography, and more.",
    url: "https://eduvisuals.lk",
    siteName: "EduVisuals.lk",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduVisuals.lk — Sri Lanka's Educational Visual Library",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduVisuals.lk — Sri Lanka's Premium AI Educational Visual Library",
    description:
      "Sri Lanka's premier AI educational image platform. Access high-quality, local curriculum-aligned diagrams, illustrations, and visual aids.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-brand-surface text-brand flex flex-col font-sans antialiased pt-14 md:pt-16">
        <Navbar />
        <AuthModal />
        <Toast />
        <main className="flex-1 flex flex-col w-full">{children}</main>
        <Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW reg failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
