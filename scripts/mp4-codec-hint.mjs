#!/usr/bin/env node
/** Print video/audio codec hints from an MP4 in R2. Usage: node scripts/mp4-codec-hint.mjs 21 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const postId = process.argv[2]?.trim() || "21";
const key = `${postId}.mp4`;

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const headMeta = await client.send(
  new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
);
const totalSize = headMeta.ContentLength ?? 0;

const head = await client.send(
  new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Range: "bytes=0-524287",
  })
);
const totalSizeFromRange = head.ContentLength ?? 0;
const headBuf = Buffer.from(await head.Body.transformToByteArray());

let tailBuf = Buffer.alloc(0);
if (totalSize > 524288) {
  const tailStart = Math.max(0, totalSize - 524288);
  const tail = await client.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Range: `bytes=${tailStart}-${totalSize - 1}`,
    })
  );
  tailBuf = Buffer.from(await tail.Body.transformToByteArray());
}

const buf = Buffer.concat([headBuf, tailBuf]);
const text = buf.toString("binary");

function findFourCC(label) {
  return buf.indexOf(label) >= 0;
}

const hints = [];
for (const c of ["avc1", "avc3", "hvc1", "hev1", "av01", "mp4v", "vp09", "mp4a"]) {
  if (findFourCC(c)) hints.push(c);
}

console.log(`File: ${key} (${totalSize} bytes total)`);
console.log(`Codec fourCC hints: ${hints.length ? hints.join(", ") : "(none found)"}`);

const videoCodecs = hints.filter((c) => !c.startsWith("mp4a"));
const audioCodecs = hints.filter((c) => c.startsWith("mp4a"));

if (videoCodecs.some((c) => c.startsWith("hvc") || c.startsWith("hev"))) {
  console.log("\n⚠️  HEVC/H.265 detected — many browsers on Windows/Android show black video (audio only).");
  console.log("   Re-encode to H.264 (avc1) + AAC before upload.");
} else if (videoCodecs.includes("avc1") || videoCodecs.includes("avc3")) {
  console.log("\n✅ H.264 video — should play in all modern browsers.");
} else if (videoCodecs.length === 0 && audioCodecs.length) {
  console.log("\n⚠️  Only audio track found — file may be audio-only or video uses rare codec.");
}
