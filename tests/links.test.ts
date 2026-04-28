import test from "node:test";
import assert from "node:assert/strict";

async function loadLinksModule(allowHosts?: string) {
  if (allowHosts === undefined) delete process.env.NEXT_PUBLIC_ALLOWED_OUTBOUND_HOSTS;
  else process.env.NEXT_PUBLIC_ALLOWED_OUTBOUND_HOSTS = allowHosts;
  return import(`../data/links.ts?ts=${Date.now()}_${Math.random()}`);
}

test("sanitizeOutboundUrl allows http/https URLs", async () => {
  const mod = await loadLinksModule();
  const { sanitizeOutboundUrl } = mod.__testables;
  assert.equal(sanitizeOutboundUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(sanitizeOutboundUrl("http://example.com/ok"), "http://example.com/ok");
});

test("sanitizeOutboundUrl blocks non-http protocols", async () => {
  const mod = await loadLinksModule();
  const { sanitizeOutboundUrl } = mod.__testables;
  assert.equal(sanitizeOutboundUrl("javascript:alert(1)"), undefined);
  assert.equal(sanitizeOutboundUrl("data:text/plain,hello"), undefined);
});

test("sanitizeOutboundUrl enforces host allowlist when configured", async () => {
  const mod = await loadLinksModule("mega.nz,example.com");
  const { sanitizeOutboundUrl } = mod.__testables;
  assert.equal(
    sanitizeOutboundUrl("https://mega.nz/file/test"),
    "https://mega.nz/file/test"
  );
  assert.equal(
    sanitizeOutboundUrl("https://cdn.example.com/file"),
    "https://cdn.example.com/file"
  );
  assert.equal(sanitizeOutboundUrl("https://not-allowed.com/file"), undefined);
});
