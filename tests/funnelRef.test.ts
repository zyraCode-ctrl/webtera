import test from "node:test";
import assert from "node:assert/strict";
import {
  applyGoListState,
  decodeGoListQuery,
  decodeFunnelFrom,
  decodePostRef,
  encodeFunnelFrom,
  encodeGoListQuery,
  encodePostRef,
  funnelHelpPath,
  readGoListState,
} from "../lib/funnelRef";

test("encodePostRef / decodePostRef round-trip", () => {
  const ref = encodePostRef("33");
  assert.match(ref, /^wt1\./);
  assert.notEqual(ref, "33");
  assert.equal(decodePostRef(ref), "33");
});

test("decodePostRef accepts legacy numeric ids", () => {
  assert.equal(decodePostRef("33"), "33");
});

test("funnelHelpPath uses encoded ref and f token", () => {
  const href = funnelHelpPath("32", "video");
  assert.match(href, /^\/help\/wt1\./);
  assert.match(href, /\?f=dmVv$/);
  assert.doesNotThrow(() => new URL(`http://localhost${href}`));
});

test("encodeGoListQuery packs search and page", () => {
  const q = encodeGoListQuery({ search: "33", page: 28 });
  assert.ok(q?.startsWith("q1."));
  const decoded = decodeGoListQuery(q);
  assert.equal(decoded.search, "33");
  assert.equal(decoded.page, 28);
});

test("readGoListState prefers encoded q over legacy params", () => {
  const q = encodeGoListQuery({ search: "99", page: 2 });
  const params = new URLSearchParams(`q=${q}&search=1&page=2`);
  const state = readGoListState(params);
  assert.equal(state.search, "99");
  assert.equal(state.page, 2);
});

test("applyGoListState strips legacy query keys", () => {
  const base = new URLSearchParams("search=33&page=28&from_entry=1");
  const next = applyGoListState(base, { search: "33", page: 28 });
  assert.equal(next.get("search"), null);
  assert.equal(next.get("page"), null);
  assert.equal(next.get("from_entry"), null);
  assert.ok(next.get("q")?.startsWith("q1."));
});

test("decodeFunnelFrom maps tokens and legacy values", () => {
  assert.equal(decodeFunnelFrom(encodeFunnelFrom("video")), "video");
  assert.equal(decodeFunnelFrom("video"), "video");
});
