import Script from "next/script";
import { popunderScriptSrc } from "@/lib/funnelConfig";

/** One popunder script per site — load after hydration to avoid DOM mismatch errors. */
export function PopunderScript() {
  if (!popunderScriptSrc) return null;
  return <Script src={popunderScriptSrc} strategy="afterInteractive" />;
}
