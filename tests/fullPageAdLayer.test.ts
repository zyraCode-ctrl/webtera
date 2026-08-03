import test from "node:test";
import assert from "node:assert/strict";
import { resolveFullPageAdHref } from "../components/FullPageAdLayer";

test("resolveFullPageAdHref prefers empty over smartlink by default (ad-first)", () => {
  // No DOM ads in Node → do not bake smartlink into the layer href.
  const href = resolveFullPageAdHref("#missing", "https://ads.example/smart");
  assert.equal(href, "");
});

test("resolveFullPageAdHref can opt into smartlink fallback for helpers", () => {
  const href = resolveFullPageAdHref("#missing", "https://ads.example/smart", {
    allowSmartlinkFallback: true,
  });
  assert.equal(href, "https://ads.example/smart");
});

test("resolveFullPageAdHref returns empty when no ads and no smartlink", () => {
  assert.equal(resolveFullPageAdHref("#missing", ""), "");
  assert.equal(
    resolveFullPageAdHref("#missing", "", { allowSmartlinkFallback: true }),
    ""
  );
});
