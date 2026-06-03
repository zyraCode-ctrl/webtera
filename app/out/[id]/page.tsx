import { notFound } from "next/navigation";
import { getPostById } from "@/data/posts";
import { LinkLoader } from "@/components/LinkLoader";
import { decodeFunnelFrom } from "@/lib/funnelRef";
import { resolvePostIdFromParam } from "@/lib/resolvePostId";

export const metadata = {
  title: "Almost there",
  robots: { index: false, follow: false },
};

export default function OutPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string; f?: string };
}) {
  const postId = resolvePostIdFromParam(params.id);
  if (!postId) notFound();
  const post = getPostById(postId);
  if (!post) notFound();

  const from: "video" | "download" =
    decodeFunnelFrom(searchParams.f) ??
    (searchParams.from === "download" ? "download" : "video");

  return <LinkLoader postId={postId} from={from} />;
}
