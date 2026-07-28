import test from "node:test";
import assert from "node:assert/strict";
import {
  applyPopunderHandoff,
  consumeCardPopunder,
  consumeSearchPopunder,
  consumeVideoPlayPopunder,
  withPopunderHandoff,
} from "../lib/funnelPopunderSession";

/** Minimal sessionStorage for Node tests. */
function installMemorySessionStorage() {
  const map = new Map<string, string>();
  const store = {
    getItem(k: string) {
      return map.has(k) ? map.get(k)! : null;
    },
    setItem(k: string, v: string) {
      map.set(k, String(v));
    },
    removeItem(k: string) {
      map.delete(k);
    },
    clear() {
      map.clear();
    },
    get length() {
      return map.size;
    },
    key() {
      return null;
    },
  };
  Object.defineProperty(globalThis, "sessionStorage", {
    value: store,
    configurable: true,
  });
  return map;
}

test("search popunder fires once until reset", () => {
  installMemorySessionStorage();
  assert.equal(consumeSearchPopunder(), true);
  assert.equal(consumeSearchPopunder(), false);
  applyPopunderHandoff("reset");
  assert.equal(consumeSearchPopunder(), true);
});

test("card popunder fires once until reset", () => {
  installMemorySessionStorage();
  assert.equal(consumeCardPopunder(), true);
  assert.equal(consumeCardPopunder(), false);
  applyPopunderHandoff("reset");
  assert.equal(consumeCardPopunder(), true);
});

test("video play popunder fires once until reset", () => {
  installMemorySessionStorage();
  assert.equal(consumeVideoPlayPopunder(), true);
  assert.equal(consumeVideoPlayPopunder(), false);
  applyPopunderHandoff("reset");
  assert.equal(consumeVideoPlayPopunder(), true);
});

test("search handoff: typing allowed, card+video still available", () => {
  installMemorySessionStorage();
  applyPopunderHandoff("search");
  assert.equal(consumeSearchPopunder(), false);
  assert.equal(consumeCardPopunder(), true);
  assert.equal(consumeVideoPlayPopunder(), true);
});

test("card handoff: search+card done, video still available", () => {
  installMemorySessionStorage();
  applyPopunderHandoff("card");
  assert.equal(consumeSearchPopunder(), false);
  assert.equal(consumeCardPopunder(), false);
  assert.equal(consumeVideoPlayPopunder(), true);
});

test("video handoff: play gate path (no second popunder)", () => {
  installMemorySessionStorage();
  applyPopunderHandoff("video");
  assert.equal(consumeSearchPopunder(), false);
  assert.equal(consumeCardPopunder(), false);
  assert.equal(consumeVideoPlayPopunder(), false);
});

test("withPopunderHandoff appends wt_pu for relative and absolute urls", () => {
  assert.match(withPopunderHandoff("/go", "reset"), /[?&]wt_pu=reset/);
  assert.match(
    withPopunderHandoff("https://example.com/help/x?f=1", "video"),
    /[?&]wt_pu=video/
  );
  assert.match(withPopunderHandoff("/go?q=q1.abc", "search"), /wt_pu=search/);
});
