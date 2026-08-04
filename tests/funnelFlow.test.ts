import test from "node:test";
import assert from "node:assert/strict";
import { getPostById, posts } from "../data/posts";
import { hasMediaKind } from "../data/mediaRegistry";
import { funnelHelpPath } from "../lib/funnelRef";
import { FUNNEL_GATE_TO_NEXT_MS } from "../lib/funnelNavigate";
import { LINK_LOADER_SECONDS } from "../lib/funnelTiming";

test("posts registry: expected length and getPostById", () => {
  assert.equal(posts.length, 2000);
  assert.ok(getPostById("1"));
  assert.equal(getPostById("1")!.id, "1");
  assert.equal(getPostById("bogus"), undefined);
});

test("funnel flow: post media flags match registry and stay private", () => {
  const p32 = getPostById("32");
  assert.ok(p32);
  assert.equal(p32!.hasPreviewVideo, hasMediaKind("32", "preview"));
  assert.equal(p32!.hasThumb, hasMediaKind("32", "thumb"));
  assert.equal("imageUrl" in (p32 as object), false);

  const p33 = getPostById("33");
  assert.ok(p33);
  assert.equal(p33!.hasThumb, true);
  assert.equal(p33!.hasPreviewVideo, hasMediaKind("33", "preview"));
});

test("funnel flow: Link button targets resolve for exemplar posts (no outbound allowlist)", async () => {
  delete process.env.NEXT_PUBLIC_ALLOWED_OUTBOUND_HOSTS;
  const fresh = await import(`../data/links.ts?ts=${Date.now()}_2`);
  const s32 = fresh.getPostLinkStatus("32");
  assert.ok(s32.url, "post 32 should have link URL");
  assert.equal(s32.blocked, false);
  assert.ok(String(s32.url).startsWith("https://"));

  // Explicit empty overrides must stay empty (not fall back to default).
  const s28 = fresh.getPostLinkStatus("28");
  assert.equal(s28.url, undefined);
  assert.equal(s28.blocked, false);
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

test("funnel constants: tab-shift is synchronous (no popunder delay)", () => {
  assert.equal(FUNNEL_GATE_TO_NEXT_MS, 0);
  assert.ok(LINK_LOADER_SECONDS >= 1 && LINK_LOADER_SECONDS <= 30);
});

test("funnel flow: funnelAdUrl has no hardcoded smartlink fallback", async () => {
  const prevGate = process.env.NEXT_PUBLIC_FUNNEL_GATE_URL;
  const prevAd = process.env.NEXT_PUBLIC_FUNNEL_AD_URL;
  try {
    delete process.env.NEXT_PUBLIC_FUNNEL_GATE_URL;
    delete process.env.NEXT_PUBLIC_FUNNEL_AD_URL;
    const mod = await import(`../lib/funnelConfig.ts?ad=${Date.now()}`);
    assert.equal(mod.funnelAdUrl, "");
    assert.equal(mod.popunderScriptSrc, "");
  } finally {
    if (prevGate === undefined) delete process.env.NEXT_PUBLIC_FUNNEL_GATE_URL;
    else process.env.NEXT_PUBLIC_FUNNEL_GATE_URL = prevGate;
    if (prevAd === undefined) delete process.env.NEXT_PUBLIC_FUNNEL_AD_URL;
    else process.env.NEXT_PUBLIC_FUNNEL_AD_URL = prevAd;
  }
});
