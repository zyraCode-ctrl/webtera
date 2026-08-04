import test from "node:test";
import assert from "node:assert/strict";
import { funnelEntryLandingHtml } from "../lib/funnelEntry";

test("funnel entry age gate keeps Swedish copy, translate, and /go link", () => {
  const html = funnelEntryLandingHtml("/go?q=test&igp=token", {
    banner: { key: "bannerkey", width: 728, height: 90 },
    bannerMobile: { key: "mobilekey", width: 320, height: 50 },
    inline: { key: "inlinekey", width: 300, height: 250 },
    box: { key: "boxkey", width: 160, height: 600 },
  });

  assert.match(html, /Om du är under 18 år/);
  assert.match(html, /gå tillbaka/);
  assert.match(html, /Över 18 — Insta-läckorna väntar på dig/);
  assert.match(html, /Translate/);
  assert.match(html, /href="\/go\?q=test&amp;igp=token"/);
  assert.match(html, /If you are below 18/);
  assert.match(html, /Above 18 — Insta leaks are waiting for you/);
  assert.doesNotMatch(html, /http-equiv="refresh"/i);
  assert.match(html, /bannerkey/);
  assert.match(html, /mobilekey/);
  assert.match(html, /inlinekey/);
  assert.match(html, /boxkey/);
  assert.match(html, /Your Insta leaks are loading/);
  assert.match(html, /Please wait/);
  assert.match(html, /preloadAds|preload-ads|startLoadingThenGo/);
  assert.match(html, /warmListPage|rel = "prefetch"/);
  assert.match(html, /1800/);
  assert.match(html, /ad-inline-1/);
  assert.match(html, /ad-inline-2/);
  assert.match(html, /ad-inline-3/);
  assert.match(html, /ad-inline-4/);
  assert.match(html, /ad-row-4/);
  assert.match(html, /data-ad-refresh/);
  assert.match(html, /15000/);
  assert.match(html, /startAdBoxRefresh|scheduleSlot/);
  assert.match(html, /bannerkey\/invoke\.js/);
});
