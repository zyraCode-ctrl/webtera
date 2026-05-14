import test from "node:test";
import assert from "node:assert/strict";
import { bumpPreviewPlayCount, getPreviewPlayCount } from "../lib/postPreviewPlay";

function withSessionStorage(run: () => void) {
  const store = new Map<string, string>();
  globalThis.sessionStorage = {
    getItem(k: string) {
      return store.has(k) ? store.get(k)! : null;
    },
    setItem(k: string, v: string) {
      store.set(k, String(v));
    },
    removeItem(k: string) {
      store.delete(k);
    },
    clear() {
      store.clear();
    },
    key(): string | null {
      return null;
    },
    get length(): number {
      return store.size;
    },
  } as Storage;

  try {
    run();
  } finally {
    Reflect.deleteProperty(globalThis, "sessionStorage");
  }
}

test("postPreviewPlay: counts per post independently", () => {
  withSessionStorage(() => {
    assert.equal(getPreviewPlayCount("99"), 0);
    assert.equal(bumpPreviewPlayCount("99"), 1);
    assert.equal(bumpPreviewPlayCount("99"), 2);
    assert.equal(getPreviewPlayCount("99"), 2);
    assert.equal(bumpPreviewPlayCount("7"), 1);
    assert.equal(getPreviewPlayCount("99"), 2);
    assert.equal(bumpPreviewPlayCount("99"), 3);
    assert.equal(getPreviewPlayCount("99"), 3);
  });
});
