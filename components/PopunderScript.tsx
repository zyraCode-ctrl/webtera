import Script from "next/script";
import { funnelAdUrl, popunderScriptSrc } from "@/lib/funnelConfig";

/**
 * Site-wide Adsterra popunder script.
 * Skipped when `NEXT_PUBLIC_FUNNEL_GATE_URL` is set (tab-shift uses that direct URL instead).
 */
export function PopunderScript() {
  if (funnelAdUrl) return null;
  if (!popunderScriptSrc) return null;
  return <Script src={popunderScriptSrc} strategy="afterInteractive" />;
}
