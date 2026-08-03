/** Stable markers set on every AdBox root (see components/AdBox.tsx). */
export const AD_SLOT_ATTR = "data-wt-ad-slot";
export const AD_TYPE_ATTR = "data-wt-ad-type";

/** Lower = preferred when distance is similar. */
const TYPE_RANK: Record<string, number> = {
  box: 0,
  inline: 1,
  banner: 2,
  bannerMobile: 3,
};

export type NearbyAdClickable = {
  click(): void;
  getAttribute(name: string): string | null;
};

export type NearbyAdSlotElement = {
  getAttribute(name: string): string | null;
  querySelector(selectors: string): NearbyAdClickable | null;
  getBoundingClientRect(): {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  click(): void;
};

export type NearbyAdDocument = {
  querySelectorAll(selectors: string): ArrayLike<NearbyAdSlotElement>;
};

export type NearbyAdOrigin = {
  getBoundingClientRect(): {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

function typeRank(type: string | null): number {
  if (!type) return 99;
  return TYPE_RANK[type] ?? 50;
}

function centerDistance(
  a: { left: number; top: number; width: number; height: number },
  b: { left: number; top: number; width: number; height: number }
): number {
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function hasLoadedCreative(slot: NearbyAdSlotElement): boolean {
  const anchor = slot.querySelector("a[href]");
  if (anchor) {
    const href = anchor.getAttribute("href")?.trim() ?? "";
    if (href) return true;
  }
  return !!slot.querySelector("iframe");
}

function isVisibleSlot(slot: NearbyAdSlotElement): boolean {
  const r = slot.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/** Exported for unit tests — sort candidates by proximity then ad type. */
export function rankNearbyAdSlots(
  slots: NearbyAdSlotElement[],
  origin: NearbyAdOrigin | null
): NearbyAdSlotElement[] {
  const originRect = origin?.getBoundingClientRect() ?? {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  return [...slots].sort((a, b) => {
    const da = centerDistance(a.getBoundingClientRect(), originRect);
    const db = centerDistance(b.getBoundingClientRect(), originRect);
    if (da !== db) return da - db;
    return (
      typeRank(a.getAttribute(AD_TYPE_ATTR)) - typeRank(b.getAttribute(AD_TYPE_ATTR))
    );
  });
}

/**
 * Pick the best loaded nearby ad slot (proximity + type). Exported for the full-page layer.
 */
export function pickBestNearbyAdSlot(
  nearEl?: NearbyAdOrigin | null,
  doc?: NearbyAdDocument | null
): NearbyAdSlotElement | null {
  const root =
    doc ??
    (typeof document !== "undefined"
      ? (document as unknown as NearbyAdDocument)
      : null);
  if (!root) return null;

  const nodes = root.querySelectorAll(`[${AD_SLOT_ATTR}]`);
  const slots: NearbyAdSlotElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const slot = nodes[i]!;
    if (!isVisibleSlot(slot)) continue;
    if (!hasLoadedCreative(slot)) continue;
    slots.push(slot);
  }

  if (slots.length === 0) return null;
  return rankNearbyAdSlots(slots, nearEl ?? null)[0] ?? null;
}

/** Same-document click URL from a slot, if the creative exposed an anchor. */
export function getNearbyAdHref(slot: NearbyAdSlotElement | null): string | null {
  if (!slot) return null;
  const anchor = slot.querySelector("a[href]");
  const href = anchor?.getAttribute("href")?.trim() ?? "";
  return href || null;
}

/**
 * Click a loaded nearby ad slot under a user gesture.
 * Prefers same-document `a[href]` (iframe interiors are cross-origin and not clickable).
 * Returns true when a click target was invoked.
 */
export function clickNearbyAd(
  nearEl?: NearbyAdOrigin | null,
  doc?: NearbyAdDocument | null
): boolean {
  const best = pickBestNearbyAdSlot(nearEl, doc);
  if (!best) return false;

  const anchor = best.querySelector("a[href]");
  if (anchor) {
    const href = anchor.getAttribute("href")?.trim() ?? "";
    if (href) {
      anchor.click();
      return true;
    }
  }

  // Last resort: host click (may focus an iframe; often does not open the offer).
  best.click();
  return true;
}
