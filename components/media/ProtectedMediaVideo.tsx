"use client";

import { useState } from "react";
import type { MediaKind } from "@/data/mediaRegistry";
import { mediaApiPath } from "@/lib/mediaApi";

export function ProtectedMediaVideo({
  postId,
  kind = "preview",
  className,
  preload = "metadata",
  onPlay,
}: {
  postId: string;
  kind?: Extract<MediaKind, "preview" | "full">;
  className?: string;
  preload?: "none" | "metadata" | "auto";
  onPlay?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const src = mediaApiPath(postId, kind);

  if (failed) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Video could not be loaded. Open the help page again from your channel link.
      </p>
    );
  }

  return (
    <video
      key={src}
      src={src}
      controls
      controlsList="nodownload"
      playsInline
      preload={preload}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={className}
      onPlay={onPlay}
      onError={() => setFailed(true)}
    />
  );
}
