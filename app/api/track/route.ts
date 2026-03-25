import { NextResponse } from "next/server";
import { sendServerEvent } from "@/lib/serverAnalytics";
import { checkRateLimit, getRateLimitKey } from "@/lib/rateLimit";

const MAX_BODY_BYTES = 8 * 1024;
const EVENT_RE = /^[a-z0-9_:-]{1,64}$/i;

type TrackBody = {
  event?: unknown;
  at?: unknown;
  path?: unknown;
  source?: unknown;
  postId?: unknown;
  meta?: unknown;
};

function asShortString(value: unknown, maxLen: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) return undefined;
  return trimmed;
}

function sanitizeMeta(meta: unknown): Record<string, unknown> | undefined {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return undefined;
  const entries = Object.entries(meta as Record<string, unknown>).slice(0, 20);
  const out: Record<string, unknown> = {};
  for (const [k, v] of entries) {
    if (!k || k.length > 40) continue;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
    ) {
      out[k] = typeof v === "string" ? v.slice(0, 200) : v;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: Request) {
  try {
    const key = `track:${getRateLimitKey(req)}`;
    const rl = checkRateLimit(key, 60, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ ok: false, error: "invalid_content_type" }, { status: 415 });
    }

    const raw = await req.text();
    if (!raw || raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "invalid_body_size" }, { status: 413 });
    }

    const data = JSON.parse(raw) as TrackBody;
    const event = asShortString(data.event, 64);
    if (!event || !EVENT_RE.test(event)) {
      return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
    }

    const path = asShortString(data.path, 256);
    if (path && !path.startsWith("/")) {
      return NextResponse.json({ ok: false, error: "invalid_path" }, { status: 400 });
    }

    const result = await sendServerEvent({
      event,
      at: asShortString(data.at, 64),
      path,
      source: asShortString(data.source, 40),
      postId: asShortString(data.postId, 20),
      meta: sanitizeMeta(data.meta),
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

