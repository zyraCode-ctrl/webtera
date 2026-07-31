import test from "node:test";
import assert from "node:assert/strict";
import { funnelOutPath } from "../lib/funnelRef";
import {
  fireReversePopunder,
  isInAppBrowser,
  navigateDestinationOnly,
  openGateThenCallback,
  openGateChainThenNavigate,
  openGateThenNavigate,
} from "../lib/funnelNavigate";

type FakeWin = { blur: () => void };

type Trace = {
  navigated: string[];
  opened: string[];
  blurCount: number;
  focusPasses: number;
};

function makeTrace(): Trace {
  return { navigated: [], opened: [], blurCount: 0, focusPasses: 0 };
}

function testDeps(
  trace: Trace,
  opts?: {
    openTab?: (url: string) => FakeWin | null;
    preferContentTab?: boolean;
    afterDelaySync?: boolean;
  }
) {
  return {
    navigateTo(url: string) {
      trace.navigated.push(url);
    },
    openTab(url: string) {
      if (opts?.openTab) {
        const win = opts.openTab(url);
        if (win) trace.opened.push(url);
        return win as unknown as Window | null;
      }
      trace.opened.push(url);
      return {
        blur() {
          trace.blurCount += 1;
        },
      } as unknown as Window;
    },
    afterDelay(fn: () => void, ms: number) {
      trace.focusPasses += 1;
      if (ms <= 0 || opts?.afterDelaySync !== false) {
        fn();
        return () => {};
      }
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
    preferContentTab: opts?.preferContentTab ?? false,
  };
}

function withFakeWindow<T>(href: string, run: () => T): T {
  const prev = (globalThis as { window?: unknown }).window;
  Object.defineProperty(globalThis, "window", {
    value: {
      location: { href, assign() {} },
      focus() {},
      open() {
        return null;
      },
    },
    configurable: true,
    writable: true,
  });
  try {
    return run();
  } finally {
    if (prev === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Object.defineProperty(globalThis, "window", {
        value: prev,
        configurable: true,
        writable: true,
      });
    }
  }
}

// ─── Desktop reverse popunder (ad in current tab) ───────────────────────────

test("desktop: content opens in new tab, current tab navigates to ad", () => {
  const trace = makeTrace();
  const target = funnelOutPath("7", "video");
  const ad = "https://ads.example/gate";

  const result = openGateThenNavigate(target, ad, testDeps(trace));

  assert.equal(result.popupLikelyBlocked, false);
  assert.equal(result.stayedOnPage, false);
  assert.equal(trace.opened.length, 1);
  assert.ok(
    trace.opened[0]!.includes("7") ||
      trace.opened[0] === target ||
      trace.opened[0]!.includes("/out/")
  );
  assert.deepEqual(trace.navigated, [ad]);
});

test("desktop: absolute destination URL is opened as-is before ad navigation", () => {
  const trace = makeTrace();
  const dest = "https://site.example/help/wt1.abc?f=video";
  const ad = "https://ads.example/smart";

  openGateThenNavigate(dest, ad, testDeps(trace));

  assert.deepEqual(trace.opened, [dest]);
  assert.deepEqual(trace.navigated, [ad]);
});

test("desktop: content tab is blurred so ad tab keeps focus", () => {
  const trace = makeTrace();

  openGateThenNavigate(
    "https://site.example/help/1",
    "https://ads.example/g",
    testDeps(trace)
  );

  // keepAdFocused once immediately + once via afterDelay(0)
  assert.ok(trace.blurCount >= 2, `expected >=2 blur calls, got ${trace.blurCount}`);
  assert.ok(trace.focusPasses >= 1);
  assert.deepEqual(trace.navigated, ["https://ads.example/g"]);
});

test("desktop: open happens before navigate (order matters for reverse popunder)", () => {
  const order: string[] = [];
  openGateThenNavigate("https://site.example/c", "https://ads.example/a", {
    navigateTo(url) {
      order.push(`nav:${url}`);
    },
    openTab(url) {
      order.push(`open:${url}`);
      return { blur() {} } as unknown as Window;
    },
    afterDelay(fn) {
      fn();
      return () => {};
    },
    preferContentTab: false,
  });

  assert.deepEqual(order, [
    "open:https://site.example/c",
    "nav:https://ads.example/a",
  ]);
});

test("desktop fireReversePopunder: stay URL in new tab, current → ad", () => {
  const trace = makeTrace();
  const stay = "https://site.example/go?q=1";
  const ad = "https://ads.example/g";

  const result = fireReversePopunder(stay, ad, testDeps(trace));

  assert.equal(result.stayedOnPage, false);
  assert.equal(result.popupLikelyBlocked, false);
  assert.deepEqual(trace.opened, [stay]);
  assert.deepEqual(trace.navigated, [ad]);
});

test("desktop openGateThenCallback: clones current page, current → ad", () => {
  const trace = makeTrace();
  let callbackRan = 0;

  const result = withFakeWindow("https://site.example/go", () =>
    openGateThenCallback(
      "https://ads.example/g",
      () => {
        callbackRan += 1;
      },
      testDeps(trace)
    )
  );

  assert.equal(callbackRan, 0);
  assert.equal(result.stayedOnPage, false);
  assert.deepEqual(trace.opened, ["https://site.example/go"]);
  assert.deepEqual(trace.navigated, ["https://ads.example/g"]);
});

// ─── Popup blocked ──────────────────────────────────────────────────────────

test("popup blocked on navigate: falls back to same-tab content (no ad)", () => {
  const trace = makeTrace();
  const result = openGateThenNavigate("/x", "https://ads.example/g", {
    ...testDeps(trace, { openTab: () => null }),
  });

  assert.equal(result.popupLikelyBlocked, true);
  assert.equal(result.stayedOnPage, false);
  assert.equal(trace.opened.length, 0);
  assert.ok(trace.navigated[0]?.includes("/x") || trace.navigated[0] === "/x");
  assert.ok(!trace.navigated.some((u) => u.includes("ads.example")));
});

test("popup blocked on fireReversePopunder: stays on page (no navigate)", () => {
  const trace = makeTrace();
  const result = fireReversePopunder(
    "https://site.example/go",
    "https://ads.example/g",
    testDeps(trace, { openTab: () => null })
  );

  assert.equal(result.popupLikelyBlocked, true);
  assert.equal(result.stayedOnPage, true);
  assert.deepEqual(trace.navigated, []);
});

test("popup blocked on openGateThenCallback: runs callback in place", () => {
  const trace = makeTrace();
  let ran = 0;

  const result = withFakeWindow("https://site.example/go", () =>
    openGateThenCallback(
      "https://ads.example/g",
      () => {
        ran += 1;
      },
      testDeps(trace, { openTab: () => null })
    )
  );

  assert.equal(ran, 1);
  assert.equal(result.popupLikelyBlocked, true);
  assert.equal(result.stayedOnPage, true);
  assert.deepEqual(trace.navigated, []);
});

// ─── No ad URL / script mode ────────────────────────────────────────────────

test("no ad URL: opens content tab and stays on page for script monetization", () => {
  const trace = makeTrace();
  // Explicit non-http gate forces resolveAdUrl → funnelAdUrl; when env empty, ad is "".
  const adFromEnv =
    process.env.NEXT_PUBLIC_FUNNEL_GATE_URL ||
    process.env.NEXT_PUBLIC_FUNNEL_AD_URL ||
    "";
  if (adFromEnv.startsWith("http")) {
    // Env has a smartlink — skip this assertion (would tab-shift instead).
    return;
  }

  const result = openGateThenNavigate(
    "https://site.example/help/1",
    "not-a-url",
    testDeps(trace)
  );

  assert.equal(result.stayedOnPage, true);
  assert.equal(result.popupLikelyBlocked, false);
  assert.deepEqual(trace.opened, ["https://site.example/help/1"]);
  assert.deepEqual(trace.navigated, []);
});

test("openGateThenCallback without ad runs callback in place", () => {
  let ran = 0;
  const trace = makeTrace();
  const { stayedOnPage } = openGateThenCallback(
    "",
    () => {
      ran += 1;
    },
    testDeps(trace)
  );

  assert.equal(stayedOnPage, true);
  assert.equal(ran, 1);
  assert.deepEqual(trace.opened, []);
  assert.deepEqual(trace.navigated, []);
});

test("fireReversePopunder with empty ad stays on page and opens nothing", () => {
  const adFromEnv =
    process.env.NEXT_PUBLIC_FUNNEL_GATE_URL ||
    process.env.NEXT_PUBLIC_FUNNEL_AD_URL ||
    "";
  if (adFromEnv.startsWith("http")) return;

  const trace = makeTrace();
  const result = fireReversePopunder(
    "https://site.example/go",
    "",
    testDeps(trace)
  );

  assert.equal(result.stayedOnPage, true);
  assert.deepEqual(trace.opened, []);
  assert.deepEqual(trace.navigated, []);
});

// ─── In-app / Telegram (preferContentTab) ───────────────────────────────────

test("telegram/in-app navigate: ad opens externally, current view → content", () => {
  const trace = makeTrace();
  const content = "https://site.example/help/1";
  const ad = "https://ads.example/g";

  const result = openGateThenNavigate(
    content,
    ad,
    testDeps(trace, { preferContentTab: true })
  );

  assert.equal(result.popupLikelyBlocked, false);
  assert.equal(result.stayedOnPage, false);
  // Ad first (external), then this WebView goes to content — never reverse.
  assert.deepEqual(trace.opened, [ad]);
  assert.deepEqual(trace.navigated, [content]);
});

test("telegram/in-app: open order is ad then content navigate", () => {
  const order: string[] = [];
  openGateThenNavigate("https://site.example/c", "https://ads.example/a", {
    navigateTo(url) {
      order.push(`nav:${url}`);
    },
    openTab(url) {
      order.push(`open:${url}`);
      return { blur() {} } as unknown as Window;
    },
    afterDelay(fn) {
      fn();
      return () => {};
    },
    preferContentTab: true,
  });

  assert.deepEqual(order, [
    "open:https://ads.example/a",
    "nav:https://site.example/c",
  ]);
});

test("telegram fireReversePopunder: opens ad externally, does not leave page", () => {
  const trace = makeTrace();
  const result = fireReversePopunder(
    "https://site.example/go",
    "https://ads.example/g",
    testDeps(trace, { preferContentTab: true })
  );

  assert.equal(result.stayedOnPage, true);
  assert.equal(result.popupLikelyBlocked, false);
  assert.deepEqual(trace.opened, ["https://ads.example/g"]);
  assert.deepEqual(trace.navigated, []);
});

test("telegram openGateThenCallback: opens ad externally, runs callback, stays", () => {
  const trace = makeTrace();
  let ran = 0;

  const result = withFakeWindow("https://site.example/go", () =>
    openGateThenCallback(
      "https://ads.example/g",
      () => {
        ran += 1;
      },
      testDeps(trace, { preferContentTab: true })
    )
  );

  assert.equal(ran, 1);
  assert.equal(result.stayedOnPage, true);
  assert.deepEqual(trace.opened, ["https://ads.example/g"]);
  assert.deepEqual(trace.navigated, []);
});

test("telegram navigate: if external ad open blocked, still goes to content", () => {
  const trace = makeTrace();
  const result = openGateThenNavigate(
    "https://site.example/help/1",
    "https://ads.example/g",
    testDeps(trace, { preferContentTab: true, openTab: () => null })
  );

  assert.equal(result.popupLikelyBlocked, true);
  assert.equal(result.stayedOnPage, false);
  assert.deepEqual(trace.navigated, ["https://site.example/help/1"]);
});

// ─── Chain / skip helpers ───────────────────────────────────────────────────

test("openGateChainThenNavigate with ad URL tab-shifts like openGateThenNavigate", () => {
  const trace = makeTrace();
  openGateChainThenNavigate(
    "https://final.example/dest",
    "https://ads.example/g",
    2,
    testDeps(trace)
  );

  assert.deepEqual(trace.opened, ["https://final.example/dest"]);
  assert.deepEqual(trace.navigated, ["https://ads.example/g"]);
});

test("openGateChainThenNavigate with 0 passes skips ad entirely", () => {
  const trace = makeTrace();
  openGateChainThenNavigate(
    "https://final.example/n",
    "https://ads.example/g",
    0,
    testDeps(trace)
  );

  assert.deepEqual(trace.opened, []);
  assert.deepEqual(trace.navigated, ["https://final.example/n"]);
});

test("navigateDestinationOnly never opens a tab", () => {
  const trace = makeTrace();
  const result = navigateDestinationOnly("https://site.example/only", testDeps(trace));

  assert.equal(result.stayedOnPage, false);
  assert.deepEqual(trace.opened, []);
  assert.deepEqual(trace.navigated, ["https://site.example/only"]);
});

// ─── Env / gate URL resolution ──────────────────────────────────────────────

test("empty gate string uses configured smartlink when funnelAdUrl is set", () => {
  const trace = makeTrace();
  const adFromEnv =
    process.env.NEXT_PUBLIC_FUNNEL_GATE_URL ||
    process.env.NEXT_PUBLIC_FUNNEL_AD_URL ||
    "";
  if (!adFromEnv.startsWith("http")) {
    openGateThenNavigate(
      "/help/wt1.x",
      "https://ads.example/explicit",
      testDeps(trace)
    );
    assert.equal(trace.opened.length, 1);
    assert.deepEqual(trace.navigated, ["https://ads.example/explicit"]);
    return;
  }

  openGateThenNavigate("/help/wt1.x", "", testDeps(trace));
  assert.equal(trace.opened.length, 1);
  assert.equal(trace.navigated.length, 1);
  assert.match(trace.navigated[0]!, /^https:\/\//);
});

test("whitespace-only explicit gate falls through to funnelAdUrl / empty", () => {
  const adFromEnv =
    process.env.NEXT_PUBLIC_FUNNEL_GATE_URL ||
    process.env.NEXT_PUBLIC_FUNNEL_AD_URL ||
    "";
  if (adFromEnv.startsWith("http")) return;

  const trace = makeTrace();
  const result = openGateThenNavigate(
    "https://site.example/c",
    "   ",
    testDeps(trace)
  );

  // No valid ad → script mode (stay) if tab opens
  assert.equal(result.stayedOnPage, true);
  assert.deepEqual(trace.navigated, []);
});

// ─── isInAppBrowser detection ───────────────────────────────────────────────

test("isInAppBrowser detects Telegram, Instagram, Facebook, Line UAs", () => {
  assert.equal(isInAppBrowser("Mozilla/5.0 Telegram"), true);
  assert.equal(isInAppBrowser("Something Instagram Something"), true);
  assert.equal(isInAppBrowser("Mozilla FBAN/FBIOS"), true);
  assert.equal(isInAppBrowser("Mozilla FBAV/1.0"), true);
  assert.equal(isInAppBrowser("Mozilla Line/12.0"), true);
});

test("isInAppBrowser rejects normal mobile/desktop UAs", () => {
  assert.equal(
    isInAppBrowser(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0"
    ),
    false
  );
  assert.equal(
    isInAppBrowser(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1"
    ),
    false
  );
  assert.equal(isInAppBrowser(""), false);
});

test("isInAppBrowser detects Telegram WebApp / WebviewProxy globals", () => {
  const fakeWin = {
    TelegramWebviewProxy: {},
  } as unknown as Window;
  assert.equal(isInAppBrowser("Mozilla/5.0", fakeWin), true);

  const fakeWebApp = {
    Telegram: { WebApp: {} },
  } as unknown as Window;
  assert.equal(isInAppBrowser("Mozilla/5.0", fakeWebApp), true);

  assert.equal(isInAppBrowser("Mozilla/5.0", {} as Window), false);
});
