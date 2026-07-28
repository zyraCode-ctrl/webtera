import test from "node:test";
import assert from "node:assert/strict";
import {
  consumeCardPopunder,
  consumeSearchPopunder,
  consumeVideoPlayPopunder,
} from "../lib/funnelPopunderSession";

test("search popunder fires on every call", () => {
  assert.equal(consumeSearchPopunder(), true);
  assert.equal(consumeSearchPopunder(), true);
  assert.equal(consumeSearchPopunder(), true);
});

test("card popunder fires on every call", () => {
  assert.equal(consumeCardPopunder(), true);
  assert.equal(consumeCardPopunder(), true);
  assert.equal(consumeCardPopunder(), true);
});

test("video play popunder fires on every call", () => {
  assert.equal(consumeVideoPlayPopunder(), true);
  assert.equal(consumeVideoPlayPopunder(), true);
  assert.equal(consumeVideoPlayPopunder(), true);
});
