"use client";

import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { funnelGateUrl, funnelHdUrl } from "@/lib/funnelConfig";
import { EVENTS } from "@/lib/events";

export function GoPostCard({
  id,
  title,
  preview,
  imageUrl,
}: {
  id: string;
  title: string;
  preview: string;
  imageUrl: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleViewClick(
    e: MouseEvent<HTMLAnchorElement>,
    targetHref: string
  ) {
    e.preventDefault();

    // Always gate: open ad URL first, then redirect current tab to target.
    try {
      window.open(funnelGateUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Ignore popup/open failures and continue to target.
    }

    setIsRedirecting(true);
    window.setTimeout(() => {
      window.location.href = targetHref;
    }, 120);
  }

  const fullVideoHref = `/out/${encodeURIComponent(id)}?from=video`;

  return (
    <article className="relative min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {isRedirecting ? (
        <div className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-white/80 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3 text-zinc-700">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
            <div className="text-xs font-semibold uppercase tracking-wider">
              Opening video...
            </div>
          </div>
        </div>
      ) : null}
      {!imageFailed ? (
        <div className="mb-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <img
            src={imageUrl}
            alt={`${title} preview`}
            loading="lazy"
            className="h-auto w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="mb-3 grid h-36 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Preview unavailable
        </div>
      )}
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{preview}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={fullVideoHref}
          onClick={(e) => {
            if (isRedirecting) return;
            trackEvent({
              event: EVENTS.goClickFullVideo,
              path: "/go",
              postId: id,
            });
            handleViewClick(e, fullVideoHref);
          }}
          className={[
            "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500",
            isRedirecting ? "pointer-events-none opacity-70" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Full Video
        </Link>
        <a
          href={funnelHdUrl}
          target="_blank"
          rel="noopener noreferrer"
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
        </a>
      </div>
    </article>
  );
}
