import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { AdBox } from "@/components/AdBox";
import { StickyBottomAd } from "@/components/StickyBottomAd";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WebTera Tools",
    template: "%s | WebTera Tools",
  },
  description: "Fast, clean online tools with a modern ad-optimized layout.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full min-w-0">
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} h-full min-h-dvh min-w-0 w-full max-w-full bg-zinc-50 text-zinc-900 antialiased`}
      >
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Header />
        <div className="mx-auto w-full min-w-0 max-w-[1400px] px-3 py-4 sm:px-4">
          <div className="grid min-w-0 w-full grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_220px] 2xl:grid-cols-[260px_minmax(0,1fr)_260px]">
            <aside className="hidden min-w-0 xl:sticky xl:top-20 xl:block xl:self-start">
              <div className="space-y-4">
                <AdBox type="box" />
                <AdBox type="banner" />
              </div>
            </aside>

            <main className="min-w-0 w-full max-w-full py-2 pb-32 sm:py-4 sm:pb-36">
              {children}
              <Footer />
            </main>

            <aside className="hidden min-w-0 xl:sticky xl:top-20 xl:block xl:self-start">
              <div className="space-y-4">
                <AdBox type="box" />
                <AdBox type="banner" />
              </div>
            </aside>
          </div>
        </div>

        <StickyBottomAd />
      </body>
    </html>
  );
}
