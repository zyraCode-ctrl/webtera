import Script from "next/script";
import { popunderScriptSrc } from "@/lib/funnelConfig";

/** One popunder script per site (vendor: place before closing `</head>`). */
export function PopunderScript() {
  if (!popunderScriptSrc) return null;
  return <Script src={popunderScriptSrc} strategy="beforeInteractive" />;
}
