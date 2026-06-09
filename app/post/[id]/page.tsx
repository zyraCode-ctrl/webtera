import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ProtectedMediaVideo } from "@/components/media/ProtectedMediaVideo";
import { hasMediaKind } from "@/lib/mediaApi";
import { PostCard } from "@/components/PostCard";
import { getPostById, posts } from "@/data/posts";
import { funnelHelpPath } from "@/lib/funnelRef";
import { resolvePostIdFromParam } from "@/lib/resolvePostId";

export function generateMetadata({ params }: { params: { id: string } }) {
  const postId = resolvePostIdFromParam(params.id);
  const post = postId ? getPostById(postId) : undefined;
  if (!post) return { title: "Post" };
  return { title: post.title };
}

export default function PostPage({ params }: { params: { id: string } }) {
  const postId = resolvePostIdFromParam(params.id);
  const post = postId ? getPostById(postId) : undefined;
  if (!post) notFound();

  const related = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-w-0 w-full space-y-6">
      <section className="surface-panel p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {post.title}
        </h1>
      </section>

      <AdSlot type="banner" variant="topBanner" />

      <section className="surface-panel p-6">
        <div className="text-sm font-medium text-zinc-800">Preview</div>
        <p className="mt-3 text-sm leading-7 text-zinc-700">{post.preview}</p>
      </section>

      {hasMediaKind(post.id, "preview") ? (
        <section id="preview" className="surface-panel scroll-mt-24 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Short preview</h2>
          <ProtectedMediaVideo
            postId={post.id}
            kind="preview"
            className="mt-4 aspect-video w-full max-h-[min(70vh,720px)] rounded-xl border border-zinc-200 bg-black object-contain shadow-md select-none"
          />
        </section>
      ) : null}

      <AdSlot type="inline" variant="inContent" />

      <div className="flex justify-center px-1 py-1 sm:px-0 sm:py-2">
        <Link
          href={funnelHelpPath(post.id, "video")}
          className="inline-flex w-full min-h-11 max-w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-zinc-800 sm:max-w-none"
        >
          Watch Full Video
        </Link>
      </div>

      <AdSlot type="inline" variant="inContent" />

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Related posts
          </h2>
          <Link
            href="/go"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-950"
          >
            All posts
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {related.map((p) => (
            <PostCard key={p.id} id={p.id} title={p.title} preview={p.preview} />
          ))}
        </div>
      </section>

      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}

