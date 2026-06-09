import { hasMediaKind } from "@/data/mediaRegistry";

export type Post = {
  id: string;
  title: string;
  preview: string;
  /** Thumbnail loads via `/api/media/{id}?kind=thumb` — no public URL in client bundle. */
  hasThumb: boolean;
  /** Short preview on `/post/{id}` when true. */
  hasPreviewVideo: boolean;
  videoLink: string;
  igLink?: string;
  downloadLink?: string;
};

const TITLE_SUFFIXES = [
  "The simple tweak",
  "Fix this mistake",
  "The step-by-step",
  "Results you can copy",
  "Start here today",
  "What actually works",
  "Avoid the burnout",
  "Build momentum fast",
  "The hidden lever",
  "Clarity in minutes",
  "Your next win",
  "Repeatable system",
];


export const posts: Post[] = Array.from({ length: 2000 }, (_, i) => {
  const n = i + 1;
  const id = String(n);
  return {
    id,
    title: `Post ${n}: ${TITLE_SUFFIXES[i % TITLE_SUFFIXES.length]}`,
    hasThumb: hasMediaKind(id, "thumb"),
    hasPreviewVideo: hasMediaKind(id, "preview"),
    videoLink: `https://example.com/video/${n}`,
    igLink: `https://www.instagram.com/p/example${n}/`,
    downloadLink: `https://example.com/download/${n}`,
  };
});

export function getPostById(id: string) {
  return posts.find((p) => p.id === id);
}
