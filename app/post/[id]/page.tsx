import Link from "next/link";
import { notFound } from "next/navigation";
import { AdBox } from "@/components/AdBox";
import { PostCard } from "@/components/PostCard";
import { getPostById, posts } from "@/data/posts";

export function generateMetadata({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) return { title: "Post" };
  return { title: post.title };
}

export default function PostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) notFound();

  const related = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-w-0 w-full space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {post.title}
        </h1>
      </section>

      <AdBox type="banner" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-800">Preview</div>
        <p className="mt-3 text-sm leading-7 text-zinc-700">{post.preview}</p>
      </section>

      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <Link
          href={`/out/${encodeURIComponent(post.id)}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 sm:w-auto"
        >
          Watch Full Video
        </Link>
      </section>

      <AdBox type="inline" />

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

      <AdBox type="banner" />
    </div>
  );
}

