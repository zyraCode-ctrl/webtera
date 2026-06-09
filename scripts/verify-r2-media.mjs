#!/usr/bin/env node
/** Verify R2 GetObject for a post id. Usage: node scripts/verify-r2-media.mjs 33 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

const postId = process.argv[2]?.trim() || "33";
const indexPath = resolve(process.cwd(), "data/r2VideoIndex.ts");
const indexSrc = readFileSync(indexPath, "utf8");
const keysMatch = indexSrc.match(/export const R2_VIDEO_KEYS[^=]*=\s*(\{[\s\S]*?\});/);
if (!keysMatch) {
  console.error("Could not parse r2VideoIndex.ts");
  process.exit(1);
}
const keys = JSON.parse(keysMatch[1]);
const objectKey = keys[postId];
if (!objectKey) {
  console.error(`Post ${postId} not in R2 index. Run: npm run sync-r2`);
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const out = await client.send(
  new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
  })
);

console.log(`✅ Post ${postId} -> ${objectKey}`);
console.log(`   Content-Type: ${out.ContentType || "(unknown)"}`);
console.log(`   Size: ${out.ContentLength ?? "?"} bytes`);
