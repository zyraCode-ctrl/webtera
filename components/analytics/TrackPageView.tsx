"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackPageView({
  event,
  path,
  postId,
  source,
}: {
  event: string;
  path: string;
  postId?: string;
  source?: string;
}) {
  useEffect(() => {
    trackEvent({ event, path, postId, source });
  }, [event, path, postId, source]);

  return null;
}

