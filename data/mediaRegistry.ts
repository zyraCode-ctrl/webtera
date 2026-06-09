/**

 * Server-only media catalog. R2 object keys — never ship public URLs to the client.

 */



import { getR2VideoKey, hasR2Video } from "@/data/r2VideoIndex";



export type MediaKind = "thumb" | "preview" | "full";



export type MediaSource =

  | { type: "r2"; key: string }

  | { type: "placeholder"; seed: string; width?: number; height?: number }

  | { type: "external"; url: string };



type PostMedia = Partial<Record<MediaKind, MediaSource>>;



/**

 * Optional per-post overrides (custom keys, preview-only, external thumbs).

 * Most posts use flat `{postId}.mp4` from the bucket index — run `npm run sync-r2` after uploads.

 */

const R2_POST_MEDIA: Record<string, PostMedia> = {};



/** Posts that show a short preview on `/post/{id}` (same R2 file as full). */

const R2_PREVIEW_POST_IDS = new Set(["32", "34"]);



/** External URLs (not proxied through R2 API). */

const EXTERNAL_POST_MEDIA: Record<string, PostMedia> = {};



function placeholderThumb(postId: string): MediaSource {

  return {

    type: "placeholder",

    seed: `webtera-post-${postId}`,

    width: 640,

    height: 360,

  };

}



function defaultR2Video(postId: string): MediaSource | undefined {

  const key = getR2VideoKey(postId);

  if (!key) return undefined;

  return { type: "r2", key };

}



export function getMediaSource(postId: string, kind: MediaKind): MediaSource | undefined {

  const id = postId.trim();

  if (!id) return undefined;



  const override = R2_POST_MEDIA[id]?.[kind];

  if (override) return override;



  const external = EXTERNAL_POST_MEDIA[id]?.[kind];

  if (external) return external;



  if (kind === "full" && hasR2Video(id)) {

    return defaultR2Video(id);

  }



  if (kind === "preview" && R2_PREVIEW_POST_IDS.has(id) && hasR2Video(id)) {

    return defaultR2Video(id);

  }



  if (kind === "thumb") return placeholderThumb(id);



  return undefined;

}



export function hasMediaKind(postId: string, kind: MediaKind): boolean {

  return getMediaSource(postId, kind) != null;

}



export function isR2MediaSource(source: MediaSource | undefined): source is { type: "r2"; key: string } {

  return source?.type === "r2";

}


