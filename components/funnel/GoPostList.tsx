"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import type { Post } from "@/data/posts";
import { GoPostCard } from "./GoPostCard";

export function GoPostList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const POSTS_PER_PAGE = 10;

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  const safePage = useMemo(() => {
    const raw = searchParams.get("page");
    const n = raw ? parseInt(raw, 10) : 1;
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, totalPages);
  }, [searchParams, totalPages]);

  const postById = useMemo(() => {
    return new Map(posts.map((p) => [p.id, p]));
  }, [posts]);

  const normalizedQuery = query.trim();
  const resultPost = normalizedQuery ? postById.get(normalizedQuery) : undefined;

  const currentPosts = useMemo(() => {
    const start = (safePage - 1) * POSTS_PER_PAGE;
    return posts.slice(start, start + POSTS_PER_PAGE);
  }, [posts, safePage]);
  const startPostNumber = (safePage - 1) * POSTS_PER_PAGE + 1;
  const endPostNumber = Math.min(safePage * POSTS_PER_PAGE, posts.length);

  function shouldShowAdAfterOnCurrentPage(postIndexOnPage: number) {
    return postIndexOnPage % 3 === 0;
  }

  function goToPage(page: number) {
    const p = Math.min(Math.max(page, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const match = /^#post-(.+)$/.exec(hash);
    if (match) {
      const postId = decodeURIComponent(match[1]);
      requestAnimationFrame(() => {
        document.getElementById(`go-post-${postId}`)?.scrollIntoView({ block: "center", behavior: "auto" });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [safePage]);

  return (
    <section className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
      <div className="space-y-4">
        <div className="surface-panel bg-gradient-to-br from-white to-violet-50/40 p-4 sm:p-5">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-violet-800">
            Enter post number to search
          </div>
          <div className="mt-3">
            <AdSlot type="banner" variant="topBanner" />
          </div>
          <div className="mt-3">
            <input
              type="search"
              inputMode="numeric"
              pattern="[0-9]*"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter post number (1 to ${posts.length})`}
              className="w-full rounded-xl border border-violet-200/55 bg-white/95 px-3 py-2 backdrop-blur-sm text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            />
          </div>
        </div>

        {normalizedQuery ? (
          <div className="surface-panel p-4">
            {resultPost ? (
              <div className="space-y-4">
                <GoPostCard
                  id={resultPost.id}
                  title={resultPost.title}
                  preview={resultPost.preview}
                  imageUrl={resultPost.imageUrl}
                  previewVideoUrl={resultPost.previewVideoUrl}
                />
                <AdSlot type="banner" variant="topBanner" />
              </div>
            ) : (
              <p className="text-sm text-zinc-600">
                {`No post found for "${normalizedQuery}". Try a number between 1 and ${posts.length}.`}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {currentPosts.map((p, idx) => (
        <div key={p.id} className="space-y-4">
          <GoPostCard
            id={p.id}
            title={p.title}
            preview={p.preview}
            imageUrl={p.imageUrl}
            previewVideoUrl={p.previewVideoUrl}
          />
          {shouldShowAdAfterOnCurrentPage(idx + 1) ? (
            <AdSlot type="banner" variant="topBanner" />
          ) : null}
        </div>
      ))}

      <div className="surface-panel p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded-lg border border-violet-200/55 bg-white/95 px-3 py-2 backdrop-blur-sm text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-sm font-medium text-zinc-700">
            Page {safePage} of {totalPages}
          </div>
          <button
            type="button"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-violet-200/55 bg-white/95 px-3 py-2 backdrop-blur-sm text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-600 sm:text-sm">
          Showing posts {startPostNumber}-{endPostNumber} on this page. Remaining posts are on the next pages.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={[
                "min-w-9 rounded-md border px-2 py-1 text-xs font-medium",
                page === safePage
                  ? "border-violet-500 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25"
                  : "border-violet-200/55 bg-white/95 text-zinc-700 backdrop-blur-sm hover:bg-violet-50/60",
              ].join(" ")}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

    </section>
  );
}
