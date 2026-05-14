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

export default function GoPage() {
  return (
    <div className="min-w-0 w-full space-y-6">
      <TrackPageView event={EVENTS.goPageView} path="/go" />
      <section className="surface-panel p-6">
        <span className="inline-flex rounded-full border border-violet-200/80 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800">
          POST LIST
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Helpful resources
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-800 bg-yellow-100 px-3 py-2 rounded-md">
          <b>
            Click on the FULL VIDEO to unlock your video.
          </b>
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-800 bg-yellow-100 px-3 py-2 rounded-md">
          <b>
            After a short redirect, come back here — your video will be ready to view.
          </b>
        </p>
      </section>

      <AdSlot type="banner" variant="topBanner" />

      <Suspense fallback={null}>
        <GoPostList posts={posts} />
      </Suspense>

      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}
