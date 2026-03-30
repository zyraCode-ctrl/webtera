import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendServerEvent } from "@/lib/serverAnalytics";
import { getRequiredEnv } from "@/lib/env";

const COOKIE_NAME = "ig_pass";
const FUNNEL_TTL_SECONDS = 6 * 60;

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64Url(bytes: Uint8Array) {
  // Pure JS base64url encoding so this works in all Vercel runtimes
  // (Edge may not provide `btoa` and `Buffer`).
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
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return new Uint8Array(sig);
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
  const payloadB64 = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ src, exp }))
  );
  const sig = await hmacSha256(secret, payloadB64);
  const token = `${payloadB64}.${bytesToBase64Url(sig)}`;

  const res = NextResponse.redirect(new URL("/go", req.url));
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FUNNEL_TTL_SECONDS,
  });
  res.cookies.set({
    name: "ig_src",
    value: src,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FUNNEL_TTL_SECONDS,
  });

  const analyticsResult = await sendServerEvent({
    event: "ig_entry",
    source: src,
    path: analyticsPath,
  });
  if (!analyticsResult.ok) {
    console.error("[ig] analytics event failed:", analyticsResult.error);
  }
  return res;
}
