import type { MediaKind } from "@/data/mediaRegistry";
import { getMediaSource, hasMediaKind, isR2MediaSource } from "@/data/mediaRegistry";
import { getPostMediaPresentation } from "@/lib/postMediaUrl";

export type HelpVideoPresentation =
  | { mode: "gated"; kind: "full" }
  | { mode: "iframe"; url: string }
  | { mode: "external"; url: string }
  | null;

/** Client-safe URL: same-origin media API (cookie auth). Never exposes R2 path. */
export function mediaApiPath(postId: string, kind: MediaKind) {
  return `/api/media/${encodeURIComponent(postId)}?kind=${kind}`;
}

export function resolveHelpVideoPresentation(postId: string): HelpVideoPresentation {
  const full = getMediaSource(postId, "full");
  if (!full) return null;
  if (full.type === "r2") return { mode: "gated", kind: "full" };
  if (full.type === "placeholder") return null;
  const presentation = getPostMediaPresentation(full.url);
  if (!presentation) return null;
  if (presentation.kind === "iframe-embed") return { mode: "iframe", url: presentation.url };
  return { mode: "external", url: presentation.url };
}

/** External URL for Link button / navigation (non-R2 only). */
export function resolveHelpExternalLink(postId: string): string | undefined {
  const full = getMediaSource(postId, "full");
  if (!full || full.type !== "external") return undefined;
  return full.url;
}

export function postHasGatedFullVideo(postId: string) {
  const full = getMediaSource(postId, "full");
  return isR2MediaSource(full);
}

export { hasMediaKind };
