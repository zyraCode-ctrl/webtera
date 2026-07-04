import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applyFunnelPassCookies, IG_PASS_QUERY_PARAM } from "@/lib/funnelAuth";
import { sendServerEvent } from "@/lib/serverAnalytics";
import { getRequiredEnv } from "@/lib/env";
import { EVENTS } from "@/lib/events";
import { encodeGoListQuery } from "@/lib/funnelRef";

const FUNNEL_TTL_SECONDS = 6 * 60;

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64Url(bytes: Uint8Array) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const has1 = i + 1 < bytes.length;
    const has2 = i + 2 < bytes.length;
    const b1 = has1 ? bytes[i + 1] : 0;
    const b2 = has2 ? bytes[i + 2] : 0;

    const triplet = (b0 << 16) | (b1 << 8) | b2;
    out += BASE64_ALPHABET[(triplet >> 18) & 63];
    out += BASE64_ALPHABET[(triplet >> 12) & 63];
    out += has1 ? BASE64_ALPHABET[(triplet >> 6) & 63] : "=";
    out += has2 ? BASE64_ALPHABET[triplet & 63] : "=";
  }
  return out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

function funnelEntryLandingHtml(nextPath: string) {
  const safeAttr = nextPath.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${safeAttr}" />
  <title>Loading…</title>
  <style>body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#fafafa;color:#333}</style>
</head>
<body>
  <p>Loading your posts…</p>
  <script>location.replace(${JSON.stringify(nextPath)})</script>
</body>
</html>`;
}

export async function issueFunnelAccess(
  req: NextRequest,
  src: "a" | "b",
  analyticsPath: string
) {
  const secret =
    process.env.NODE_ENV === "production"
      ? getRequiredEnv("IG_FUNNEL_SECRET")
      : process.env.IG_FUNNEL_SECRET;
  if (!secret) return NextResponse.redirect(new URL("/", req.url));

  const exp = Date.now() + FUNNEL_TTL_SECONDS * 1000;
  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ src, exp })));
  const sig = await hmacSha256(secret, payloadB64);
  const token = `${payloadB64}.${bytesToBase64Url(sig)}`;

  const goQ = encodeGoListQuery({ entry: true });
  const goUrl = new URL(goQ ? `/go?q=${encodeURIComponent(goQ)}` : "/go", req.url);
  goUrl.searchParams.set(IG_PASS_QUERY_PARAM, token);
  const nextPath = `${goUrl.pathname}${goUrl.search}`;

  // HTML landing (not 302): in-app browsers (Meta/Facebook) often drop Set-Cookie on redirect chains.
  const res = new NextResponse(funnelEntryLandingHtml(nextPath), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
  applyFunnelPassCookies(res, token, src);

  const analyticsResult = await sendServerEvent({
    event: EVENTS.igEntry,
    source: src,
    path: analyticsPath,
  });
  if (!analyticsResult.ok) {
    console.error("[ig] analytics event failed:", analyticsResult.error);
  }
  return res;
}
