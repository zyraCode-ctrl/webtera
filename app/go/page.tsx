import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { GoPostList } from "@/components/funnel/GoPostList";
import { posts } from "@/data/posts";
import { EVENTS } from "@/lib/events";

export const metadata = {
  title: "Posts",
  robots: {
    index: false,
    follow: false,
  },
};

function GoPostListFallback() {
  return (
    <section className="mx-auto w-full min-w-0 max-w-3xl space-y-4 px-1 sm:space-y-5 sm:px-0">
      <div
        className={[
          "surface-panel relative overflow-hidden rounded-2xl border-2 border-violet-400/90 bg-gradient-to-br from-violet-100/95 via-white to-cyan-50/70",
          "p-4 shadow-lg shadow-violet-600/15 ring-4 ring-violet-300/35 sm:p-6 sm:ring-[6px]",
        ].join(" ")}
      >
        <div className="text-center text-sm font-bold uppercase tracking-wide text-violet-900">
          Enter post number to start
        </div>
        <div className="mt-4 h-12 animate-pulse rounded-xl bg-violet-100/80" />
        <p className="mt-3 text-center text-sm text-violet-800/80">Loading search…</p>
      </div>
    </section>
  );
}

export default function GoPage() {
  return (
    <div className="min-w-0 w-full space-y-6">
      <TrackPageView event={EVENTS.goPageView} path="/go" />
      <section className="surface-panel p-6">
        <span className="inline-flex rounded-full border border-violet-200/80 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800">
          POST LIST
        </span>
      </section>

      <AdSlot type="banner" variant="topBanner" />

      <Suspense fallback={<GoPostListFallback />}>
        <GoPostList posts={posts} />
      </Suspense>

      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}
