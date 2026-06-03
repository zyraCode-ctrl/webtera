"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { FunnelNavigatingOverlay } from "@/components/FunnelNavigatingOverlay";
import { trackEvent } from "@/lib/analytics";
import { unlockGoFullListForSession } from "@/lib/funnelGoSession";
import { encodePostRef, funnelHelpPath, funnelPostPath } from "@/lib/funnelRef";
import { openGateChainThenNavigate, openGateThenNavigate } from "@/lib/funnelNavigate";
import { EVENTS } from "@/lib/events";

type OverlayVariant = "full" | "play";

/** Pin current /go list URL with #post-{id} so browser Back restores page + scroll target. */
function pinGoListAnchorForBack(postId: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/go") return;
  const base = `${window.location.pathname}${window.location.search}`;
  const url = `${base}#post-${encodeURIComponent(encodePostRef(postId))}`;
  try {
    window.history.replaceState(window.history.state ?? {}, "", url);
  } catch {
    /* ignore */
  }
}

export function GoPostCard({
  id,
  title,
  preview,
  imageUrl,
  previewVideoUrl,
}: {
  id: string;
  title: string;
  preview: string;
  imageUrl: string;
  previewVideoUrl?: string;
}) {
  const router = useRouter();
  const [mediaFailed, setMediaFailed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [overlayVariant, setOverlayVariant] = useState<OverlayVariant>("full");
  const cancelNavigateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cancelNavigateRef.current?.();
    };
  }, []);

  // BF-cache restores `/go` with frozen React state — sponsor overlay can stay "open".
  useEffect(() => {
    function resetNavigateOverlay() {
      cancelNavigateRef.current?.();
      cancelNavigateRef.current = null;
      setIsRedirecting(false);
    }

    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) resetNavigateOverlay();
    }

    function onPopState() {
      if (window.location.pathname === "/go") resetNavigateOverlay();
    }

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const fullVideoHref = funnelHelpPath(id, "video");
  const playTargetHref = previewVideoUrl
    ? `${funnelPostPath(id)}#preview`
    : funnelHelpPath(id, "video");

  function beginFullVideoNavigation() {
    if (isRedirecting) return;

    unlockGoFullListForSession();

    cancelNavigateRef.current?.();
    pinGoListAnchorForBack(id);

    const skipAd = Math.random() < 0.5;
    if (skipAd) {
      router.push(fullVideoHref);
      return;
    }

    setOverlayVariant("full");
    setIsRedirecting(true);

    const { cancel } = openGateThenNavigate(fullVideoHref);
    cancelNavigateRef.current = cancel;
  }

  function beginPlayNavigation() {
    if (isRedirecting) return;

    unlockGoFullListForSession();

    cancelNavigateRef.current?.();
    pinGoListAnchorForBack(id);
    setOverlayVariant("play");
    setIsRedirecting(true);

    const { cancel } = openGateChainThenNavigate(playTargetHref, undefined, 2);
    cancelNavigateRef.current = cancel;
  }

  function handleFullVideoClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (isRedirecting) return;
    trackEvent({
      event: EVENTS.goClickFullVideo,
      path: "/go",
      postId: id,
    });
    beginFullVideoNavigation();
  }

  function handlePlayClick() {
    if (isRedirecting) return;
    trackEvent({
      event: EVENTS.goClickPreviewPlay,
      path: "/go",
      postId: id,
    });
    beginPlayNavigation();
  }

  const overlayTitle =
    overlayVariant === "play" ? "Opening preview" : "Opening your video";
  const overlayDescription =
    overlayVariant === "play"
      ? "Taking you to the preview in just a moment—stay on this screen."
      : "Taking you to the full video page in just a moment—stay on this screen.";

  return (
    <article id={`go-post-${id}`} className="relative min-w-0 scroll-mt-28 surface-panel p-5 transition hover:shadow-md">
      {isRedirecting ? (
        <FunnelNavigatingOverlay title={overlayTitle} description={overlayDescription} />
      ) : null}
      {!mediaFailed ? (
        <div className="relative mb-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <img
            src={imageUrl}
            alt={`${title} preview`}
            loading="lazy"
            className="h-auto w-full object-cover"
            onError={() => setMediaFailed(true)}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25"
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <button
              type="button"
              onClick={handlePlayClick}
              disabled={isRedirecting}
              aria-label="Play preview"
              className={[
                "pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-violet-700 shadow-lg ring-4 ring-white/30 transition hover:scale-105 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 active:scale-[0.98] motion-reduce:transition-none sm:h-[4.5rem] sm:w-[4.5rem]",
                isRedirecting ? "pointer-events-none opacity-60" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <svg aria-hidden className="ml-1 h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex min-h-36 flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-5">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Preview unavailable</span>
          <button
            type="button"
            onClick={handlePlayClick}
            disabled={isRedirecting}
            aria-label="Play preview"
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-violet-700 shadow-md ring-2 ring-violet-200/80 transition hover:bg-white active:scale-[0.98]",
              isRedirecting ? "pointer-events-none opacity-60" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <svg aria-hidden className="ml-0.5 h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </button>
        </div>
      )}
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{preview}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={fullVideoHref}
          onClick={handleFullVideoClick}
          className={[
            "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:brightness-110 active:scale-[0.98]",
            isRedirecting ? "pointer-events-none opacity-70" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Full Video
        </Link>
        <Link
          href={fullVideoHref}
          onClick={() =>
            trackEvent({
              event: EVENTS.goClickHd,
              path: "/go",
              postId: id,
            })
          }
          className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
        >
          View in HD
        </Link>
      </div>
    </article>
  );
}
