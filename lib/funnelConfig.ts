const DEFAULT_POPUNDER_SCRIPT_SRC =
  "https://glamournakedemployee.com/65/4e/dc/654edcc7943830a5fe010bc8cdbfe556.js";

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

export const popunderScriptSrc =
  sanitizeScriptSrc(process.env.NEXT_PUBLIC_POPUNDER_SCRIPT_SRC) ||
  DEFAULT_POPUNDER_SCRIPT_SRC;

const DEFAULT_RATE_URL = "https://example.com/rate-us";

/** Store/review page (set NEXT_PUBLIC_FUNNEL_RATE_URL in production). */
export const funnelRateUrl =
  sanitizeHttpUrl(process.env.NEXT_PUBLIC_FUNNEL_RATE_URL) || DEFAULT_RATE_URL;
