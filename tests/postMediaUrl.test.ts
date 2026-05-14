import test from "node:test";
import assert from "node:assert/strict";
import { getPostMediaPresentation } from "../lib/postMediaUrl";

test("postMediaUrl: R2 mp4 is direct-video", () => {
  const u =
    "https://pub-example.r2.dev/video/Untitled%20design.mp4?v=1";
  const p = getPostMediaPresentation(u);
  assert.ok(p);
  assert.equal(p!.kind, "direct-video");
  assert.equal(p!.url, u);
});

test("postMediaUrl: xvideos embedframe is iframe-embed", () => {
  const p = getPostMediaPresentation(
    "https://www.example.com/embedframe/abc123",
  );
  assert.ok(p);
  assert.equal(p!.kind, "iframe-embed");
});

test("postMediaUrl: mega link is external", () => {
  const p = getPostMediaPresentation("https://mega.nz/file/foo#bar");
  assert.ok(p);
  assert.equal(p!.kind, "external");
});

test("postMediaUrl: rejects non-http(S)", () => {
  assert.equal(getPostMediaPresentation("javascript:alert(1)"), null);
});
