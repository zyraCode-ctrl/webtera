import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import { HelpPage } from "@/components/HelpPage";
import { Suspense } from "react";

export function generateStaticParams() {
  return posts.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Help – Post #${params.id}`,
    robots: { index: false, follow: false },
  };
}

export default function HelpPageRoute({
  params,
}: {
  params: { id: string };
}) {
  // Validate post id exists
  const post = posts.find((p) => p.id === params.id);
  if (!post) notFound();

  return (
    <Suspense fallback={null}>
      <HelpPage postId={params.id} />
    </Suspense>
  );
}
