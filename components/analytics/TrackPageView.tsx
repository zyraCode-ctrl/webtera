"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import type { EventName } from "@/lib/events";

export function TrackPageView({
  event,
  path,
  postId,
  source,
}: {
  event: EventName;
  path: string;
  postId?: string;
  source?: string;
}) {
  useEffect(() => {
    trackEvent({ event, path, postId, source });
  }, [event, path, postId, source]);

  return null;
}

