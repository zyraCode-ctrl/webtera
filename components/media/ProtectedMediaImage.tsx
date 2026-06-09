"use client";

import { useState } from "react";
import { mediaApiPath } from "@/lib/mediaApi";

export function ProtectedMediaImage({
  postId,
  alt,
  className,
}: {
  postId: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = mediaApiPath(postId, "thumb");

  if (failed) {
    return (
      <div
        className={[
          "flex min-h-36 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-xs font-medium text-zinc-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Preview unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
