#!/usr/bin/env node
/**
 * List objects in the configured private R2 bucket (reads .env from project root).
 * Usage: node scripts/list-r2-objects.mjs [prefix]
 */

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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* .env optional if vars already exported */
  }
}

loadEnv();

const accountId = process.env.R2_ACCOUNT_ID?.trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
const bucket = process.env.R2_BUCKET_NAME?.trim();
const prefix = process.argv[2]?.trim() || "";

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_BUCKET_NAME in .env");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

let token;
let total = 0;

console.log(`Bucket: ${bucket}`);
console.log(`Prefix: ${prefix || "(all)"}`);
console.log("---");

do {
  const out = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix || undefined,
      ContinuationToken: token,
      MaxKeys: 1000,
    })
  );
  for (const obj of out.Contents ?? []) {
    total += 1;
    const kb = obj.Size != null ? `${(obj.Size / 1024).toFixed(1)} KB` : "?";
    console.log(`${obj.Key}  (${kb})`);
  }
  token = out.IsTruncated ? out.NextContinuationToken : undefined;
} while (token);

console.log("---");
console.log(`Total objects: ${total}`);
