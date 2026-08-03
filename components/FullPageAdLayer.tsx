"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  clickNearbyAd,
  getNearbyAdHref,
  pickBestNearbyAdSlot,
} from "@/lib/clickNearbyAd";
import { funnelAdUrl } from "@/lib/funnelConfig";

type Props = {
  /** CSS selector for proximity origin (e.g. video section). Falls back to document.body. */
  nearSelector?: string;
  onDismiss: () => void;
};

function resolveNearEl(nearSelector?: string): Element | null {
  if (typeof document === "undefined") return null;
  if (nearSelector) {
    const el = document.querySelector(nearSelector);
    if (el) return el;
  }
  return document.body;
}

function openAdUrl(url: string): boolean {
  try {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) return true;
  } catch {
    /* ignore */
  }
  try {
    window.location.assign(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve click target for the full-page layer.
 * Priority: nearby ad-box href → empty (caller tries DOM click) → smartlink only as last resort.
 */
export function resolveFullPageAdHref(
  nearSelector?: string,
  smartlink: string = funnelAdUrl,
  opts?: { allowSmartlinkFallback?: boolean }
): string {
  const near = resolveNearEl(nearSelector);
  const fromSlot = getNearbyAdHref(pickBestNearbyAdSlot(near));
  if (fromSlot) return fromSlot;
  if (opts?.allowSmartlinkFallback) return smartlink.trim();
  return "";
}

/**
 * Fire monetization for the video-page layer under a user gesture.
 * 1) Nearby ad click / ad href (top priority)
 * 2) Smartlink only if nearby ad did not open
 */
export function fireFullPageAdClick(
  nearSelector?: string,
  smartlink: string = funnelAdUrl
): "nearby" | "smartlink" | "none" {
  const near = resolveNearEl(nearSelector);
  const slot = pickBestNearbyAdSlot(near);
  const nearbyHref = getNearbyAdHref(slot);

  // Priority 1: open / click the nearby ad box.
  if (nearbyHref) {
    openAdUrl(nearbyHref);
    return "nearby";
  }
  if (clickNearbyAd(near)) {
    return "nearby";
  }

  // Priority 2: smartlink fallback.
  const link = smartlink.trim();
  if (link) {
    openAdUrl(link);
    return "smartlink";
  }
  return "none";
}

/**
 * Full-viewport invisible click layer on the video help page.
 * Ad-box click is always attempted before the smartlink.
 */
export function FullPageAdLayer({ nearSelector, onDismiss }: Props) {
  const firedRef = useRef(false);
  const [nearbyHref, setNearbyHref] = useState(() =>
    resolveFullPageAdHref(nearSelector, funnelAdUrl, { allowSmartlinkFallback: false })
  );

  useEffect(() => {
    // Re-resolve after mount — ad boxes may finish loading a moment later.
    const timers = [50, 400, 1200].map((ms) =>
      window.setTimeout(() => {
        setNearbyHref(
          resolveFullPageAdHref(nearSelector, funnelAdUrl, { allowSmartlinkFallback: false })
        );
      }, ms)
    );
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [nearSelector]);

  function handleClick(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (firedRef.current) return;
    firedRef.current = true;

    fireFullPageAdClick(nearSelector, funnelAdUrl);
    onDismiss();
  }

  const sharedClass = "fixed inset-0 z-[180] cursor-pointer bg-transparent";

  // If a nearby ad exposed a real href, expose it on the anchor for middle-click / accessibility.
  // Primary path still goes through fireFullPageAdClick (ad first, smartlink second).
  if (nearbyHref) {
    return (
      <a
        href={nearbyHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Sponsor overlay — tap once to continue"
        className={sharedClass}
        data-wt-fullpage-ad="1"
        data-wt-ad-priority="nearby"
        onClick={handleClick}
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Sponsor overlay — tap once to continue"
      className={sharedClass}
      data-wt-fullpage-ad="1"
      data-wt-ad-priority="nearby-then-smartlink"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as MouseEvent<HTMLElement>);
        }
      }}
    />
  );
}
