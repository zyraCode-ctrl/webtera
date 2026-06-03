import { notFound } from "next/navigation";
import { HelpPage } from "@/components/HelpPage";
import { getPostById } from "@/data/posts";
import { resolvePostIdFromParam } from "@/lib/resolvePostId";
import { Suspense } from "react";

export function generateMetadata({ params }: { params: { id: string } }) {
  const postId = resolvePostIdFromParam(params.id);
  return {
    title: postId ? `Help – Post #${postId}` : "Help",
    robots: { index: false, follow: false },
  };
}

export default function HelpPageRoute({
  params,
}: {
  params: { id: string };
}) {
  const postId = resolvePostIdFromParam(params.id);
  if (!postId || !getPostById(postId)) notFound();

  return (
    <Suspense fallback={null}>
      <HelpPage postId={postId} />
    </Suspense>
  );
}
