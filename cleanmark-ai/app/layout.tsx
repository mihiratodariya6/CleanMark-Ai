import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. MASTER SEO METADATA
export const metadata: Metadata = {
  title: "CleanMark AI — Free AI Video Watermark Remover",
  description: "Remove watermarks from videos with AI. CleanMark AI is a free online video watermark remover with no signup or subscription required.",
  keywords: ["free video watermark remover", "AI video watermark remover", "remove watermark from video", "free watermark remover"],
  openGraph: {
    title: "CleanMark AI — Free AI Video Watermark Remover",
    description: "Remove video watermarks with AI. Free, simple and easy to use.",
    url: "https://cleanmark.ai", // ભવિષ્યમાં તમારું ડોમેન
    siteName: "CleanMark AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CleanMark AI — Free AI Video Watermark Remover",
    description: "Remove video watermarks with AI. Free, simple and easy to use.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 2. STRUCTURED DATA (JSON-LD) FOR AEO/GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CleanMark AI",
    "url": "https://cleanmark.ai",
    "description": "Free AI-powered video watermark removal tool.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* WHITE-FIRST DESIGN: Background is solid white */}
      <body className={`${inter.className} bg-white text-zinc-900 antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col min-h-screen`}>
        
        {/* SIMPLE PREMIUM HEADER */}
        <header className="w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* CleanMark AI Text Logo */}
              <span className="font-bold text-xl tracking-tight text-zinc-900">
                CleanMark <span className="text-blue-600">AI</span>
              </span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-500">
              <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How It Works</a>
              <a href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</a>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* PROFESSIONAL FOOTER */}
        <footer className="w-full border-t border-zinc-100 bg-zinc-50 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="font-bold text-lg text-zinc-900">CleanMark AI</span>
              <p className="text-sm text-zinc-500 mt-1">Remove. Restore. Export.</p>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="/privacy" className="hover:text-zinc-900 transition">Privacy</a>
              <a href="/terms" className="hover:text-zinc-900 transition">Terms</a>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 pb-6 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} CleanMark AI. All rights reserved.
          </div>
        </footer>

      </body>
    </html>
  );
}