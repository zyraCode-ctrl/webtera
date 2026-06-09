#!/usr/bin/env node
/** Compare bucket contents vs synced index. Usage: node scripts/r2-sync-report.mjs */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  try {
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
  } catch {
    /* optional */
  }
}

loadEnv();

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const keys = [];
let token;
do {
  const out = await client.send(
    new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      ContinuationToken: token,
      MaxKeys: 1000,
    })
  );
  for (const obj of out.Contents ?? []) {
    if (obj.Key) keys.push(obj.Key);
  }
  token = out.IsTruncated ? out.NextContinuationToken : undefined;
} while (token);

const synced = {};
const skipped = [];

for (const key of keys) {
  const m = key.match(/^(\d+)\.(mp4|MP4|mov|MOV|webm|WEBM|m4v|M4V)$/);
  if (m) {
    synced[m[1]] = key;
  } else {
    skipped.push(key);
  }
}

const postIds = Object.keys(synced).map(Number).sort((a, b) => a - b);
const maxId = postIds.at(-1) ?? 0;
const missing = [];
for (let n = 1; n <= maxId; n++) {
  if (!synced[String(n)]) missing.push(n);
}

console.log(`Bucket: ${process.env.R2_BUCKET_NAME}`);
console.log(`Total objects in bucket: ${keys.length}`);
console.log(`Synced (numeric {id}.mp4 etc.): ${postIds.length}`);
console.log(`Skipped (wrong name/format): ${skipped.length}`);
if (skipped.length) {
  console.log("\nSkipped keys:");
  for (const k of skipped) console.log(`  - ${k}`);
}
console.log(`\nHighest post id with a file: ${maxId}`);
console.log(`Missing post ids (1–${maxId} with no file): ${missing.length}`);
if (missing.length) {
  const preview = missing.slice(0, 30).join(", ");
  console.log(`  ${preview}${missing.length > 30 ? `, … (+${missing.length - 30} more)` : ""}`);
}
console.log(
  `\nNote: Having files up to ${maxId}.mp4 is NOT the same as ${maxId} videos — gaps (${missing.length}) mean fewer synced files.`
);
