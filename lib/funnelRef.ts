/**
 * Opaque funnel URLs — encoded post refs and compact query tokens.
 * Plain numeric paths (?search=, ?from=) are still accepted for old bookmarks.
 */

export type FunnelFrom = "video" | "download";

export type GoListQuery = {
  search?: string;
  page?: number;
  entry?: boolean;
};

const POST_PREFIX = "wt1.";
const GO_QUERY_PREFIX = "q1.";

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64Url(bytes: Uint8Array): string {
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

function base64UrlToBytes(input: string): Uint8Array {
  const padLen = (4 - (input.length % 4)) % 4;
  const base64 = (input + "=".repeat(padLen)).replace(/-/g, "+").replace(/_/g, "/");
  const lookup = new Uint16Array(256);
  lookup.fill(65535);
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    lookup[BASE64_ALPHABET.charCodeAt(i)] = i;
  }
  let padding = 0;
  if (base64.endsWith("==")) padding = 2;
  else if (base64.endsWith("=")) padding = 1;
  const outLen = (base64.length * 3) / 4 - padding;
  const out = new Uint8Array(outLen);
  let outIndex = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const v0 = lookup[base64.charCodeAt(i)];
    const v1 = lookup[base64.charCodeAt(i + 1)];
    const c2 = base64.charCodeAt(i + 2);
    const c3 = base64.charCodeAt(i + 3);
    const v2 = c2 === 61 ? 0 : lookup[c2];
    const v3 = c3 === 61 ? 0 : lookup[c3];
    if (v0 === 65535 || v1 === 65535 || v2 === 65535 || v3 === 65535) {
      throw new Error("Invalid base64url");
    }
    const triple = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    if (outIndex < outLen) out[outIndex++] = (triple >> 16) & 255;
    if (outIndex < outLen) out[outIndex++] = (triple >> 8) & 255;
    if (outIndex < outLen) out[outIndex++] = triple & 255;
  }
  return out;
}

function packJson(obj: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

function unpackJson<T>(b64: string): T | undefined {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(b64))) as T;
  } catch {
    return undefined;
  }
}

/** Encode post id for `/help/{ref}`, `/post/{ref}`, `/out/{ref}`. */
export function encodePostRef(postId: string): string {
  const id = postId.trim();
  if (!id) return "";
  return `${POST_PREFIX}${packJson({ i: id })}`;
}

/** Decode post ref from path segment; accepts legacy plain numeric ids. */
export function decodePostRef(ref: string): string | undefined {
  const raw = decodeURIComponent(ref).trim();
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return raw;
  if (!raw.startsWith(POST_PREFIX)) return undefined;
  const payload = unpackJson<{ i?: string }>(raw.slice(POST_PREFIX.length));
  const id = payload?.i?.trim();
  return id || undefined;
}

const FROM_TO_TOKEN: Record<FunnelFrom, string> = {
  video: "dmVv",
  download: "ZGxu",
};

const TOKEN_TO_FROM = new Map<string, FunnelFrom>(
  Object.entries(FROM_TO_TOKEN).map(([k, v]) => [v, k as FunnelFrom])
);

export function encodeFunnelFrom(from: FunnelFrom): string {
  return FROM_TO_TOKEN[from];
}

export function decodeFunnelFrom(token: string | null | undefined): FunnelFrom | undefined {
  if (!token) return undefined;
  const t = token.trim();
  const mapped = TOKEN_TO_FROM.get(t);
  if (mapped) return mapped;
  if (t === "video") return "video";
  if (t === "download") return "download";
  return undefined;
}

export function funnelHelpPath(postId: string, from: FunnelFrom = "video"): string {
  return `/help/${encodePostRef(postId)}?f=${encodeFunnelFrom(from)}`;
}

export function funnelPostPath(postId: string): string {
  return `/post/${encodePostRef(postId)}`;
}

export function funnelOutPath(postId: string, from: FunnelFrom = "video"): string {
  return `/out/${encodePostRef(postId)}?f=${encodeFunnelFrom(from)}`;
}

/** Compact `/go` state: `?q=q1.{base64url}` */
export function encodeGoListQuery(state: GoListQuery): string | undefined {
  const payload: Record<string, string | number> = {};
  const search = state.search?.trim();
  if (search) payload.s = search;
  if (state.page && state.page > 1) payload.p = state.page;
  if (state.entry) payload.e = 1;
  if (Object.keys(payload).length === 0) return undefined;
  return `${GO_QUERY_PREFIX}${packJson(payload)}`;
}

export function decodeGoListQuery(encoded: string | null | undefined): GoListQuery {
  if (!encoded?.trim()) return {};
  const raw = encoded.trim();
  if (!raw.startsWith(GO_QUERY_PREFIX)) return {};
  const payload = unpackJson<{ s?: string; p?: number; e?: number }>(raw.slice(GO_QUERY_PREFIX.length));
  if (!payload) return {};
  const out: GoListQuery = {};
  if (typeof payload.s === "string" && payload.s.trim()) out.search = payload.s.trim();
  if (typeof payload.p === "number" && Number.isFinite(payload.p) && payload.p > 1) {
    out.page = Math.floor(payload.p);
  }
  if (payload.e === 1) out.entry = true;
  return out;
}

/** Read `/go` list state from URL (encoded `q` + legacy plain params). */
export function readGoListState(params: URLSearchParams): GoListQuery {
  const decoded = decodeGoListQuery(params.get("q"));
  const legacySearch = params.get("search")?.trim();
  const legacyPageRaw = params.get("page");
  const legacyPage = legacyPageRaw ? parseInt(legacyPageRaw, 10) : undefined;
  const legacyEntry = params.get("from_entry") === "1";

  return {
    search: decoded.search ?? (legacySearch || undefined),
    page:
      decoded.page ??
      (legacyPage && Number.isFinite(legacyPage) && legacyPage > 1 ? legacyPage : undefined),
    entry: decoded.entry ?? (legacyEntry ? true : undefined),
  };
}

export function applyGoListState(base: URLSearchParams, state: GoListQuery): URLSearchParams {
  const next = new URLSearchParams(base.toString());
  next.delete("q");
  next.delete("search");
  next.delete("page");
  next.delete("from_entry");

  const encoded = encodeGoListQuery(state);
  if (encoded) next.set("q", encoded);
  return next;
}

export const __testables = {
  bytesToBase64Url,
  base64UrlToBytes,
  packJson,
};
