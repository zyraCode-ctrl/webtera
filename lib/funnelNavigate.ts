import { funnelAdUrl } from "@/lib/funnelConfig";

/** Overlay flash only — tab-shift runs synchronously inside the click gesture. */
export const FUNNEL_GATE_TO_NEXT_MS = 0;

export type OpenGateThenNavigateResult = {
  /** True when `window.open` was blocked and we fell back to in-tab navigation. */
  popupLikelyBlocked: boolean;
  /** True when this tab did not navigate away (script-mode / content tab only). */
  stayedOnPage: boolean;
  cancel: () => void;
};

export type OpenGateThenNavigateDeps = {
  navigateTo: (url: string) => void;
  openTab: (url: string) => Window | null;
  afterDelay: (fn: () => void, ms: number) => () => void;
  /**
   * When true (Telegram / Instagram / Facebook in-app browsers), open the ad
   * externally and keep this view on content — reverse popunder would leave the
   * user stuck on the ad inside a single WebView.
   */
  preferContentTab?: boolean;
};

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

/** Single-webview / in-app browsers where reverse popunder focus cannot work. */
export function isInAppBrowser(
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
  win: Window | null = typeof window !== "undefined" ? window : null
): boolean {
  if (win) {
    const extended = win as Window & {
      TelegramWebviewProxy?: unknown;
      Telegram?: { WebApp?: unknown };
    };
    if (extended.TelegramWebviewProxy || extended.Telegram?.WebApp) return true;
  }
  return /Telegram|FBAN|FBAV|Instagram|Line\//i.test(userAgent || "");
}

/**
 * Open a background tab without granting it opener privileges longer than needed.
 * Uses about:blank first so the destination load is less likely to steal focus
 * than `window.open(dest)` directly.
 */
function openBackgroundTab(url: string): Window | null {
  const tab = window.open("about:blank", "_blank");
  if (!tab) return null;
  try {
    tab.location.replace(url);
  } catch {
    try {
      tab.location.href = url;
    } catch {
      /* ignore cross-window assignment failures */
    }
  }
  return tab;
}

function browserDeps(): OpenGateThenNavigateDeps {
  return {
    navigateTo(url) {
      window.location.assign(url);
    },
    openTab(url) {
      return openBackgroundTab(url);
    },
    afterDelay(fn, ms) {
      if (ms <= 0) {
        fn();
        return () => {};
      }
      const id = window.setTimeout(fn, ms);
      return () => window.clearTimeout(id);
    },
    preferContentTab: isInAppBrowser(),
  };
}

function serverStubDeps(): OpenGateThenNavigateDeps {
  return {
    navigateTo: () => {},
    openTab: () => null,
    afterDelay(fn, ms) {
      if (ms <= 0) {
        fn();
        return () => {};
      }
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
    preferContentTab: false,
  };
}

function resolveDeps(overrides?: Partial<OpenGateThenNavigateDeps>): OpenGateThenNavigateDeps {
  const base = typeof window === "undefined" ? serverStubDeps() : browserDeps();
  return { ...base, ...overrides };
}

function resolveAdUrl(explicit?: string): string {
  const fromArg = explicit?.trim() || "";
  if (fromArg.startsWith("http://") || fromArg.startsWith("https://")) return fromArg;
  return funnelAdUrl;
}

function keepAdFocused(contentTab: Window) {
  try {
    contentTab.blur();
  } catch {
    /* ignore */
  }
  try {
    window.focus();
  } catch {
    /* ignore */
  }
}

/**
 * Reverse popunder (tab-shift):
 * 1. Open destination (`contentUrl`) in a NEW background tab.
 * 2. Redirect THIS tab to the ad and keep it focused.
 *
 * In-app browsers (Telegram, etc.): open ad externally, navigate this view to content.
 */
function tabShiftToAd(
  contentUrl: string,
  adUrl: string,
  d: OpenGateThenNavigateDeps,
  blockedFallback: "content" | "stay"
): OpenGateThenNavigateResult {
  if (d.preferContentTab) {
    const adTab = d.openTab(adUrl);
    d.navigateTo(contentUrl);
    return {
      popupLikelyBlocked: !adTab,
      stayedOnPage: false,
      cancel: () => {},
    };
  }

  const contentTab = d.openTab(contentUrl);

  if (!contentTab) {
    if (blockedFallback === "content") {
      d.navigateTo(contentUrl);
      return { popupLikelyBlocked: true, stayedOnPage: false, cancel: () => {} };
    }
    return { popupLikelyBlocked: true, stayedOnPage: true, cancel: () => {} };
  }

  keepAdFocused(contentTab);
  // One more focus pass after the browser finishes activating the new tab.
  d.afterDelay(() => keepAdFocused(contentTab), 0);
  d.navigateTo(adUrl);
  return { popupLikelyBlocked: false, stayedOnPage: false, cancel: () => {} };
}

/**
 * Reverse popunder (tab-shift):
 * 1. Open destination (`nextUrl`) in a NEW tab.
 * 2. If an ad URL is configured, redirect THIS tab to the ad (stays focused).
 * 3. If no ad URL, keep THIS tab on the page so the Adsterra popunder script
 *    (loaded site-wide) can monetize the same click — we do not navigate away.
 */
export function openGateThenNavigate(
  nextUrl: string,
  gateUrl?: string,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const adUrl = resolveAdUrl(gateUrl);
  const dest = toAbsoluteUrl(nextUrl);

  if (!adUrl) {
    const contentTab = d.openTab(dest);
    if (!contentTab) {
      d.navigateTo(dest);
      return { popupLikelyBlocked: true, stayedOnPage: false, cancel: () => {} };
    }
    return { popupLikelyBlocked: false, stayedOnPage: true, cancel: () => {} };
  }

  return tabShiftToAd(dest, adUrl, d, "content");
}

/**
 * When ad URL is set: open current page in a new tab, send this tab to the ad.
 * Otherwise run `callback` in place (popunder script can still attach to the click).
 */
export function openGateThenCallback(
  gateUrl: string,
  callback: () => void,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const adUrl = resolveAdUrl(gateUrl);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!adUrl || !currentUrl) {
    callback();
    return { popupLikelyBlocked: false, stayedOnPage: true, cancel: () => {} };
  }

  if (d.preferContentTab) {
    const adTab = d.openTab(adUrl);
    callback();
    return {
      popupLikelyBlocked: !adTab,
      stayedOnPage: true,
      cancel: () => {},
    };
  }

  const contentTab = d.openTab(currentUrl);
  if (!contentTab) {
    callback();
    return { popupLikelyBlocked: true, stayedOnPage: true, cancel: () => {} };
  }

  keepAdFocused(contentTab);
  d.afterDelay(() => keepAdFocused(contentTab), 0);
  d.navigateTo(adUrl);
  return { popupLikelyBlocked: false, stayedOnPage: false, cancel: () => {} };
}

/**
 * Reverse popunder while staying on the same logical page:
 * new tab keeps `stayUrl` (defaults to current href); current tab → ad.
 * Use for search focus / in-page video play.
 */
export function fireReversePopunder(
  stayUrl?: string,
  gateUrl?: string,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const adUrl = resolveAdUrl(gateUrl);
  const contentUrl = toAbsoluteUrl(
    stayUrl || (typeof window !== "undefined" ? window.location.href : "")
  );

  if (!adUrl || !contentUrl) {
    return { popupLikelyBlocked: false, stayedOnPage: true, cancel: () => {} };
  }

  if (d.preferContentTab) {
    const adTab = d.openTab(adUrl);
    // Stay on this view — content is already here; only push ad out.
    return {
      popupLikelyBlocked: !adTab,
      stayedOnPage: true,
      cancel: () => {},
    };
  }

  return tabShiftToAd(contentUrl, adUrl, d, "stay");
}

/** Navigate this tab to `nextUrl` with no ad (quota exhausted / skip). */
export function navigateDestinationOnly(
  nextUrl: string,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  d.navigateTo(toAbsoluteUrl(nextUrl));
  return { popupLikelyBlocked: false, stayedOnPage: false, cancel: () => {} };
}

/** Same as {@link openGateThenNavigate}. `gatePasses <= 0` skips the ad. */
export function openGateChainThenNavigate(
  nextUrl: string,
  gateUrl?: string,
  gatePasses?: number,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  if (gatePasses != null && gatePasses <= 0) {
    return navigateDestinationOnly(nextUrl, overrides);
  }
  return openGateThenNavigate(nextUrl, gateUrl, overrides);
}
