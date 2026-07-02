import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CollectionModal from "@/components/CollectionModal";
import Toast from "@/components/Toast";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduVisuals — World's Premium AI Educational Visual Library",
  description:
    "World's premier AI educational image platform. Access high-quality, local curriculum-aligned diagrams, illustrations, and visual aids for science, history, geography, and more.",
  metadataBase: new URL("https://eduvisuals.com"),
  manifest: "/manifest.json",
  openGraph: {
    title: "EduVisuals — World's Premium AI Educational Visual Library",
    description:
      "World's premier AI educational image platform. Access high-quality, local curriculum-aligned diagrams, illustrations, and visual aids for science, history, geography, and more.",
    url: "https://eduvisuals.com",
    siteName: "EduVisuals",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduVisuals — World's Educational Visual Library",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduVisuals — World's Premium AI Educational Visual Library",
    description:
      "World's premier AI educational image platform. Access high-quality, local curriculum-aligned diagrams, illustrations, and visual aids.",
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
        <CollectionModal />
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
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
