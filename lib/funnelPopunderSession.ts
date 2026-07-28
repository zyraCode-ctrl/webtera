/**
 * Reverse-popunder journey gates (once per step per tab), plus handoff so a
 * newly opened content tab does not re-fire the step that just ran — and so
 * "Back to search" can reset the whole journey (sessionStorage is often cloned
 * into window.open tabs).
 */

export type PopunderHandoffStep = "search" | "card" | "video" | "reset";

const HANDOFF_PARAM = "wt_pu";

const SEARCH_FIRED_KEY = "webtera_pu_search_fired";
const CARD_FIRED_KEY = "webtera_pu_card_fired";
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

function ssRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function clearPopunderFlags() {
  ssRemove(SEARCH_FIRED_KEY);
  ssRemove(CARD_FIRED_KEY);
  ssRemove(VIDEO_PLAY_FIRED_KEY);
}

function markSearchFired() {
  ssSet(SEARCH_FIRED_KEY, "1");
}

function markCardFired() {
  ssSet(CARD_FIRED_KEY, "1");
}

function markVideoFired() {
  ssSet(VIDEO_PLAY_FIRED_KEY, "1");
}

/**
 * Apply journey state for a content tab opened after a popunder.
 * Clears cloned flags first, then marks steps already completed.
 */
export function applyPopunderHandoff(step: PopunderHandoffStep) {
  clearPopunderFlags();
  switch (step) {
    case "reset":
      return;
    case "search":
      markSearchFired();
      return;
    case "card":
      markSearchFired();
      markCardFired();
      return;
    case "video":
      markSearchFired();
      markCardFired();
      markVideoFired();
      return;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

/** Append `wt_pu` so the content tab can sync journey gates after tab-shift. */
export function withPopunderHandoff(url: string, step: PopunderHandoffStep): string {
  try {
    const base =
      typeof window !== "undefined" ? window.location.href : "http://local.invalid/";
    const u = new URL(url, base);
    u.searchParams.set(HANDOFF_PARAM, step);
    if (!/^https?:\/\//i.test(url)) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
    return u.href;
  } catch {
    const join = url.includes("?") ? "&" : "?";
    return `${url}${join}${HANDOFF_PARAM}=${encodeURIComponent(step)}`;
  }
}

/**
 * If the URL has `wt_pu`, apply handoff flags and strip the param via replaceState.
 * Call once on funnel page mount (layout effect).
 */
export function applyPopunderHandoffFromLocation(): PopunderHandoffStep | null {
  if (typeof window === "undefined") return null;
  try {
    const u = new URL(window.location.href);
    const raw = u.searchParams.get(HANDOFF_PARAM);
    if (raw !== "search" && raw !== "card" && raw !== "video" && raw !== "reset") {
      return null;
    }
    applyPopunderHandoff(raw);
    u.searchParams.delete(HANDOFF_PARAM);
    const next = `${u.pathname}${u.search}${u.hash}`;
    window.history.replaceState(window.history.state, "", next);
    return raw;
  } catch {
    return null;
  }
}

/** First search focus this journey → fire popunder once, then allow typing. */
export function consumeSearchPopunder(): boolean {
  if (ssGet(SEARCH_FIRED_KEY) === "1") return false;
  markSearchFired();
  return true;
}

/** First Play / Full Video click this journey → fire reverse popunder. */
export function consumeCardPopunder(): boolean {
  if (ssGet(CARD_FIRED_KEY) === "1") return false;
  markCardFired();
  return true;
}

/** First gated video play this journey → fire popunder; next play opens the gate. */
export function consumeVideoPlayPopunder(): boolean {
  if (ssGet(VIDEO_PLAY_FIRED_KEY) === "1") return false;
  markVideoFired();
  return true;
}
