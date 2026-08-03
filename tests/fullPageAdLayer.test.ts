import test from "node:test";
import assert from "node:assert/strict";
import { resolveFullPageAdHref } from "../components/FullPageAdLayer";

test("resolveFullPageAdHref falls back to smartlink when no DOM ads", () => {
  const href = resolveFullPageAdHref("#missing", "https://ads.example/smart");
  assert.equal(href, "https://ads.example/smart");
});

test("resolveFullPageAdHref returns empty when no ads and no smartlink", () => {
  assert.equal(resolveFullPageAdHref("#missing", ""), "");
});
