import type { NextRequest } from "next/server";

export const IG_PASS_COOKIE = "ig_pass";

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
    const v2 = c2 === 61 ? 0 : BASE64_LOOKUP[c2];
    const v3 = c3 === 61 ? 0 : BASE64_LOOKUP[c3];
    if (v0 === 65535 || v1 === 65535 || v2 === 65535 || v3 === 65535) {
      throw new Error("[funnelAuth] Invalid base64 input");
    }
    const triple = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    if (outIndex < outLen) out[outIndex++] = (triple >> 16) & 255;
    if (outIndex < outLen) out[outIndex++] = (triple >> 8) & 255;
    if (outIndex < outLen) out[outIndex++] = triple & 255;
  }
  return out;
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

export async function verifyIgPassToken(token: string, secret: string) {
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
  if (payload.src !== "a" && payload.src !== "b") return false;

  const expected = await hmacSha256(secret, payloadB64);
  const got = base64UrlToBytes(sigB64);
  if (got.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ expected[i];
  return diff === 0;
}

export function getIgFunnelSecret() {
  return process.env.IG_FUNNEL_SECRET?.trim() || "";
}

function readIgPassToken(req: NextRequest | Request) {
  if ("cookies" in req && typeof req.cookies?.get === "function") {
    const fromJar = req.cookies.get(IG_PASS_COOKIE)?.value;
    if (fromJar) return fromJar;
  }
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${IG_PASS_COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

/** True when request has a valid short-lived Instagram funnel cookie. */
export async function hasValidIgPass(req: NextRequest | Request) {
  const secret = getIgFunnelSecret();
  if (!secret) return false;
  const token = readIgPassToken(req);
  if (!token) return false;
  return verifyIgPassToken(token, secret);
}
