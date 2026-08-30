import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import OfflineEmergencyBanner from "@/components/OfflineEmergencyBanner";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "MedReach AI — Intelligent Medicine Availability & 24/7 Pharmacy Network",
  description:
    "Find the right medicine. Find it nearby. Save valuable time. AI Prescription OCR Scanner, Smart Pharmacy Ranking, Real-time Stock Reservations, and Express Courier Delivery.",
  keywords: [
    "medicine availability",
    "emergency pharmacy",
    "find medicine nearby",
    "prescription OCR scanner",
    "generic substitutes",
    "pharmacy inventory live",
    "MedReach AI",
    "online medicine pickup",
  ],
  authors: [{ name: "MedReach AI Healthcare Network" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "MedReach AI — Intelligent Medicine Availability & 24/7 Pharmacy Network",
    description:
      "Find verified medicine stock near you in seconds. AI prescription scanning, real-time inventory hold, and guaranteed counter pickups.",
    type: "website",
    locale: "en_IN",
    siteName: "MedReach AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedReach AI — Emergency Medicine Discovery",
    description:
      "AI prescription scanning & live pharmacy inventory tracking for instant medicine discovery.",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "MedReach AI",
  "url": "https://medreach.ai",
  "logo": "https://medreach.ai/icon-512.png",
  "description": "National intelligent medicine availability, AI prescription recognition, and verified 24/7 emergency pharmacy network.",
  "emergencyService": "https://medreach.ai/patient",
  "telephone": "108"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#06d6a0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#050a18] text-slate-100 antialiased selection:bg-[#06d6a0]/30 selection:text-[#06d6a0]">
        <AuthProvider>
          <OfflineEmergencyBanner />
          <Navbar />
          <main className="min-h-[calc(100vh-65px)]">{children}</main>
          <footer className="w-full py-10 px-4 border-t border-white/5 bg-[#030712] relative overflow-hidden">
            {/* Animated gradient line at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06d6a0]/30 to-transparent" />

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Logo mark */}
                <div className="w-8 h-8 rounded-xl bg-[#06d6a0]/10 border border-[#06d6a0]/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#06d6a0]" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">
                    MedReach{" "}
                    <span className="text-[#06d6a0] font-extrabold">AI</span>
                  </span>
                  <span className="text-slate-500 text-xs ml-2">
                    Intelligent Healthcare Platform
                  </span>
                </div>
              </div>
              <div className="text-slate-500 text-xs text-center sm:text-right max-w-md">
                Medical Safety: Information provided for inventory routing only.
                Always consult a licensed physician for medical advice.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
