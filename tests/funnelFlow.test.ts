import test from "node:test";
import assert from "node:assert/strict";
import { getPostById, posts } from "../data/posts";
import { funnelHelpPath } from "../lib/funnelRef";
import { FUNNEL_GATE_TO_NEXT_MS } from "../lib/funnelNavigate";
import { LINK_LOADER_SECONDS } from "../lib/funnelTiming";

test("posts registry: expected length and getPostById", () => {
  assert.equal(posts.length, 2000);
  assert.ok(getPostById("1"));
  assert.equal(getPostById("1")!.id, "1");
  assert.equal(getPostById("bogus"), undefined);
});

test("funnel flow: post 32 optional previewVideoUrl exists in post data (list uses thumbnail only)", () => {
  const p = getPostById("32");
  assert.ok(p);
  assert.ok(p!.previewVideoUrl?.includes(".mp4"));
  assert.ok(p!.previewVideoUrl!.includes("pub-ff1f131c0a954a2ca3d1dfea676addb8.r2.dev"));
});

test("funnel flow: post 33 uses PNG thumbnail on list; full video only on help page", () => {
  const p = getPostById("33");
  assert.ok(p);
  assert.ok(p!.imageUrl.endsWith(".png"));
  assert.equal(p!.previewVideoUrl, undefined);
});

test("funnel flow: Link button targets resolve for exemplar posts (no outbound allowlist)", async () => {
  const mod = await import(`../data/links.ts?ts=${Date.now()}`);
  delete process.env.NEXT_PUBLIC_ALLOWED_OUTBOUND_HOSTS;
  const fresh = await import(`../data/links.ts?ts=${Date.now()}_2`);
  const s32 = fresh.getPostLinkStatus("32");
  assert.ok(s32.url, "post 32 should have link URL");
  assert.equal(s32.blocked, false);
  assert.ok(String(s32.url).startsWith("https://"));

  const s28 = fresh.getPostLinkStatus("28");
  assert.ok(s28.url?.includes("xvideos"), "explicit override preserved");
});

test("funnel flow: LinkLoader help path uses encoded funnel href", () => {
  const href = funnelHelpPath("32", "video");
  assert.match(href, /^\/help\/wt1\./);
  assert.match(href, /\?f=/);
});

test("funnel flow: Full Video links directly to help (no /out loader)", () => {
  const href = funnelHelpPath("32", "video");
  assert.match(href, /^\/help\/wt1\./);
});

test("funnel constants: timing is coherent", () => {
  assert.ok(FUNNEL_GATE_TO_NEXT_MS >= 400 && FUNNEL_GATE_TO_NEXT_MS <= 3000);
  assert.ok(LINK_LOADER_SECONDS >= 1 && LINK_LOADER_SECONDS <= 30);
});

test("funnel flow: popunderScriptSrc parses as https URL", async () => {
  const mod = await import(`../lib/funnelConfig.ts?pop=${Date.now()}`);
  assert.match(mod.popunderScriptSrc, /^https:\/\//);
  assert.ok(mod.popunderScriptSrc.endsWith(".js"));
  assert.doesNotThrow(() => {
    void new URL(mod.popunderScriptSrc);
  });
});
