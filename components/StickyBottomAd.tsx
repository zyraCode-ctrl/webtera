"use client";

import { useEffect, useState } from "react";
import { AdBox } from "@/components/AdBox";

const STORAGE_KEY = "wt_sticky_ad_closed_v1";
const HIDE_MS = 24 * 60 * 60 * 1000;

export function StickyBottomAd() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const closedAt = raw ? Number(raw) : 0;
      const closed = closedAt > 0 && Date.now() - closedAt < HIDE_MS;
      setVisible(!closed);
    } catch {
      // If storage is unavailable, keep ad visible.
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 w-full min-w-0 border-t border-zinc-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-4">
      <div className="mx-auto flex w-full min-w-0 max-w-[1400px] items-start gap-2">
        <div className="min-w-0 flex-1">
          <AdBox type="banner" className="h-14 sm:h-16" />
        </div>
        <button
          type="button"
          aria-label="Close ad"
          onClick={() => {
            setVisible(false);
            try {
              window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
            } catch {
              // no-op
            }
          }}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          x
        </button>
      </div>
    </div>
  );
}

