const FALLBACK_EXTERNAL_URL =
  "https://glamournakedemployee.com/kbzj5m7n?key=3015ea85fcd181f0a2e0182ffff40304";

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

export const funnelDefaultExternalUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_DEFAULT_EXTERNAL_URL) || FALLBACK_EXTERNAL_URL;

export const funnelGateUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_GATE_URL) || funnelDefaultExternalUrl;

export const funnelHdUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_HD_URL) || funnelDefaultExternalUrl;

export const funnelRateUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_RATE_URL) || funnelDefaultExternalUrl;
