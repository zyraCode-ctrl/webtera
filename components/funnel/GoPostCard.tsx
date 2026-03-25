"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function GoPostCard({
  id,
  title,
  preview,
  igLink,
}: {
  id: string;
  title: string;
  preview: string;
  igLink?: string;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        Post #{id}
      </div>
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{preview}</p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link
          href={`/out/${encodeURIComponent(id)}?from=video`}
          onClick={() =>
            trackEvent({
              event: "go_click_full_video",
              path: "/go",
              postId: id,
            })
          }
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500"
        >
          Full Video
        </Link>
        {igLink ? (
          <a
            href={igLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent({
                event: "go_click_instagram",
                path: "/go",
                postId: id,
              })
            }
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white hover:bg-pink-500"
          >
            Instagram
          </a>
        ) : (
          <span className="inline-flex min-h-10 items-center justify-center rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500">
            Instagram
          </span>
        )}
        <Link
          href={`/out/${encodeURIComponent(id)}?from=download`}
          onClick={() =>
            trackEvent({
              event: "go_click_download",
              path: "/go",
              postId: id,
            })
          }
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
        >
          Download
        </Link>
      </div>
    </article>
  );
}
