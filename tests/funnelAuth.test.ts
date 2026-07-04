import test from "node:test";
import assert from "node:assert/strict";
import { decodeIgPassPayload, IG_PASS_QUERY_PARAM } from "../lib/funnelAuth";

test("funnel auth: IG_PASS_QUERY_PARAM is igp", () => {
  assert.equal(IG_PASS_QUERY_PARAM, "igp");
});

test("funnel auth: decodeIgPassPayload rejects malformed token", () => {
  assert.equal(decodeIgPassPayload(""), null);
  assert.equal(decodeIgPassPayload("not-a-token"), null);
});
