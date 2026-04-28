/**
 * links.ts — Per-post link registry
 *
 * EDIT THIS FILE to set the real links for each post.
 *
 * Structure:
 *   postLinks[postId] = array of URLs
 *   The user will see a "Link" button on the help page.
 *   That button opens postLinks[postId][0] (first link).
 *
 * downloadLinks[postId] = direct download / drive URL for that post.
 * rateUsUrl            = your Google Play / App Store / review page.
 */
import { funnelHdUrl, funnelRateUrl } from "@/lib/funnelConfig";

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
  "28": "https://www.xvideos.com/embedframe/ouetolhf6c4",
  "29": "https://mega.nz/file/m5BBxK4S#FsdutUDSIhVvC5EuZ33zUETlg9C6iXhZKrM6drTv8mw",
  "30": "https://pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev/video/Indian%20College%20Ex%20girlfriends%20(1)(1)(1)(1).mp4",
  "31": "https://pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev/video/2024-08-17-14-10-53.mp4",
  "32": "https://pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev/video/WWW.RBDISK.COM%20%20DESI%20VIDEOS....video_2022-09-23_16-27-52(1)%20(1).mp4",
};

// ─────────────────────────────────────────────
// Per-post download link (shown as "Download" button)
// ─────────────────────────────────────────────
const defaultDownloadLinks: Record<string, string> = Object.fromEntries(
  Array.from({ length: 2000 }, (_, i) => {
    const id = String(i + 1);
    return [id, funnelHdUrl];
  })
);

export const downloadLinks: Record<string, string> = {
  ...defaultDownloadLinks,
  "28": "https://www.xvideos.com/embedframe/ouetolhf6c4"
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
