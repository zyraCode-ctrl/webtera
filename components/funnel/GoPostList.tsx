"use client";

import { useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import type { Post } from "@/data/posts";
import { GoPostCard } from "./GoPostCard";

export function GoPostList({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

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
    // Keep spacing consistent to improve fill stability and avoid overserving.
    return postIndexOnPage % 3 === 0;
  }

  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [safePage]);

  return (
    <section className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
      {safePage >= 3 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-center text-xs font-semibold uppercase tracking-wider text-indigo-700">
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
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {normalizedQuery ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              {resultPost ? (
                <div className="space-y-4">
                  <GoPostCard
                    id={resultPost.id}
                    title={resultPost.title}
                    preview={resultPost.preview}
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
      ) : null}

      {currentPosts.map((p, idx) => (
        <div key={p.id} className="space-y-4">
          <GoPostCard id={p.id} title={p.title} preview={p.preview} />
          {shouldShowAdAfterOnCurrentPage(idx + 1) ? (
            <AdSlot type="banner" variant="topBanner" />
          ) : null}
        </div>
      ))}

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
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
