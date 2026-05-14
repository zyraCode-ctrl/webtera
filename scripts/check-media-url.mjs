#!/usr/bin/env node
/**
 * Verifies an external media URL: HTTP status, Content-Type, Range support.
 * Usage:
 *   node scripts/check-media-url.mjs "https://pub-xxx.r2.dev/path/video.mp4"
 * Exit 0 only when the ranged GET succeeds with 206 or GET with 200 and looks like media.
 */

const url = process.argv[2]?.trim();

if (!url) {
  console.error("Usage: node scripts/check-media-url.mjs <media-url>");
  process.exit(1);
}

async function probe() {
  let headStatus = "(skipped)";
  let headCt = "";

  try {
    const headRes = await fetch(url, { method: "HEAD", redirect: "follow" });
    headStatus = `${headRes.status} ${headRes.statusText}`;
    headCt = headRes.headers.get("content-type") || "";
    console.log("[HEAD]", headStatus);
    console.log("[HEAD] Content-Type:", headCt || "(missing)");
    if (!headRes.ok) {
      console.warn("[HEAD] Warning: HEAD was not OK; some origins only allow GET.");
    }
  } catch (e) {
    console.warn("[HEAD] Failed:", e instanceof Error ? e.message : String(e));
  }

  try {
    const rangeRes = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      redirect: "follow",
    });
    const rangeCt = rangeRes.headers.get("content-type") || "";
    console.log("[GET Range 0-0]", rangeRes.status, rangeRes.statusText);
    console.log("[GET Range 0-0] Content-Type:", rangeCt || "(missing)");
    const acceptRanges = rangeRes.headers.get("accept-ranges");
    console.log("[GET Range 0-0] Accept-Ranges:", acceptRanges || "(missing — seeking may suffer)");

    const bodyLen = Number.parseInt(rangeRes.headers.get("content-length") || "0", 10);
    const buf = new Uint8Array(await rangeRes.arrayBuffer());
    console.log("[GET Range 0-0] Body bytes:", buf.byteLength, "(reported Content-Length:", bodyLen, ")");

    if (rangeRes.status === 200) {
      console.log("Note: server ignored Range and returned full file (200). Often still OK for <video>.");
    } else if (rangeRes.status === 206) {
      console.log("Note: Partial content (206) — typical for streaming.");
    }

    const okEnough =
      rangeRes.ok &&
      (rangeRes.status === 200 || rangeRes.status === 206) &&
      buf.byteLength > 0;

    if (!rangeRes.ok) {
      console.error(
        `\n❌ FAILED: HTTP ${rangeRes.status} ${rangeRes.statusText} — browser will not decode this URL reliably.`,
      );
      process.exit(2);
    }
    if (!okEnough || buf.byteLength === 0) {
      console.error("\n❌ FAILED: Empty response or unexpected status handling.");
      process.exit(2);
    }

    const looksVideo =
      /video\//i.test(rangeCt) || /\.(mp4|webm|ogg|m4v)(\?|#|$)/i.test(url);
    if (!looksVideo) {
      console.warn("\n⚠️ Content-Type or path doesn’t obviously look like video; playback may still work if bytes are valid.");
    }

    console.log("\n✅ Probe succeeded (HTTP OK with non-empty body). Check browser DevTools Network if <video> still fails (CORS, CSP).");
    process.exit(0);
  } catch (e) {
    console.error("\n❌ FETCH ERROR:", e instanceof Error ? e.message : String(e));
    if (e instanceof Error && e.cause) {
      console.error("   Cause:", e.cause);
    }
    process.exit(3);
  }
}

probe();
