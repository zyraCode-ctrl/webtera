import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ig_pass";

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64_LOOKUP = (() => {
  const out = new Uint16Array(256);
  out.fill(65535);
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    out[BASE64_ALPHABET.charCodeAt(i)] = i;
  }
  return out;
})();

function base64UrlToBytes(input: string) {
  // Pure JS base64url decoding (no `atob`/`Buffer`).
  const padLen = (4 - (input.length % 4)) % 4;
  const base64 = (input + "=".repeat(padLen)).replace(/-/g, "+").replace(/_/g, "/");

  let padding = 0;
  if (base64.endsWith("==")) padding = 2;
  else if (base64.endsWith("=")) padding = 1;

  const outLen = (base64.length * 3) / 4 - padding;
  const out = new Uint8Array(outLen);

  let outIndex = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const c0 = base64.charCodeAt(i);
    const c1 = base64.charCodeAt(i + 1);
    const c2 = base64.charCodeAt(i + 2);
    const c3 = base64.charCodeAt(i + 3);

    const v0 = BASE64_LOOKUP[c0];
    const v1 = BASE64_LOOKUP[c1];
    const v2 = c2 === 61 /* '=' */ ? 0 : BASE64_LOOKUP[c2];
    const v3 = c3 === 61 /* '=' */ ? 0 : BASE64_LOOKUP[c3];
    if (v0 === 65535 || v1 === 65535 || v2 === 65535 || v3 === 65535) {
      throw new Error("[middleware] Invalid base64 input");
    }

    const triple = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    if (outIndex < outLen) out[outIndex++] = (triple >> 16) & 255;
    if (outIndex < outLen) out[outIndex++] = (triple >> 8) & 255;
    if (outIndex < outLen) out[outIndex++] = triple & 255;
  }

  return out;
}

function bytesToBase64Url(bytes: Uint8Array) {
  // Pure JS base64url encoding.
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


