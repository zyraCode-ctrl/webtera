import { notFound } from "next/navigation";
import { getPostById, posts } from "@/data/posts";
import { LinkLoader } from "@/components/LinkLoader";

export function generateStaticParams() {
  return posts.map((p) => ({ id: p.id }));
}

export const metadata = {
  title: "Almost there",
  robots: { index: false, follow: false },
};

export default function OutPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const post = getPostById(params.id);
  if (!post) notFound();

  const from = searchParams.from === "download" ? "download" : "video";

  return <LinkLoader postId={params.id} from={from} />;
}
