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

function browserDeps(): OpenGateThenNavigateDeps {
  return {
    navigateTo(url) {
      window.location.assign(url);
    },
    openTab(url) {
      return window.open(url, "_blank");
    },
    afterDelay(fn, ms) {
      if (ms <= 0) {
        fn();
        return () => {};
      }
      const id = window.setTimeout(fn, ms);
      return () => window.clearTimeout(id);
    },
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

  const contentTab = d.openTab(dest);

  if (!contentTab) {
    // Popup blocked — fall back to same-tab navigation to the destination.
    d.navigateTo(dest);
    return { popupLikelyBlocked: true, stayedOnPage: false, cancel: () => {} };
  }

  keepAdFocused(contentTab);

  if (adUrl) {
    d.navigateTo(adUrl);
    return { popupLikelyBlocked: false, stayedOnPage: false, cancel: () => {} };
  }

  // No GATE_URL: content is in the new tab; this tab stays for the popunder script.
  return { popupLikelyBlocked: false, stayedOnPage: true, cancel: () => {} };
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

  const contentTab = d.openTab(currentUrl);
  if (!contentTab) {
    callback();
    return { popupLikelyBlocked: true, stayedOnPage: true, cancel: () => {} };
  }

  keepAdFocused(contentTab);
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

  const contentTab = d.openTab(contentUrl);
  if (!contentTab) {
    return { popupLikelyBlocked: true, stayedOnPage: true, cancel: () => {} };
  }

  keepAdFocused(contentTab);
  d.navigateTo(adUrl);
  return { popupLikelyBlocked: false, stayedOnPage: false, cancel: () => {} };
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
