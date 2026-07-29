function sanitizeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function sanitizeScriptSrc(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Direct ad landing URL for reverse popunder (tab-shift).
 * Set `NEXT_PUBLIC_FUNNEL_GATE_URL` or `NEXT_PUBLIC_FUNNEL_AD_URL` in env (no hardcoded fallback —
 * keeps secrets scanners / repo free of live smartlink URLs).
 */
export const funnelAdUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_GATE_URL) ||
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_AD_URL) ||
  "";

/**
 * Legacy Adsterra popunder .js — disabled by default (smartlink tab-shift replaces it).
 * Set `NEXT_PUBLIC_POPUNDER_SCRIPT_SRC` only if you need the old script fallback.
 */
export const popunderScriptSrc =
  sanitizeScriptSrc(process.env.NEXT_PUBLIC_POPUNDER_SCRIPT_SRC) || "";

const DEFAULT_RATE_URL = "https://example.com/rate-us";

/** Store/review page (set NEXT_PUBLIC_FUNNEL_RATE_URL in production). */
export const funnelRateUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_RATE_URL) || DEFAULT_RATE_URL;
