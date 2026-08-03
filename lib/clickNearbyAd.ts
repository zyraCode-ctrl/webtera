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

  const fromNode = (node: NearbyAdClickable | null): string | null => {
    if (!node) return null;
    const href = node.getAttribute("href")?.trim() ?? "";
    if (!href || href === "#" || /^javascript:/i.test(href)) return null;
    return href;
  };

  const direct = fromNode(slot.querySelector("a[href]"));
  if (direct) return direct;

  // Real DOM: scan all anchors (nested / sibling wrappers around iframes).
  const el = slot as unknown as {
    querySelectorAll?: (sel: string) => ArrayLike<NearbyAdClickable>;
    querySelector?: (sel: string) => NearbyAdClickable | null;
  };
  if (typeof el.querySelectorAll === "function") {
    const links = el.querySelectorAll("a[href]");
    for (let i = 0; i < links.length; i++) {
      const href = fromNode(links[i]!);
      if (href) return href;
    }
  }

  const iframe = el.querySelector?.("iframe") as
    | (NearbyAdClickable & { parentElement?: NearbyAdClickable | null })
    | null
    | undefined;
  const parent = iframe && "parentElement" in iframe ? iframe.parentElement : null;
  if (parent) {
    const parentHref = fromNode(
      parent.getAttribute("href") != null ? parent : null
    );
    if (parentHref) return parentHref;
  }

  return null;
}

/**
 * True when a loaded nearby ad slot exists (anchor and/or iframe).
 */
export function hasNearbyLoadedAd(
  nearEl?: NearbyAdOrigin | null,
  doc?: NearbyAdDocument | null
): boolean {
  return pickBestNearbyAdSlot(nearEl, doc) != null;
}

/**
 * Click a loaded nearby ad slot under a user gesture.
 * Prefers same-document `a[href]` (iframe interiors are cross-origin and not clickable).
 * Returns true when a real anchor was clicked (not merely host/iframe focus).
 */
export function clickNearbyAd(
  nearEl?: NearbyAdOrigin | null,
  doc?: NearbyAdDocument | null
): boolean {
  const best = pickBestNearbyAdSlot(nearEl, doc);
  if (!best) return false;

  const href = getNearbyAdHref(best);
  if (href) {
    const anchor = best.querySelector("a[href]");
    // Prefer opening the resolved href so nested/scanned links still work.
    if (anchor && (anchor.getAttribute("href")?.trim() ?? "") === href) {
      anchor.click();
      return true;
    }
    try {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    } catch {
      /* fall through */
    }
  }

  // Host click may focus an iframe but usually does not open the offer.
  best.click();
  return false;
}
