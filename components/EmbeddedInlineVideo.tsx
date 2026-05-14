"use client";

type Props = {
  src: string;
  className?: string;
};

/**
 * Client-only wrapper so we can use context-menu suppression on `<video>`
 * from Server Component pages (Next forbids event handlers on server-rendered nodes).
 */
export function EmbeddedInlineVideo({ src, className }: Props) {
  return (
    <video
      src={src}
      controls
      controlsList="nodownload"
      playsInline
      preload="metadata"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={className}
    />
  );
}
