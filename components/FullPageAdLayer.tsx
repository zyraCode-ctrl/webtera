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

/**
 * Resolve a URL the full-page layer can open on a real user click.
 * Prefer a same-document link from a nearby ad box; fall back to the smartlink.
 */
export function resolveFullPageAdHref(
  nearSelector?: string,
  smartlink: string = funnelAdUrl
): string {
  const near = resolveNearEl(nearSelector);
  const fromSlot = getNearbyAdHref(pickBestNearbyAdSlot(near));
  if (fromSlot) return fromSlot;
  return smartlink.trim();
}

/**
 * Full-viewport invisible click layer.
 * Uses a real `<a href>` so the browser navigates to the ad (works on localhost).
 * Nearby display iframes are cross-origin and cannot be clicked reliably.
 */
export function FullPageAdLayer({ nearSelector, onDismiss }: Props) {
  const firedRef = useRef(false);
  const [href, setHref] = useState(() => resolveFullPageAdHref(nearSelector));

  useEffect(() => {
    // Re-resolve after mount — ad boxes may finish loading a moment later.
    const id = window.setTimeout(() => {
      setHref(resolveFullPageAdHref(nearSelector));
    }, 50);
    const id2 = window.setTimeout(() => {
      setHref(resolveFullPageAdHref(nearSelector));
    }, 500);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(id2);
    };
  }, [nearSelector]);

  function finish() {
    if (firedRef.current) return;
    firedRef.current = true;
    onDismiss();
  }

  function handleClick(e: MouseEvent<HTMLAnchorElement | HTMLDivElement>) {
    if (firedRef.current) {
      e.preventDefault();
      return;
    }

    // Prefer a real navigation via <a href>. If we only have a div fallback,
    // open the smartlink / fire nearby click under this user gesture.
    if (!href) {
      e.preventDefault();
      const opened = clickNearbyAd(resolveNearEl(nearSelector));
      if (!opened && funnelAdUrl) {
        window.open(funnelAdUrl, "_blank", "noopener,noreferrer");
      }
      finish();
      return;
    }

    // Let the anchor navigate (target=_blank), then unlock the page.
    finish();
  }

  const sharedClass = "fixed inset-0 z-[180] cursor-pointer bg-transparent";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Sponsor overlay — tap once to continue"
        className={sharedClass}
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
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
    />
  );
}
