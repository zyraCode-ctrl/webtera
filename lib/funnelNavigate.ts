/** Time to keep our transition overlay visible after opening the sponsor tab so the hop feels deliberate. */
export const FUNNEL_GATE_TO_NEXT_MS = 900;

export type OpenGateThenNavigateResult = {
  /** `true` when `window.open` returned null (often a blocked popup). */
  popupLikelyBlocked: boolean;
  cancel: () => void;
};

export type OpenGateThenNavigateDeps = {
  openGateTab: (url: string) => Window | null;
  navigateTo: (url: string) => void;
  /** Runs `fn` after `ms`; returns a function that cancels it. Avoids exposing timer-handle typing differences (DOM vs Node). */
  afterDelay: (fn: () => void, ms: number) => () => void;
};

function browserDeps(): OpenGateThenNavigateDeps {
  return {
    openGateTab(url) {
      try {
        return window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        return null;
      }
    },
    navigateTo(url) {
      window.location.assign(url);
    },
    afterDelay(fn, ms) {
      const id = window.setTimeout(fn, ms);
      return () => window.clearTimeout(id);
    },
  };
}

function serverStubDeps(): OpenGateThenNavigateDeps {
  return {
    openGateTab: () => null,
    navigateTo: () => {},
    afterDelay(fn, ms) {
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
  };
}

function resolveDeps(overrides?: Partial<OpenGateThenNavigateDeps>): OpenGateThenNavigateDeps {
  const base = typeof window === "undefined" ? serverStubDeps() : browserDeps();
  return { ...base, ...overrides };
}

/**
 * Opens the sponsor URL in a new tab (same user gesture as the click) and navigates this tab shortly after.
 */
export function openGateThenNavigate(
  nextUrl: string,
  gateUrl: string,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const w = d.openGateTab(gateUrl);
  const popupLikelyBlocked = w == null;
  const cancelNavigate = d.afterDelay(() => {
    d.navigateTo(nextUrl);
  }, FUNNEL_GATE_TO_NEXT_MS);
  return {
    popupLikelyBlocked,
    cancel: cancelNavigate,
  };
}

/**
 * Opens the sponsor URL in a new tab, then runs `callback` in this tab after {@link FUNNEL_GATE_TO_NEXT_MS}.
 * Use when staying on the same page (e.g. scroll to an anchor) instead of navigating away.
 */
export function openGateThenCallback(
  gateUrl: string,
  callback: () => void,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const w = d.openGateTab(gateUrl);
  const popupLikelyBlocked = w == null;
  const cancelCallback = d.afterDelay(() => {
    callback();
  }, FUNNEL_GATE_TO_NEXT_MS);
  return {
    popupLikelyBlocked,
    cancel: cancelCallback,
  };
}

/**
 * Opens `gateUrl` in a new tab once per "pass", waiting {@link FUNNEL_GATE_TO_NEXT_MS} between passes,
 * then navigates this tab to `nextUrl`. Use for multi-step sponsor flows (e.g. preview play).
 */
export function openGateChainThenNavigate(
  nextUrl: string,
  gateUrl: string,
  gatePasses: number,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  if (gatePasses <= 0) {
    d.navigateTo(nextUrl);
    return { popupLikelyBlocked: false, cancel: () => {} };
  }

  let cancelled = false;
  let cancelTimer: (() => void) | null = null;
  let anyPopupBlocked = false;

  const runStep = (passesLeft: number) => {
    if (cancelled) return;
    if (passesLeft <= 0) {
      d.navigateTo(nextUrl);
      return;
    }
    const w = d.openGateTab(gateUrl);
    if (w == null) anyPopupBlocked = true;
    cancelTimer = d.afterDelay(() => {
      runStep(passesLeft - 1);
    }, FUNNEL_GATE_TO_NEXT_MS);
  };

  runStep(gatePasses);

  return {
    popupLikelyBlocked: anyPopupBlocked,
    cancel: () => {
      cancelled = true;
      cancelTimer?.();
    },
  };
}
