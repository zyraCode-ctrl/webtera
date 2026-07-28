import test from "node:test";
import assert from "node:assert/strict";
import {
  consumeCardPopunder,
  consumeSearchPopunder,
  consumeVideoPlayPopunder,
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

test("search popunder fires once per session", () => {
  installMemorySessionStorage();
  assert.equal(consumeSearchPopunder(), true);
  assert.equal(consumeSearchPopunder(), false);
});

test("card popunder quota is 1 or 2 then exhausted", () => {
  installMemorySessionStorage();
  const first = consumeCardPopunder();
  assert.equal(first, true);
  const second = consumeCardPopunder();
  // Second may be true (quota 2) or false (quota 1)
  if (second) {
    assert.equal(consumeCardPopunder(), false);
  } else {
    assert.equal(consumeCardPopunder(), false);
  }
});

test("video play popunder fires once per session", () => {
  installMemorySessionStorage();
  assert.equal(consumeVideoPlayPopunder(), true);
  assert.equal(consumeVideoPlayPopunder(), false);
});
