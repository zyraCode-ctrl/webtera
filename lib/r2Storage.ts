import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { Readable } from "node:stream";

import type { MediaSource } from "@/data/mediaRegistry";



let client: S3Client | null = null;



export type FetchMediaOptions = {

  rangeHeader?: string | null;

  signal?: AbortSignal;

};



export type MediaPayload = {

  body: ReadableStream<Uint8Array>;

  contentType: string;

  contentLength?: number;

  contentRange?: string;

  status: number;

};



function getR2Config() {

  const accountId = process.env.R2_ACCOUNT_ID?.trim();

  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();

  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  const bucket = process.env.R2_BUCKET_NAME?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;

  return { accountId, accessKeyId, secretAccessKey, bucket };

}



function getR2Client() {

  const cfg = getR2Config();

  if (!cfg) return null;

  if (!client) {

    client = new S3Client({

      region: "auto",

      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,

      credentials: {

        accessKeyId: cfg.accessKeyId,

        secretAccessKey: cfg.secretAccessKey,

      },

    });

  }

  return { client, bucket: cfg.bucket };

}



function getLegacyPublicBase() {

  return process.env.R2_LEGACY_PUBLIC_BASE_URL?.trim()?.replace(/\/+$/, "");

}



export function isR2Configured() {

  return getR2Config() != null;

}



/** Local SVG placeholder — avoids flaky external picsum.photos fetches on the server. */

function localPlaceholderImage(seed: string, width: number, height: number): MediaPayload {

  const label = seed.replace(/^webtera-post-/, "#") || "Post";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">

  <defs>

    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">

      <stop offset="0%" stop-color="#e4e4e7"/>

      <stop offset="100%" stop-color="#d4d4d8"/>

    </linearGradient>

  </defs>

  <rect width="100%" height="100%" fill="url(#g)"/>

  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#52525b" font-family="system-ui,sans-serif" font-size="28" font-weight="600">${label}</text>

</svg>`;

  const bytes = new TextEncoder().encode(svg);

  return {

    body: new ReadableStream({

      start(controller) {

        controller.enqueue(bytes);

        controller.close();

      },

    }),

    contentType: "image/svg+xml; charset=utf-8",

    contentLength: bytes.length,

    status: 200,

  };

}



function nodeReadableToWebStream(source: Readable, signal?: AbortSignal): ReadableStream<Uint8Array> {

  let cleaned = false;



  const cleanup = () => {

    if (cleaned) return;

    cleaned = true;

    source.removeListener("data", onData);

    source.removeListener("end", onEnd);

    source.removeListener("close", onEnd);

    source.removeListener("error", onError);

    if (!source.destroyed) source.destroy();

  };



  let controller!: ReadableStreamDefaultController<Uint8Array>;



  const onData = (chunk: Buffer | Uint8Array) => {

    try {

      const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);

      controller.enqueue(bytes);

    } catch {

      cleanup();

    }

  };

  const onEnd = () => {

    try {

      controller.close();

    } catch {

      /* stream already closed */

    }

    cleanup();

  };

  const onError = (err: Error) => {

    try {

      controller.error(err);

    } catch {

      /* stream already closed */

    }

    cleanup();

  };



  return new ReadableStream<Uint8Array>({

    start(ctrl) {

      controller = ctrl;

      source.on("data", onData);

      source.on("end", onEnd);

      source.on("close", onEnd);

      source.on("error", onError);



      if (signal) {

        if (signal.aborted) {

          cleanup();

          try {

            controller.close();

          } catch {

            /* noop */

          }

          return;

        }

        signal.addEventListener("abort", cleanup, { once: true });

      }

    },

    cancel() {

      cleanup();

    },

  });

}



async function fetchR2Object(

  key: string,

  options?: FetchMediaOptions

): Promise<MediaPayload | null> {

  const r2 = getR2Client();

  if (!r2) return null;



  const rangeHeader = options?.rangeHeader?.trim();

  try {

    const out = await r2.client.send(

      new GetObjectCommand({

        Bucket: r2.bucket,

        Key: key,

        ...(rangeHeader ? { Range: rangeHeader } : {}),

      })

    );

    if (!out.Body) return null;



    const nodeStream = out.Body as Readable;

    return {

      body: nodeReadableToWebStream(nodeStream, options?.signal),

      contentType: out.ContentType || guessContentType(key),

      contentLength: out.ContentLength,

      contentRange: out.ContentRange,

      status: out.ContentRange ? 206 : 200,

    };

  } catch (err) {

    const code = (err as { Code?: string; name?: string })?.Code ?? (err as { name?: string })?.name;

    if (code === "NoSuchKey" || code === "NotFound") {

      console.error("[r2] Object not found:", key);

      return null;

    }

    console.error("[r2] GetObject failed:", key, err);

    return null;

  }

}



export async function fetchMediaBytes(

  source: MediaSource,

  options?: FetchMediaOptions

): Promise<MediaPayload | null> {

  if (source.type === "placeholder") {

    return localPlaceholderImage(source.seed, source.width ?? 640, source.height ?? 360);

  }



  if (source.type === "external") {

    try {

      const headers: HeadersInit = {};

      if (options?.rangeHeader) headers.Range = options.rangeHeader;

      const res = await fetch(source.url, {

        cache: "no-store",

        redirect: "follow",

        headers,

        signal: options?.signal,

      });

      if (!res.ok || !res.body) return null;

      return {

        body: res.body,

        contentType: res.headers.get("content-type") || "application/octet-stream",

        contentLength: Number(res.headers.get("content-length") || "") || undefined,

        contentRange: res.headers.get("content-range") || undefined,

        status: res.status,

      };

    } catch (err) {

      console.error("[media] external fetch failed:", source.url, err);

      return null;

    }

  }



  if (source.type === "r2") {

    const payload = await fetchR2Object(source.key, options);

    if (payload) return payload;

  }



  const legacyBase = getLegacyPublicBase();

  if (legacyBase && source.type === "r2" && process.env.R2_LEGACY_FALLBACK === "1") {

    try {

      const url = `${legacyBase}/${source.key.split("/").map((seg) => encodeURIComponent(seg)).join("/")}`;

      const headers: HeadersInit = {};

      if (options?.rangeHeader) headers.Range = options.rangeHeader;

      const res = await fetch(url, { cache: "no-store", headers, signal: options?.signal });

      if (!res.ok || !res.body) return null;

      return {

        body: res.body,

        contentType: res.headers.get("content-type") || guessContentType(source.key),

        contentLength: Number(res.headers.get("content-length") || "") || undefined,

        contentRange: res.headers.get("content-range") || undefined,

        status: res.status,

      };

    } catch (err) {

      console.error("[media] legacy R2 fetch failed:", err);

      return null;

    }

  }



  return null;

}



export async function headR2Object(key: string) {

  const r2 = getR2Client();

  if (!r2) return null;

  try {

    return await r2.client.send(new HeadObjectCommand({ Bucket: r2.bucket, Key: key }));

  } catch {

    return null;

  }

}



function guessContentType(key: string) {

  const lower = key.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";

  if (lower.endsWith(".webp")) return "image/webp";

  if (lower.endsWith(".mp4")) return "video/mp4";

  if (lower.endsWith(".webm")) return "video/webm";

  return "application/octet-stream";

}


