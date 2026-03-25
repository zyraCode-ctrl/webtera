export type Post = {
  id: string;
  title: string;
  preview: string;
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

const PREVIEW_OPENERS = [
  "Here's a quick preview of the core idea and what you'll learn in the full video.",
  "A common mistake most people make—this preview shows the setup and the fix direction.",
  "A short walkthrough preview that leads into the full step-by-step video.",
  "Preview of the results and the key framework—full video includes the complete breakdown.",
  "A focused preview that sets up the main lesson—watch the full clip for the full method.",
  "This snippet introduces the mindset shift; the full video walks through every detail.",
  "See the hook and the promise here—the complete breakdown is in the full video.",
  "A tight preview of the workflow; the full version includes templates and examples.",
  "Quick context and one actionable angle—expand in the full video for the rest.",
  "Teaser of the before/after; the full video shows how to get there consistently.",
];

export const posts: Post[] = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  const id = String(n);
  return {
    id,
    title: `Post ${n}: ${TITLE_SUFFIXES[i % TITLE_SUFFIXES.length]}`,
    preview: PREVIEW_OPENERS[i % PREVIEW_OPENERS.length],
    videoLink: `https://example.com/video/${n}`,
    igLink: `https://www.instagram.com/p/example${n}/`,
    downloadLink: `https://example.com/download/${n}`,
  };
});

export function getPostById(id: string) {
  return posts.find((p) => p.id === id);
}
