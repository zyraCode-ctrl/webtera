export type TrackPayload = {
  event: string;
  path?: string;
  source?: string;
  postId?: string;
  meta?: Record<string, string | number | boolean | null>;
};

function getSessionId() {
  try {
    const key = "wt_analytics_sid_v1";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const sid = `sid_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    window.localStorage.setItem(key, sid);
    return sid;
  } catch {
    return `sid_fallback_${Date.now()}`;
  }
}

export function trackEvent(payload: TrackPayload) {
  try {
    const body = JSON.stringify({
      ...payload,
      sessionId: getSessionId(),
      at: new Date().toISOString(),
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }

    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics by design.
  }
}

