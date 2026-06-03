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
      </section>

      <AdSlot type="banner" variant="topBanner" />

      <Suspense fallback={null}>
        <GoPostList posts={posts} />
      </Suspense>

      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}
