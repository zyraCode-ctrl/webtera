const STORAGE_PREFIX = "webtera_preview_play_count:";

export function getPreviewPlayCount(postId: string): number {
  if (typeof sessionStorage === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + postId);
    const n = parseInt(raw ?? "0", 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Returns the new total click count after this action (1-based for the user's Nth tap). */
export function bumpPreviewPlayCount(postId: string): number {
  const next = getPreviewPlayCount(postId) + 1;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + postId, String(next));
  } catch {
    // ignore quota / privacy mode
  }
  return next;
}
