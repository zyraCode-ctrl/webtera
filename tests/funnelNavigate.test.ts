import test from "node:test";
import assert from "node:assert/strict";
import { funnelOutPath } from "../lib/funnelRef";
import {
  openGateThenCallback,
  openGateChainThenNavigate,
  openGateThenNavigate,
} from "../lib/funnelNavigate";

type FakeWin = { blur: () => void };

/** Node test doubles — no browser. */
function testDeps(opts: {
  navigateTo: (url: string) => void;
  openTab?: (url: string) => FakeWin | null;
}) {
  return {
    navigateTo: opts.navigateTo,
    openTab(url: string) {
      if (opts.openTab) return opts.openTab(url) as unknown as Window | null;
      return { blur() {} } as unknown as Window;
    },
    afterDelay(fn: () => void, ms: number) {
      if (ms <= 0) {
        fn();
        return () => {};
      }
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
  };
}

test("openGateThenNavigate opens nextUrl in new tab then navigates current to ad", () => {
  const navigated: string[] = [];
  const opened: string[] = [];
  const target = funnelOutPath("7", "video");
  const ad = "https://ads.example/gate";

  const { popupLikelyBlocked } = openGateThenNavigate(target, ad, {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: (u) => {
        opened.push(u);
        return { blur() {} };
      },
    }),
  });

  assert.equal(popupLikelyBlocked, false);
  assert.deepEqual(opened, [target]);
  assert.deepEqual(navigated, [ad]);
});

test("openGateThenNavigate without http ad navigates current tab to nextUrl only", () => {
  const navigated: string[] = [];
  const opened: string[] = [];
  const target = "/help/wt1.x";

  openGateThenNavigate(target, "", {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: (u) => {
        opened.push(u);
        return { blur() {} };
      },
    }),
  });

  // Empty / non-http gate + empty env → destination only (no second tab).
  assert.deepEqual(opened, []);
  assert.deepEqual(navigated, [target]);
});

test("openGateThenNavigate reports popupLikelyBlocked when openTab returns null", () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked } = openGateThenNavigate("/x", "https://ads.example/g", {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: () => null,
    }),
  });

  assert.equal(popupLikelyBlocked, true);
  assert.deepEqual(navigated, ["/x"]);
});

test("openGateThenNavigate cancel is a no-op after sync tab-shift", () => {
  const navigated: string[] = [];
  const { cancel } = openGateThenNavigate("/y", "https://ads.example/g", {
    ...testDeps({ navigateTo: (u) => navigated.push(u) }),
  });
  cancel();
  assert.deepEqual(navigated, ["https://ads.example/g"]);
});

test("openGateThenNavigate passes absolute destination to openTab", () => {
  const opened: string[] = [];
  const navigated: string[] = [];
  const target = "https://pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev/video/x.mp4";
  openGateThenNavigate(target, "https://ads.example/g", {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: (u) => {
        opened.push(u);
        return { blur() {} };
      },
    }),
  });
  assert.deepEqual(opened, [target]);
  assert.deepEqual(navigated, ["https://ads.example/g"]);
});

test("openGateThenCallback without ad runs callback in place", () => {
  let ran = 0;
  const { popupLikelyBlocked } = openGateThenCallback("", () => {
    ran += 1;
  }, testDeps({ navigateTo: () => {} }));

  assert.equal(popupLikelyBlocked, false);
  assert.equal(ran, 1);
});

test("openGateThenCallback cancel is a no-op", () => {
  let ran = 0;
  const { cancel } = openGateThenCallback("", () => {
    ran += 1;
  }, testDeps({ navigateTo: () => {} }));
  cancel();
  assert.equal(ran, 1);
});

test("openGateChainThenNavigate tab-shifts like openGateThenNavigate", () => {
  const navigated: string[] = [];
  const opened: string[] = [];
  const { popupLikelyBlocked } = openGateChainThenNavigate(
    "https://final.example/dest",
    "https://ads.example/g",
    2,
    {
      ...testDeps({
        navigateTo: (u) => navigated.push(u),
        openTab: (u) => {
          opened.push(u);
          return { blur() {} };
        },
      }),
    }
  );

  assert.equal(popupLikelyBlocked, false);
  assert.deepEqual(opened, ["https://final.example/dest"]);
  assert.deepEqual(navigated, ["https://ads.example/g"]);
});

test("openGateChainThenNavigate with 0 passes navigates immediately", () => {
  const navigated: string[] = [];
  openGateChainThenNavigate("https://final.example/n", "https://ads.example/g", 0, {
    ...testDeps({ navigateTo: (u) => navigated.push(u) }),
  });
  assert.deepEqual(navigated, ["https://final.example/n"]);
});
