import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getMediaSource, type MediaKind } from "@/data/mediaRegistry";
import { hasValidIgPass } from "@/lib/funnelAuth";
import { fetchMediaBytes } from "@/lib/r2Storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: MediaKind[] = ["thumb", "preview", "full"];

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  if (!(await hasValidIgPass(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = params.postId?.trim();
  if (!postId || !/^\d+$/.test(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const kindRaw = req.nextUrl.searchParams.get("kind");
  const kind = KINDS.includes(kindRaw as MediaKind) ? (kindRaw as MediaKind) : null;
  if (!kind) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const source = getMediaSource(postId, kind);
  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let payload: Awaited<ReturnType<typeof fetchMediaBytes>>;
  try {
    payload = await fetchMediaBytes(source, {
      rangeHeader: req.headers.get("range"),
      signal: req.signal,
    });
  } catch (err) {
    console.error("[media] fetch failed:", postId, kind, err);
    return NextResponse.json({ error: "Media fetch failed" }, { status: 503 });
  }
  if (!payload) {
    return NextResponse.json(
      { error: "Media unavailable. Check R2 credentials or R2_LEGACY_PUBLIC_BASE_URL." },
      { status: 503 }
    );
  }

  const headers = new Headers({
    "Content-Type": payload.contentType,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  if (payload.contentLength != null) {
    headers.set("Content-Length", String(payload.contentLength));
  }
  if (payload.contentRange) {
    headers.set("Content-Range", payload.contentRange);
  }

  return new NextResponse(payload.body, { status: payload.status, headers });
}
