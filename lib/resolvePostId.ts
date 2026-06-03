import { getPostById } from "@/data/posts";
import { decodePostRef } from "@/lib/funnelRef";

/** Resolve encoded or legacy path segment to a post id. */
export function resolvePostIdFromParam(param: string): string | undefined {
  const id = decodePostRef(param);
  if (!id) return undefined;
  return getPostById(id) ? id : undefined;
}
