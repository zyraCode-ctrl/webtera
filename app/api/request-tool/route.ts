import { NextResponse } from "next/server";
import { getRequiredEnv } from "@/lib/env";
import { postJsonWithTimeout } from "@/lib/http";
import { checkRateLimit, getRateLimitKey } from "@/lib/rateLimit";

type RequestToolPayload = {
  name: string;
  email: string;
  toolName: string;
  details: string;
  at: string;
};

const MAX_BODY_BYTES = 16 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeString(v: unknown, maxLen: number) {
  return typeof v === "string" ? v.trim() : "";
}

function parseAndValidate(body: unknown): RequestToolPayload | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const data = body as Record<string, unknown>;
  const name = safeString(data.name, 80).slice(0, 80);
  const email = safeString(data.email, 120).slice(0, 120);
  const toolName = safeString(data.toolName, 120).slice(0, 120);
  const details = safeString(data.details, 2000).slice(0, 2000);
  if (!toolName || !details) return null;
  if (email && !EMAIL_RE.test(email)) return null;
  return {
    name,
    email,
    toolName,
    details,
    at: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const key = `request_tool:${getRateLimitKey(req)}`;
    const rl = await checkRateLimit(key, 12, 60_000);
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

    const payload = parseAndValidate(JSON.parse(raw));
    if (!payload) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const webhook =
      process.env.NODE_ENV === "production"
        ? getRequiredEnv("REQUEST_TOOL_WEBHOOK_URL")
        : process.env.REQUEST_TOOL_WEBHOOK_URL;
    if (webhook) {
      try {
        await postJsonWithTimeout(webhook, payload, 7000);
      } catch {
        return NextResponse.json({ ok: false, error: "request_tool_webhook_failed" }, { status: 502 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

