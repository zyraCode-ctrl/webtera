import test from "node:test";
import assert from "node:assert/strict";
import { funnelOutPath } from "../lib/funnelRef";
import {
  openGateThenCallback,
  openGateChainThenNavigate,
  openGateThenNavigate,
} from "../lib/funnelNavigate";

type FakeWin = { blur: () => void };

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

test("tab-shift: opens destination in new tab, current tab goes to ad URL", () => {
  const navigated: string[] = [];
  const opened: string[] = [];
  const target = funnelOutPath("7", "video");
  const ad = "https://ads.example/gate";

  const { popupLikelyBlocked, stayedOnPage } = openGateThenNavigate(target, ad, {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: (u) => {
        opened.push(u);
        return { blur() {} };
      },
    }),
  });

  assert.equal(popupLikelyBlocked, false);
  assert.equal(stayedOnPage, false);
  assert.equal(opened.length, 1);
  assert.ok(opened[0]!.includes("7") || opened[0] === target || opened[0]!.endsWith(target) || opened[0]!.includes("/out/"));
  assert.deepEqual(navigated, [ad]);
});

test("empty gate string still uses configured smartlink (funnelAdUrl)", () => {
  const navigated: string[] = [];
  const opened: string[] = [];

  const { stayedOnPage } = openGateThenNavigate("/help/wt1.x", "", {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: (u) => {
        opened.push(u);
        return { blur() {} };
      },
    }),
  });

  assert.equal(stayedOnPage, false);
  assert.equal(opened.length, 1);
  assert.equal(navigated.length, 1);
  assert.match(navigated[0]!, /^https:\/\//);
});

test("popup blocked: falls back to same-tab destination", () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked, stayedOnPage } = openGateThenNavigate("/x", "https://ads.example/g", {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: () => null,
    }),
  });

  assert.equal(popupLikelyBlocked, true);
  assert.equal(stayedOnPage, false);
  assert.ok(navigated[0]?.includes("/x") || navigated[0] === "/x");
});

test("openGateThenCallback without ad runs callback in place", () => {
  let ran = 0;
  const { stayedOnPage } = openGateThenCallback("", () => {
    ran += 1;
  }, testDeps({ navigateTo: () => {} }));

  assert.equal(stayedOnPage, true);
  assert.equal(ran, 1);
});

test("openGateChainThenNavigate with ad URL tab-shifts", () => {
  const navigated: string[] = [];
  const opened: string[] = [];
  openGateChainThenNavigate("https://final.example/dest", "https://ads.example/g", 2, {
    ...testDeps({
      navigateTo: (u) => navigated.push(u),
      openTab: (u) => {
        opened.push(u);
        return { blur() {} };
      },
    }),
  });

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
