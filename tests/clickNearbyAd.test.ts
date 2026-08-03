import test from "node:test";
import assert from "node:assert/strict";
import {
  AD_SLOT_ATTR,
  AD_TYPE_ATTR,
  clickNearbyAd,
  getNearbyAdHref,
  pickBestNearbyAdSlot,
  rankNearbyAdSlots,
  type NearbyAdClickable,
  type NearbyAdDocument,
  type NearbyAdSlotElement,
} from "../lib/clickNearbyAd";

type Rect = { left: number; top: number; width: number; height: number };

function makeSlot(opts: {
  type: string;
  rect: Rect;
  href?: string;
  iframe?: boolean;
  onAnchorClick?: () => void;
  onHostClick?: () => void;
}): NearbyAdSlotElement {
  const anchor: NearbyAdClickable | null = opts.href
    ? {
        getAttribute(name) {
          return name === "href" ? opts.href! : null;
        },
        click() {
          opts.onAnchorClick?.();
        },
      }
    : null;

  const iframeEl: NearbyAdClickable | null = opts.iframe
    ? {
        getAttribute() {
          return null;
        },
        click() {},
      }
    : null;

  return {
    getAttribute(name) {
      if (name === AD_SLOT_ATTR) return "1";
      if (name === AD_TYPE_ATTR) return opts.type;
      return null;
    },
    querySelector(sel) {
      if (sel === "a[href]") return anchor;
      if (sel === "iframe") return iframeEl;
      return null;
    },
    getBoundingClientRect() {
      return opts.rect;
    },
    click() {
      opts.onHostClick?.();
    },
  };
}

function makeDoc(slots: NearbyAdSlotElement[]): NearbyAdDocument {
  return {
    querySelectorAll() {
      return slots;
    },
  };
}

test("clickNearbyAd: clicks a[href] on the nearest loaded slot", () => {
  const clicks: string[] = [];
  const near = {
    getBoundingClientRect: () => ({ left: 100, top: 100, width: 40, height: 40 }),
  };
  const farBanner = makeSlot({
    type: "banner",
    rect: { left: 500, top: 500, width: 300, height: 90 },
    href: "https://ads.example/far",
    onAnchorClick: () => clicks.push("far"),
  });
  const nearBox = makeSlot({
    type: "box",
    rect: { left: 120, top: 110, width: 160, height: 600 },
    href: "https://ads.example/near",
    onAnchorClick: () => clicks.push("near"),
  });

  const ok = clickNearbyAd(near, makeDoc([farBanner, nearBox]));
  assert.equal(ok, true);
  assert.deepEqual(clicks, ["near"]);
});

test("clickNearbyAd: skips empty placeholder slots", () => {
  const clicks: string[] = [];
  const empty = makeSlot({
    type: "box",
    rect: { left: 0, top: 0, width: 160, height: 600 },
    onHostClick: () => clicks.push("empty"),
  });
  const loaded = makeSlot({
    type: "banner",
    rect: { left: 200, top: 200, width: 300, height: 90 },
    href: "https://ads.example/ok",
    onAnchorClick: () => clicks.push("loaded"),
  });

  const ok = clickNearbyAd(null, makeDoc([empty, loaded]));
  assert.equal(ok, true);
  assert.deepEqual(clicks, ["loaded"]);
});

test("clickNearbyAd: returns false when nothing clickable / visible", () => {
  const zeroSize = makeSlot({
    type: "box",
    rect: { left: 0, top: 0, width: 0, height: 0 },
    href: "https://ads.example/x",
  });
  const empty = makeSlot({
    type: "banner",
    rect: { left: 0, top: 0, width: 100, height: 50 },
  });

  assert.equal(clickNearbyAd(null, makeDoc([zeroSize, empty])), false);
  assert.equal(clickNearbyAd(null, makeDoc([])), false);
});

test("clickNearbyAd: iframe-only slot falls back to host click", () => {
  const clicks: string[] = [];
  const slot = makeSlot({
    type: "box",
    rect: { left: 0, top: 0, width: 160, height: 600 },
    iframe: true,
    onHostClick: () => clicks.push("host"),
  });

  assert.equal(clickNearbyAd(null, makeDoc([slot])), true);
  assert.deepEqual(clicks, ["host"]);
});

test("rankNearbyAdSlots: same distance prefers box over banner", () => {
  const rect = { left: 10, top: 10, width: 100, height: 100 };
  const banner = makeSlot({ type: "banner", rect, href: "https://a" });
  const box = makeSlot({ type: "box", rect, href: "https://b" });
  const ranked = rankNearbyAdSlots([banner, box], {
    getBoundingClientRect: () => rect,
  });
  assert.equal(ranked[0]!.getAttribute(AD_TYPE_ATTR), "box");
});

test("clickNearbyAd: prefers closer banner over farther box", () => {
  const clicks: string[] = [];
  const origin = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10 }),
  };
  const farBox = makeSlot({
    type: "box",
    rect: { left: 800, top: 800, width: 160, height: 600 },
    href: "https://ads.example/box",
    onAnchorClick: () => clicks.push("box"),
  });
  const nearBanner = makeSlot({
    type: "banner",
    rect: { left: 20, top: 20, width: 300, height: 90 },
    href: "https://ads.example/banner",
    onAnchorClick: () => clicks.push("banner"),
  });

  assert.equal(clickNearbyAd(origin, makeDoc([farBox, nearBanner])), true);
  assert.deepEqual(clicks, ["banner"]);
});

test("pickBestNearbyAdSlot + getNearbyAdHref expose the nearest ad link", () => {
  const origin = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10 }),
  };
  const far = makeSlot({
    type: "box",
    rect: { left: 400, top: 400, width: 160, height: 600 },
    href: "https://ads.example/far",
  });
  const near = makeSlot({
    type: "banner",
    rect: { left: 5, top: 5, width: 300, height: 90 },
    href: "https://ads.example/near",
  });

  const best = pickBestNearbyAdSlot(origin, makeDoc([far, near]));
  assert.equal(getNearbyAdHref(best), "https://ads.example/near");
  assert.equal(getNearbyAdHref(null), null);
});
