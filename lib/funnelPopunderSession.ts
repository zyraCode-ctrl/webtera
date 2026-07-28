/** Session quotas for reverse-popunder (tab-shift) placements. */

const SEARCH_FIRED_KEY = "webtera_pu_search_fired";
const CARD_REMAINING_KEY = "webtera_pu_card_remaining";
const CARD_INIT_KEY = "webtera_pu_card_init";
const VIDEO_PLAY_FIRED_KEY = "webtera_pu_video_play_fired";

function ssGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function ssSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** First search-box interaction this tab session → fire popunder once. */
export function consumeSearchPopunder(): boolean {
  if (ssGet(SEARCH_FIRED_KEY) === "1") return false;
  ssSet(SEARCH_FIRED_KEY, "1");
  return true;
}

/**
 * Play / Full Video share a random quota of 1 or 2 fires per tab session.
 * Returns true when this click should run the reverse popunder.
 */
export function consumeCardPopunder(): boolean {
  if (ssGet(CARD_INIT_KEY) !== "1") {
    const quota = Math.random() < 0.5 ? 1 : 2;
    ssSet(CARD_INIT_KEY, "1");
    ssSet(CARD_REMAINING_KEY, String(quota));
  }
  const remaining = Number.parseInt(ssGet(CARD_REMAINING_KEY) || "0", 10);
  if (!Number.isFinite(remaining) || remaining <= 0) return false;
  ssSet(CARD_REMAINING_KEY, String(remaining - 1));
  return true;
}

/** First gated video play this tab session → fire popunder once. */
export function consumeVideoPlayPopunder(): boolean {
  if (ssGet(VIDEO_PLAY_FIRED_KEY) === "1") return false;
  ssSet(VIDEO_PLAY_FIRED_KEY, "1");
  return true;
}
