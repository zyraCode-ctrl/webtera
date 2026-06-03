/** Brief delay so the global popunder script can attach to the user gesture before navigation. */
export const FUNNEL_GATE_TO_NEXT_MS = 900;

export type OpenGateThenNavigateResult = {
  /** Kept for API compatibility; popunder does not use popup tabs. */
  popupLikelyBlocked: boolean;
  cancel: () => void;
};

export type OpenGateThenNavigateDeps = {
  navigateTo: (url: string) => void;
  /** Runs `fn` after `ms`; returns a function that cancels it. Avoids exposing timer-handle typing differences (DOM vs Node). */
  afterDelay: (fn: () => void, ms: number) => () => void;
};

function browserDeps(): OpenGateThenNavigateDeps {
  return {
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
 * Waits briefly (popunder runs site-wide), then navigates this tab to `nextUrl`.
 * `gateUrl` / `gatePasses` are ignored — kept for stable call sites during the popunder migration.
 */
export function openGateThenNavigate(
  nextUrl: string,
  _gateUrl?: string,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const cancelNavigate = d.afterDelay(() => {
    d.navigateTo(nextUrl);
  }, FUNNEL_GATE_TO_NEXT_MS);
  return {
    popupLikelyBlocked: false,
    cancel: cancelNavigate,
  };
}

/**
 * Runs `callback` after {@link FUNNEL_GATE_TO_NEXT_MS} (popunder attaches on the same click).
 */
export function openGateThenCallback(
  _gateUrl: string,
  callback: () => void,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  const d = resolveDeps(overrides);
  const cancelCallback = d.afterDelay(() => {
    callback();
  }, FUNNEL_GATE_TO_NEXT_MS);
  return {
    popupLikelyBlocked: false,
    cancel: cancelCallback,
  };
}

/** Same as {@link openGateThenNavigate}; chain passes are no longer used with one popunder per page. */
export function openGateChainThenNavigate(
  nextUrl: string,
  _gateUrl?: string,
  gatePasses?: number,
  overrides?: Partial<OpenGateThenNavigateDeps>
): OpenGateThenNavigateResult {
  if (gatePasses != null && gatePasses <= 0) {
    const d = resolveDeps(overrides);
    d.navigateTo(nextUrl);
    return { popupLikelyBlocked: false, cancel: () => {} };
  }
  return openGateThenNavigate(nextUrl, _gateUrl, overrides);
}
