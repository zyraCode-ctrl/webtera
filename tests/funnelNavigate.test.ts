import test from "node:test";
import assert from "node:assert/strict";
import {
  FUNNEL_GATE_TO_NEXT_MS,
  openGateThenCallback,
  openGateChainThenNavigate,
  openGateThenNavigate,
} from "../lib/funnelNavigate";

/** Node test doubles — no browser. */
function testDeps(navigateTo: (url: string) => void) {
  return {
    openGateTab: () => ({}) as Window,
    navigateTo,
    afterDelay(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
  };
}

test("openGateThenNavigate invokes navigateTo after FUNNEL_GATE_TO_NEXT_MS when popup succeeds", async () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked, cancel } = openGateThenNavigate("/out/7?from=video", "https://sponsor.example/a", {
    ...testDeps((u) => navigated.push(u)),
  });

  assert.equal(popupLikelyBlocked, false);
  assert.deepEqual(navigated, []);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, ["/out/7?from=video"]);
  cancel();
});

test("openGateThenNavigate reports popupLikelyBlocked when openGateTab returns null", async () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked } = openGateThenNavigate("/x", "https://sponsor.example/b", {
    openGateTab: () => null,
    navigateTo: (u) => navigated.push(u),
    afterDelay(fn, ms) {
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
  });

  assert.equal(popupLikelyBlocked, true);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, ["/x"]);
});

test("openGateThenNavigate cancel prevents navigation", async () => {
  const navigated: string[] = [];
  const { cancel } = openGateThenNavigate("/y", "https://sponsor.example/c", {
    openGateTab: () => null,
    navigateTo: (u) => navigated.push(u),
    afterDelay(fn, ms) {
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
  });
  cancel();
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, []);
});

test("openGateThenNavigate passes absolute external URLs through to navigateTo", async () => {
  const navigated: string[] = [];
  const target = "https://pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev/video/x.mp4";
  openGateThenNavigate(target, "https://sponsor.example/d", {
    ...testDeps((u) => navigated.push(u)),
  });
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, [target]);
});

test("openGateThenCallback invokes callback after FUNNEL_GATE_TO_NEXT_MS", async () => {
  let ran = 0;
  const { popupLikelyBlocked, cancel } = openGateThenCallback("https://sponsor.example/e", () => {
    ran += 1;
  }, testDeps(() => {}));

  assert.equal(popupLikelyBlocked, false);
  assert.equal(ran, 0);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.equal(ran, 1);
  cancel();
});

test("openGateThenCallback cancel prevents callback", async () => {
  let ran = 0;
  const { cancel } = openGateThenCallback("https://sponsor.example/f", () => {
    ran += 1;
  }, testDeps(() => {}));
  cancel();
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.equal(ran, 0);
});

test("openGateChainThenNavigate runs two gate opens then navigateTo", async () => {
  const navigated: string[] = [];
  const opened: string[] = [];
  const { popupLikelyBlocked } = openGateChainThenNavigate(
    "https://final.example/dest",
    "https://sponsor.example/g",
    2,
    {
      openGateTab: (u) => {
        opened.push(u);
        return {} as Window;
      },
      navigateTo: (u) => navigated.push(u),
      afterDelay(fn, ms) {
        const id = setTimeout(fn, ms);
        return () => clearTimeout(id);
      },
    }
  );

  assert.equal(popupLikelyBlocked, false);
  assert.equal(navigated.length, 0);
  assert.equal(opened.length, 1);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.equal(opened.length, 2);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, ["https://final.example/dest"]);
});

test("openGateChainThenNavigate with 0 passes navigates immediately", () => {
  const navigated: string[] = [];
  openGateChainThenNavigate("https://final.example/n", "https://sponsor.example/h", 0, {
    ...testDeps((u) => navigated.push(u)),
  });
  assert.deepEqual(navigated, ["https://final.example/n"]);
});
