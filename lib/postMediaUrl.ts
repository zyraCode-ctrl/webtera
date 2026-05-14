/**
 * Decide how to present a post "link" URL on the help page (video vs iframe vs open externally).
 */

export type PostMediaPresentation =
  | { kind: "direct-video"; url: string }
  | { kind: "iframe-embed"; url: string }
  | { kind: "external"; url: string };

export function getPostMediaPresentation(url: string | undefined): PostMediaPresentation | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  } catch {
    return null;
  }

  if (/\.(mp4|webm|ogg|m4v)(\?|#|$)/i.test(trimmed)) {
    return { kind: "direct-video", url: trimmed };
  }
  if (/embedframe|\/embed\/?(?:\?|$)/i.test(trimmed)) {
    return { kind: "iframe-embed", url: trimmed };
  }
  return { kind: "external", url: trimmed };
}
