"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import type { Post } from "@/data/posts";
import { GO_FULL_LIST_STORAGE_KEY, resetGoFullListUnlock } from "@/lib/funnelGoSession";
import { GoPostCard } from "./GoPostCard";

const SEARCH_DEBOUNCE_MS = 320;

function searchParamsSortedStr(params: URLSearchParams | { entries(): IterableIterator<[string, string]> }) {
  return [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

export function GoPostList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("search") ?? "";
  });
  const skipDebouncedUrlSyncRef = useRef(false);
  const [showFullPostList, setShowFullPostList] = useState(false);
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

  const postIndexById = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < posts.length; i++) m.set(posts[i].id, i);
    return m;
  }, [posts]);

  // Restore search box when URL changes (browser Back / Forward).
  useEffect(() => {
    const fromUrl = searchParams.get("search") ?? "";
    setQuery(fromUrl);
    skipDebouncedUrlSyncRef.current = true;
  }, [searchParams]);

  const normalizedQuery = query.trim();
  const resultPost = normalizedQuery ? postById.get(normalizedQuery) : undefined;

  const currentPosts = useMemo(() => {
    const start = (safePage - 1) * POSTS_PER_PAGE;
    return posts.slice(start, start + POSTS_PER_PAGE);
  }, [posts, safePage]);

  /** Avoid duplicate cards when the searched post is also on the current page slice. */
  const paginatedPosts = useMemo(() => {
    if (!resultPost || normalizedQuery !== resultPost.id) return currentPosts;
    return currentPosts.filter((p) => p.id !== resultPost.id);
  }, [currentPosts, normalizedQuery, resultPost]);

  const startPostNumber = (safePage - 1) * POSTS_PER_PAGE + 1;
  const endPostNumber = Math.min(safePage * POSTS_PER_PAGE, posts.length);

  function shouldShowAdAfterOnCurrentPage(postIndexOnPage: number) {
    return postIndexOnPage % 3 === 0;
  }

  const replaceGoUrl = useCallback(
    (next: URLSearchParams) => {
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  function goToPage(page: number) {
    const p = Math.min(Math.max(page, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    replaceGoUrl(params);
  }

  // Keep ?search= and ?page= in history while typing so Back restores search + correct pager slice.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (skipDebouncedUrlSyncRef.current) {
        skipDebouncedUrlSyncRef.current = false;
        return;
      }

      const trimmed = query.trim();
      const next = new URLSearchParams(searchParams.toString());

      if (!trimmed) {
        next.delete("search");
      } else {
        next.set("search", trimmed);
        const idx = postIndexById.get(trimmed);
        if (idx !== undefined) {
          const pageNum = Math.floor(idx / POSTS_PER_PAGE) + 1;
          const bounded = Math.min(Math.max(pageNum, 1), totalPages);
          if (bounded <= 1) next.delete("page");
          else next.set("page", String(bounded));
        }
      }

      if (searchParamsSortedStr(next) !== searchParamsSortedStr(searchParams)) {
        replaceGoUrl(next);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [pathname, postIndexById, query, replaceGoUrl, searchParams, totalPages]);

  // Fresh funnel arrival (?from_entry=1): search-only mode. After visiting a post, sessionStorage unlocks the list.
  useEffect(() => {
    if (searchParams.get("from_entry") === "1") {
      resetGoFullListUnlock();
      setShowFullPostList(false);
      const next = new URLSearchParams(searchParams.toString());
      next.delete("from_entry");
      skipDebouncedUrlSyncRef.current = true;
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      return;
    }
    try {
      setShowFullPostList(sessionStorage.getItem(GO_FULL_LIST_STORAGE_KEY) === "1");
    } catch {
      setShowFullPostList(false);
    }
  }, [searchParams, pathname, router]);

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
  }, [safePage, searchParams]);

  return (
    <section className="mx-auto w-full min-w-0 max-w-3xl space-y-4 px-1 sm:space-y-5 sm:px-0">
      <div className="space-y-4 sm:space-y-5">
        <div
          className={[
            "surface-panel relative overflow-hidden rounded-2xl border-2 border-violet-400/90 bg-gradient-to-br from-violet-100/95 via-white to-cyan-50/70",
            "p-4 shadow-lg shadow-violet-600/15 ring-4 ring-violet-300/35 sm:p-6 sm:ring-[6px]",
          ].join(" ")}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500"
            aria-hidden
          />
          <div className="text-center text-sm font-bold uppercase tracking-wide text-violet-900 sm:text-xs sm:font-semibold sm:tracking-wider">
            {showFullPostList ? "Enter post number to search" : "Enter post number to start"}
          </div>
          {!showFullPostList ? (
            <div
              role="note"
              className={[
                "mt-3 rounded-xl border-2 border-amber-500/95 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-50",
                "px-3 py-3.5 shadow-md shadow-amber-900/15 ring-2 ring-amber-300/70 sm:mt-3 sm:px-5 sm:py-4",
              ].join(" ")}
            >
              <p className="text-center text-[15px] font-medium leading-relaxed text-amber-950 sm:text-base sm:leading-7">
                <span className="block font-bold tracking-tight text-amber-950 sm:inline sm:font-extrabold">
                  Type your post number below.
                </span>
                <span className="mt-1 block sm:mt-0 sm:inline">
                  {" "}
                  After you open the video and press{" "}
                  <strong className="rounded bg-white/90 px-1.5 py-0.5 font-extrabold text-violet-900 shadow-sm ring-1 ring-violet-300/70">
                    Back
                  </strong>
                  , you&apos;ll see the{" "}
                  <strong className="font-extrabold text-violet-900 underline decoration-violet-400 decoration-2 underline-offset-2">
                    full post list
                  </strong>{" "}
                  for that page.
                </span>
              </p>
            </div>
          ) : null}
          <div className="mt-3 sm:mt-4">
            <AdSlot type="banner" variant="topBanner" />
          </div>
          <div className="mt-4 sm:mt-5">
            <label
              htmlFor="go-post-search"
              className="mb-2 block text-center text-sm font-semibold text-violet-950 sm:text-[13px]"
            >
              Your post number
            </label>
            <div className="go-post-search-frame shadow-md shadow-violet-700/25 sm:shadow-lg">
              <div className="relative z-[1] rounded-[13px] bg-white sm:rounded-xl">
                <input
                  id="go-post-search"
                  type="search"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`1–${posts.length}`}
                  className={[
                    "min-h-[3.25rem] w-full rounded-[10px] border-0 bg-white px-4 py-3.5 text-center text-lg font-semibold tabular-nums tracking-wide text-zinc-950 shadow-inner sm:rounded-[11px]",
                    "placeholder:text-zinc-400 placeholder:font-normal",
                    "outline-none focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-100",
                    "sm:min-h-[3rem] sm:text-xl sm:tracking-wider",
                  ].join(" ")}
                />
              </div>
            </div>
          </div>
        </div>

        {normalizedQuery ? (
          <div className="surface-panel p-4 sm:p-5">
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

      {showFullPostList ? (
        <>
          {paginatedPosts.map((p, idx) => (
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

          <div className="surface-panel p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
                className="min-h-11 w-full rounded-xl border-2 border-violet-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-h-10 sm:rounded-lg sm:border sm:font-normal"
              >
                Previous
              </button>
              <div className="text-center text-sm font-semibold text-zinc-800 sm:font-medium">
                Page {safePage} of {totalPages}
              </div>
              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="min-h-11 w-full rounded-xl border-2 border-violet-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-h-10 sm:rounded-lg sm:border sm:font-normal"
              >
                Next
              </button>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-zinc-600 sm:text-sm">
              Showing posts {startPostNumber}-{endPostNumber} on this page. Remaining posts are on the next pages.
            </p>
            <div className="mt-4 flex max-h-[min(40vh,280px)] flex-wrap justify-center gap-2 overflow-y-auto overscroll-contain px-0.5 pb-1 sm:max-h-none sm:overflow-visible">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={[
                    "flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-semibold sm:min-h-9 sm:min-w-9 sm:rounded-md sm:border sm:px-2 sm:py-1 sm:text-xs sm:font-medium",
                    page === safePage
                      ? "border-violet-600 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                      : "border-violet-200/90 bg-white text-zinc-800 shadow-sm hover:bg-violet-50/80 active:scale-[0.98]",
                  ].join(" ")}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

    </section>
  );
}
