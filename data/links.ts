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

// ─────────────────────────────────────────────
// Per-post main link (shown as "Link" button)
// ─────────────────────────────────────────────
export const postLinks: Record<string, string> = {
  ...Object.fromEntries(
    Array.from({ length: 50 }, (_, i) => {
      const id = String(i + 1);
      return [id, `https://example.com/link/post-${id}`];
    })
  ),
};

// ─────────────────────────────────────────────
// Per-post download link (shown as "Download" button)
// ─────────────────────────────────────────────
export const downloadLinks: Record<string, string> = {
  ...Object.fromEntries(
    Array.from({ length: 50 }, (_, i) => {
      const id = String(i + 1);
      return [id, `https://example.com/download/post-${id}`];
    })
  ),
};

// ─────────────────────────────────────────────
// Rate Us / Review URL
// ─────────────────────────────────────────────
export const rateUsUrl = "https://play.google.com/store/apps/details?id=YOUR_APP_ID";

// ─────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────
export function getPostLink(postId: string): string | undefined {
  return postLinks[postId];
}

export function getDownloadLink(postId: string): string | undefined {
  return downloadLinks[postId];
}
