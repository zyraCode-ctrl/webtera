/**
 * links.ts — Per-post link registry
 *
 * EDIT THIS FILE to set the real links for each post.
 *
 * Structure:
 *   postLinks[postId]      = external HTTPS URL for non-R2 posts (R2 full video uses data/mediaRegistry.ts).
 *   Help page (?from=video): direct `.mp4` / R2 URLs play inline in a video player when allowed.
 *   Other URLs still open after the gated "Link"/continue flow where applicable.
 *   Legacy help layout (?from=download) may still show a scroll‑revealed Link button.
 *
 * downloadLinks[postId] = direct download / drive URL for that post.
 * rateUsUrl            = your Google Play / App Store / review page.
 */
import { funnelRateUrl } from "@/lib/funnelConfig";

function getAllowedOutboundHosts() {
  return (process.env.NEXT_PUBLIC_ALLOWED_OUTBOUND_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function isHostAllowed(hostname: string) {
  const allowedOutboundHosts = getAllowedOutboundHosts();
  if (allowedOutboundHosts.length === 0) return true;
  const host = hostname.toLowerCase();
  return allowedOutboundHosts.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function sanitizeOutboundUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    if (!isHostAllowed(parsed.hostname)) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

type LinkStatus = {
  url?: string;
  blocked: boolean;
};

function getLinkStatus(
  postId: string,
  source: Record<string, string>,
  kind: "post" | "download"
): LinkStatus {
  const raw = source[postId];
  if (!raw) return { url: undefined, blocked: false };
  const sanitized = sanitizeOutboundUrl(raw);
  if (!sanitized) {
    console.warn(`[links] Blocked ${kind} link for post ${postId}: ${raw}`);
    return { url: undefined, blocked: true };
  }
  return { url: sanitized, blocked: false };
}

// ─────────────────────────────────────────────
// Per-post main link (shown as "Link" button)
// ─────────────────────────────────────────────
const defaultPostLinks: Record<string, string> = Object.fromEntries(
  Array.from({ length: 2000 }, (_, i) => {
    const id = String(i + 1);
    return [id, `https://example.com/link/post-${id}`];
  })
);

export const postLinks: Record<string, string> = {
  ...defaultPostLinks,
  "28": "",
  "29": "",
};

// ─────────────────────────────────────────────
// Per-post download link (shown as "Download" button)
// ─────────────────────────────────────────────
const defaultDownloadLinks: Record<string, string> = Object.fromEntries(
  Array.from({ length: 2000 }, (_, i) => {
    const id = String(i + 1);
    return [id, `https://example.com/download/post-${id}`];
  })
);

export const downloadLinks: Record<string, string> = {
  ...defaultDownloadLinks,
  "28": ""
};

// ─────────────────────────────────────────────
// Rate Us / Review URL
// ─────────────────────────────────────────────
export const rateUsUrl = funnelRateUrl;

// ─────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────
export function getPostLink(postId: string): string | undefined {
  return getLinkStatus(postId, postLinks, "post").url;
}

export function getDownloadLink(postId: string): string | undefined {
  return getLinkStatus(postId, downloadLinks, "download").url;
}

export function getPostLinkStatus(postId: string): LinkStatus {
  return getLinkStatus(postId, postLinks, "post");
}

export function getDownloadLinkStatus(postId: string): LinkStatus {
  return getLinkStatus(postId, downloadLinks, "download");
}

export const __testables = {
  sanitizeOutboundUrl,
  isHostAllowed,
};
