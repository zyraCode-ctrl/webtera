import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AdSlot } from "@/components/AdSlot";
import { StickyBottomAd } from "@/components/StickyBottomAd";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { PopunderScript } from "@/components/PopunderScript";
import { validateProductionEnv } from "@/lib/env";

validateProductionEnv();

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

function DesktopRail({ side }: { side: "left" | "right" }) {
  const pos = side === "left" ? "left-3 sm:left-4" : "right-3 sm:right-4";
  return (
    <aside
      className={[
        "pointer-events-none absolute top-4 bottom-0 hidden w-[170px] xl:block",
        pos,
      ].join(" ")}
      aria-hidden={false}
    >
      <div className="pointer-events-auto sticky top-20 max-h-[calc(100dvh-5.5rem)] space-y-4 overflow-y-auto overscroll-contain">
        <AdSlot type="box" variant="sidebar" />
        <AdSlot type="inline" variant="sidebar" />
      </div>
    </aside>
  );
}

function MobileRailAds({ placement }: { placement: "top" | "bottom" }) {
  return (
    <div
      className={[
        "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:hidden",
        placement === "top" ? "mb-4" : "mt-4",
      ].join(" ")}
    >
      <AdSlot type="box" variant="sidebarCompact" />
      <AdSlot type="box" variant="sidebarCompact" />
      <AdSlot type="inline" variant="sidebarCompact" />
      <AdSlot type="inline" variant="sidebarCompact" />
      <div className="sm:col-span-2">
        <AdSlot type="bannerMobile" variant="mobileSticky" className="max-w-full" />
      </div>
      <div className="sm:col-span-2">
        <AdSlot type="bannerMobile" variant="mobileSticky" className="max-w-full" />
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full min-w-0">
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} min-w-0 w-full max-w-full bg-transparent text-zinc-900 antialiased`}
      >
        <PopunderScript />
        <GoogleAnalytics />
        <Header />

        {/* Height follows main+footer; desktop rails are absolute so they do not stretch the page. */}
        <div className="relative mx-auto w-full min-w-0 max-w-[1320px] px-3 pb-[4.5rem] pt-4 sm:px-4 sm:pb-20">
          <DesktopRail side="left" />
          <DesktopRail side="right" />

          <main className="relative z-[1] min-w-0 w-full max-w-full py-2 sm:py-4 xl:mx-[190px] xl:w-auto">
            <p className="mb-4 rounded-xl border border-amber-200/70 bg-amber-50/85 px-3 py-2 text-sm leading-6 text-amber-950 shadow-sm shadow-amber-900/5 backdrop-blur-sm">
              <b>NOTE: TO ACCESS VIDEO FILES COME HERE FROM CHANNEL LINK.</b>
            </p>

            <MobileRailAds placement="top" />

            {children}

            <MobileRailAds placement="bottom" />

            <Footer />
          </main>
        </div>

        <StickyBottomAd />
      </body>
    </html>
  );
}
