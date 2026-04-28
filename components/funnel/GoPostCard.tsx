"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { funnelGateUrl, funnelHdUrl } from "@/lib/funnelConfig";
import { EVENTS } from "@/lib/events";

export function GoPostCard({
  id,
  title,
  preview,
}: {
  id: string;
  title: string;
  preview: string;
}) {
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

    window.location.href = targetHref;
  }

  const fullVideoHref = `/out/${encodeURIComponent(id)}?from=video`;

  return (
    <article className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{preview}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={fullVideoHref}
          onClick={(e) => {
            trackEvent({
              event: EVENTS.goClickFullVideo,
              path: "/go",
              postId: id,
            });
            handleViewClick(e, fullVideoHref);
          }}
          className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500"
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
