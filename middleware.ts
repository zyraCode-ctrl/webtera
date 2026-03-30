import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ig_pass";

function base64UrlToBytes(input: string) {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  // `atob` is available in many runtimes (browser/edge), but not guaranteed in all Next
  // middleware execution environments. Fall back to `Buffer` for Node compatibility.
  if (typeof atob === "function") {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(b64, "base64");
    return new Uint8Array(buf);
  }

  throw new Error("[middleware] No base64 decoder available");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

async function verifyPass(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;

  let payloadText = "";
  try {
    payloadText = new TextDecoder().decode(base64UrlToBytes(payloadB64));
  } catch {
    return false;
  }

  let payload: { exp?: number; src?: string } | null = null;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    return false;
  }

  if (!payload?.exp || typeof payload.exp !== "number") return false;
  if (Date.now() > payload.exp) return false;

  // Only allow tokens we issue for Instagram sources.
  if (payload.src !== "a" && payload.src !== "b") return false;

  const expected = await hmacSha256(secret, payloadB64);
  const got = base64UrlToBytes(sigB64);
  if (got.length !== expected.length) return false;

  // Constant-time compare
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ expected[i];
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  const secret = process.env.IG_FUNNEL_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const token = req.cookies.get(COOKIE_NAME)?.value;

  const ok = token ? await verifyPass(token, secret) : false;
  if (ok) return NextResponse.next();

  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/go", "/post/:path*", "/out/:path*", "/help/:path*"],
};


