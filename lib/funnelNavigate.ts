import { funnelAdUrl } from "@/lib/funnelConfig";

/**
 * Kept for overlay timing / API compatibility. Tab-shift itself is synchronous
 * (must run inside the user gesture so `window.open` is not blocked).
 */
export const FUNNEL_GATE_TO_NEXT_MS = 0;

export type OpenGateThenNavigateResult = {
  /** True when `window.open` was blocked and we fell back to in-tab navigation. */
  popupLikelyBlocked: boolean;
  cancel: () => void;
};

export type OpenGateThenNavigateDeps = {
  navigateTo: (url: string) => void;
  /** Open `url` in a new tab; return the Window or null if blocked. */
  openTab: (url: string) => Window | null;
  afterDelay: (fn: () => void, ms: number) => () => void;
};

function browserDeps(): OpenGateThenNavigateDeps {
  return {
    navigateTo(url) {
      window.location.assign(url);
    },
    openTab(url) {
      // Do not pass `noopener` — we need the Window handle to blur/focus for tab-shift.
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

/**
 * Reverse popunder (tab-shift) on a user gesture:
 * 1. Open the intended destination (`nextUrl`) in a new tab.
 * 2. Redirect the *current* (focused) tab to the ad URL.
 * 3. No third-party script listeners — one open + one assign only.
 *
 * If ad URL is missing or the new tab is blocked, navigates this tab to `nextUrl` only.
 */
export function openGateThenNavigate(
  nextUrl: string,
  gateUrl?: string,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const adUrl = resolveAdUrl(gateUrl);

  if (!adUrl) {
    d.navigateTo(nextUrl);
    return { popupLikelyBlocked: false, cancel: () => {} };
  }

  const contentTab = d.openTab(nextUrl);
  if (!contentTab) {
    d.navigateTo(nextUrl);
    return { popupLikelyBlocked: true, cancel: () => {} };
  }

  try {
    contentTab.blur();
  } catch {
    /* ignore cross-origin / closed */
  }
  try {
    window.focus();
  } catch {
    /* ignore */
  }

  d.navigateTo(adUrl);
  return { popupLikelyBlocked: false, cancel: () => {} };
}

/**
 * Tab-shift then run `callback` on the *new* tab is not possible from here.
 * When an ad URL is configured: open the current page in a new tab, send this tab to the ad.
 * Otherwise: run `callback` in-place (legacy path).
 */
export function openGateThenCallback(
  gateUrl: string,
  callback: () => void,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const adUrl = resolveAdUrl(gateUrl);
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  if (!adUrl || !currentUrl) {
    callback();
    return { popupLikelyBlocked: false, cancel: () => {} };
  }

  const contentTab = d.openTab(currentUrl);
  if (!contentTab) {
    callback();
    return { popupLikelyBlocked: true, cancel: () => {} };
  }

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

  d.navigateTo(adUrl);
  return { popupLikelyBlocked: false, cancel: () => {} };
}

/** Same tab-shift as {@link openGateThenNavigate}. `gatePasses <= 0` skips the ad. */
export function openGateChainThenNavigate(
  nextUrl: string,
  gateUrl?: string,
  gatePasses?: number,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  if (gatePasses != null && gatePasses <= 0) {
    const d = resolveDeps(overrides);
    d.navigateTo(nextUrl);
    return { popupLikelyBlocked: false, cancel: () => {} };
  }
  return openGateThenNavigate(nextUrl, gateUrl, overrides);
}
