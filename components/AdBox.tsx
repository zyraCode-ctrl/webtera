"use client";

import { useEffect } from "react";

export type AdBoxType = "banner" | "box" | "inline";

export function AdBox({
  type = "banner",
  className,
}: {
  type?: AdBoxType;
  className?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  const base =
    "w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-100 text-zinc-500 overflow-hidden";

  const size =
    type === "banner"
      ? "h-20 sm:h-24"
      : type === "inline"
        ? "h-16 sm:h-20"
        : "h-64 sm:h-72";

  useEffect(() => {
    if (clientId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, [clientId]);

  if (clientId) {
    return (
      <div className={[base, size, className].filter(Boolean).join(" ")}>
        <ins
          className="adsbygoogle w-full h-full block"
          data-ad-client={clientId}
          // The user can replace the slot ID per instance if needed
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className={[base, size, "grid place-items-center", className].filter(Boolean).join(" ")}>
      <div className="text-xs font-medium uppercase tracking-wider">
        Ad Space
      </div>
    </div>
  );
}
