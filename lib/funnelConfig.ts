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

/**
 * Direct ad / gate landing URL for reverse popunder (tab-shift).
 * Set `NEXT_PUBLIC_FUNNEL_GATE_URL` in env — do not use third-party click-hijack scripts.
 */
export const funnelAdUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_GATE_URL) ||
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_AD_URL) ||
  "";

const DEFAULT_RATE_URL = "https://example.com/rate-us";

/** Store/review page (set NEXT_PUBLIC_FUNNEL_RATE_URL in production). */
export const funnelRateUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_RATE_URL) || DEFAULT_RATE_URL;
