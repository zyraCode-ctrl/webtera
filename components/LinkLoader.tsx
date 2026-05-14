"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { trackEvent } from "@/lib/analytics";
import { LINK_LOADER_SECONDS } from "@/lib/funnelTiming";
import { EVENTS } from "@/lib/events";

const DURATION = LINK_LOADER_SECONDS;

export function LinkLoader({
  postId,
  from,
}: {
  postId: string;
  from: string;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(DURATION);

  useEffect(() => {
    trackEvent({
      event: EVENTS.outLoaderStarted,
      path: `/out/${postId}`,
      postId,
      source: from,
    });
  }, [postId, from]);

  useEffect(() => {
    if (seconds <= 0) {
      trackEvent({
        event: EVENTS.outLoaderCompleted,
        path: `/out/${postId}`,
        postId,
        source: from,
      });
      router.push(`/help/${encodeURIComponent(postId)}?from=${encodeURIComponent(from)}`);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, postId, from, router]);

  const progress = ((DURATION - seconds) / DURATION) * 100;

  return (
    <div className="min-w-0 w-full space-y-6">
      <AdSlot type="banner" variant="topBanner" />

      <section className="mx-auto w-full max-w-lg surface-panel p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-violet-600" />
        <h1 className="text-xl font-semibold text-zinc-950">Almost there</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          You’re almost on the help page for this post. From there you’ll use the
          Link button to open the video (with a quick sponsor step). This short
          pause keeps your session tied to the correct post.
        </p>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-[width] duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Continuing in {seconds} {seconds === 1 ? "second" : "seconds"}…
        </div>
      </section>

      <div className="mx-auto w-full max-w-lg">
        <AdSlot type="inline" variant="inContent" />
      </div>
    </div>
  );
}
