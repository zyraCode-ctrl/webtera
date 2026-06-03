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
    navigateTo,
    afterDelay(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    },
  };
}

test("openGateThenNavigate invokes navigateTo after FUNNEL_GATE_TO_NEXT_MS", async () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked, cancel } = openGateThenNavigate("/out/7?from=video", undefined, {
    ...testDeps((u) => navigated.push(u)),
  });

  assert.equal(popupLikelyBlocked, false);
  assert.deepEqual(navigated, []);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, ["/out/7?from=video"]);
  cancel();
});

test("openGateThenNavigate never reports popupLikelyBlocked (popunder, no gate tab)", async () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked } = openGateThenNavigate("/x", undefined, {
    ...testDeps((u) => navigated.push(u)),
  });

  assert.equal(popupLikelyBlocked, false);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, ["/x"]);
});

test("openGateThenNavigate cancel prevents navigation", async () => {
  const navigated: string[] = [];
  const { cancel } = openGateThenNavigate("/y", undefined, {
    ...testDeps((u) => navigated.push(u)),
  });
  cancel();
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, []);
});

test("openGateThenNavigate passes absolute external URLs through to navigateTo", async () => {
  const navigated: string[] = [];
  const target = "https://pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev/video/x.mp4";
  openGateThenNavigate(target, undefined, {
    ...testDeps((u) => navigated.push(u)),
  });
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, [target]);
});

test("openGateThenCallback invokes callback after FUNNEL_GATE_TO_NEXT_MS", async () => {
  let ran = 0;
  const { popupLikelyBlocked, cancel } = openGateThenCallback("", () => {
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
  const { cancel } = openGateThenCallback("", () => {
    ran += 1;
  }, testDeps(() => {}));
  cancel();
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.equal(ran, 0);
});

test("openGateChainThenNavigate uses single delay then navigateTo", async () => {
  const navigated: string[] = [];
  const { popupLikelyBlocked } = openGateChainThenNavigate(
    "https://final.example/dest",
    undefined,
    2,
    {
      ...testDeps((u) => navigated.push(u)),
    }
  );

  assert.equal(popupLikelyBlocked, false);
  assert.equal(navigated.length, 0);
  await new Promise((r) => setTimeout(r, FUNNEL_GATE_TO_NEXT_MS + 80));
  assert.deepEqual(navigated, ["https://final.example/dest"]);
});

test("openGateChainThenNavigate with 0 passes navigates immediately", () => {
  const navigated: string[] = [];
  openGateChainThenNavigate("https://final.example/n", undefined, 0, {
    ...testDeps((u) => navigated.push(u)),
  });
  assert.deepEqual(navigated, ["https://final.example/n"]);
});
