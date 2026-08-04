import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyFunnelPassCookies,
  IG_PASS_QUERY_PARAM,
  mintIgPassToken,
} from "@/lib/funnelAuth";
import { sendServerEvent } from "@/lib/serverAnalytics";
import { getRequiredEnv } from "@/lib/env";
import { EVENTS } from "@/lib/events";
import { encodeGoListQuery } from "@/lib/funnelRef";

type InvokeConfig = { key: string; width: number; height: number };

function parseInvoke(raw: string | undefined): InvokeConfig | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as {
      key?: string;
      width?: number;
      height?: number;
      w?: number;
      h?: number;
    };
    const key = j.key?.trim();
    const width = typeof j.width === "number" ? j.width : j.w;
    const height = typeof j.height === "number" ? j.height : j.h;
    if (!key || typeof width !== "number" || typeof height !== "number") return null;
    return { key, width, height };
  } catch {
    return null;
  }
}

function invokeBaseUrl(): string {
  const b = process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BASE?.trim();
  return (b || "https://www.highperformanceformat.com").replace(/\/+$/, "");
}

/** Inline Adsterra invoke slot for the static age-gate HTML page. */
function adSlotHtml(id: string, invoke: InvokeConfig | null, className: string): string {
  if (!invoke) {
    return `<div class="ad-slot ${className}" aria-hidden="true"></div>`;
  }
  const base = invokeBaseUrl();
  return `<div class="ad-slot ${className}" id="${id}" data-ad-refresh="1" data-ad-key="${invoke.key}" data-ad-width="${invoke.width}" data-ad-height="${invoke.height}" data-ad-base="${base}" style="min-height:${invoke.height}px;max-width:${invoke.width}px;margin:0 auto;overflow:hidden">
<script>
(function(){
  window.atOptions = {
    key: ${JSON.stringify(invoke.key)},
    format: "iframe",
    height: ${invoke.height},
    width: ${invoke.width},
    params: {}
  };
})();
</script>
<script src="${base}/${invoke.key}/invoke.js"></script>
</div>`;
}

export type AgeGateAdConfig = {
  banner: InvokeConfig | null;
  bannerMobile: InvokeConfig | null;
  inline: InvokeConfig | null;
  box: InvokeConfig | null;
};

export function readAgeGateAdConfig(): AgeGateAdConfig {
  return {
    banner: parseInvoke(process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BANNER),
    bannerMobile: parseInvoke(process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BANNER_MOBILE),
    inline: parseInvoke(process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_INLINE),
    box: parseInvoke(process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BOX),
  };
}

/**
 * Funnel entry age gate: same Swedish copy + Translate + go back / 18+ behavior,
 * styled layout with ad inventory around the confirmation card.
 */
export function funnelEntryLandingHtml(
  nextPath: string,
  ads: AgeGateAdConfig = readAgeGateAdConfig()
) {
  const safeHref = nextPath
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const jsNext = JSON.stringify(nextPath);

  const topBanner = adSlotHtml("ad-top", ads.banner, "ad-banner");
  const mobileBanner = adSlotHtml("ad-mobile", ads.bannerMobile, "ad-mobile");
  const inlineRow = [
    adSlotHtml("ad-inline-1", ads.inline, "ad-inline"),
    adSlotHtml("ad-inline-2", ads.inline, "ad-inline"),
    adSlotHtml("ad-inline-3", ads.inline, "ad-inline"),
    adSlotHtml("ad-inline-4", ads.inline, "ad-inline"),
  ].join("");
  const boxLeft = adSlotHtml("ad-box-l", ads.box, "ad-box");
  const boxRight = adSlotHtml("ad-box-r", ads.box, "ad-box");
  const bottomBanner = adSlotHtml("ad-bottom", ads.banner, "ad-banner");

  const base = invokeBaseUrl();
  const preloadUrls = [ads.banner, ads.bannerMobile, ads.inline, ads.box]
    .filter((x): x is InvokeConfig => !!x)
    .map((x) => `${base}/${x.key}/invoke.js`);
  const jsPreload = JSON.stringify([...new Set(preloadUrls)]);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Age Verification / Åldersverifiering</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(ellipse 80% 50% at 50% -10%, #fb923c 0%, transparent 55%),
        radial-gradient(ellipse 60% 40% at 100% 100%, #38bdf8 0%, transparent 45%),
        linear-gradient(165deg, #0c4a6e 0%, #082f49 42%, #111827 100%);
      color: #0f172a;
      font-family: Georgia, "Times New Roman", Times, serif;
    }
    .page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    @media (min-width: 1100px) {
      .page {
        grid-template-columns: 180px minmax(0, 1fr) 180px;
        align-items: start;
        padding: 24px 16px;
      }
    }
    .rail { display: none; }
    @media (min-width: 1100px) {
      .rail { display: block; position: sticky; top: 16px; }
    }
    .center { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
    .ad-slot {
      width: 100%;
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(255,255,255,0.55);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
    }
    .ad-mobile { display: block; }
    @media (min-width: 768px) {
      .ad-mobile { display: none; }
    }
    .ad-row-4 {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      align-items: start;
      width: 100%;
    }
    .ad-row-4 .ad-slot {
      min-width: 0;
      width: 100%;
      max-width: 100% !important;
      margin: 0 !important;
    }
    .ad-row-4 .ad-slot iframe {
      max-width: 100%;
    }
    .card {
      position: relative;
      overflow: hidden;
      background: linear-gradient(180deg, #fffbeb 0%, #ffffff 55%);
      border: 2px solid #fbbf24;
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      box-shadow:
        0 0 0 4px rgba(251, 191, 36, 0.22),
        0 22px 50px rgb(0 0 0 / 0.35);
    }
    .card::before {
      content: "";
      position: absolute;
      inset: 0 auto auto 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(90deg, #f97316, #eab308, #38bdf8);
    }
    .eyebrow {
      display: inline-block;
      margin-bottom: 16px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid #fdba74;
      background: #fff7ed;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #c2410c;
    }
    #under-18-text {
      margin: 0 auto 26px;
      max-width: 34rem;
      font-size: 1.22rem;
      line-height: 1.55;
      color: #1e293b;
    }
    #under-18-text a,
    #translate-btn {
      color: #0369a1;
      font-weight: 800;
      text-underline-offset: 3px;
    }
    #over-18-wrap { margin: 0 0 20px; }
    #over-18-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 54px;
      max-width: 100%;
      padding: 14px 22px;
      border-radius: 999px;
      background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%);
      color: #fff !important;
      text-decoration: none;
      font-family: Arial, Helvetica, sans-serif;
      font-size: clamp(0.92rem, 2.8vw, 1.08rem);
      font-weight: 800;
      letter-spacing: 0.01em;
      line-height: 1.25;
      text-align: center;
      border: 2px solid #fff7ed;
      box-shadow:
        0 10px 28px rgb(234 88 12 / 0.45),
        0 0 0 4px rgb(251 146 60 / 0.28);
      animation: cta-pulse 1.6s ease-in-out infinite;
    }
    #over-18-link:hover {
      background: linear-gradient(180deg, #fdba74 0%, #f97316 100%);
      transform: translateY(-1px);
    }
    @keyframes cta-pulse {
      0%, 100% { box-shadow: 0 10px 28px rgb(234 88 12 / 0.45), 0 0 0 4px rgb(251 146 60 / 0.25); }
      50% { box-shadow: 0 14px 34px rgb(234 88 12 / 0.55), 0 0 0 8px rgb(251 146 60 / 0.18); }
    }
    @media (prefers-reduced-motion: reduce) {
      #over-18-link { animation: none; }
    }
    #translate-btn {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
    }
    .foot-note {
      margin-top: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #9a3412;
    }
    #loading-panel {
      display: none;
      margin: 0;
      padding: 8px 4px 0;
      text-align: center;
    }
    #loading-panel.is-on { display: block; }
    #gate-actions.is-hidden { display: none !important; }
    .spinner {
      width: 42px;
      height: 42px;
      margin: 8px auto 16px;
      border: 4px solid #fed7aa;
      border-top-color: #ea580c;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .spinner { animation: none; border-top-color: #fed7aa; }
    }
    #loading-title {
      margin: 0 0 8px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
      color: #9a3412;
    }
    #loading-sub {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.92rem;
      color: #57534e;
    }
    #preload-ads {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="page">
    <aside class="rail">${boxLeft}</aside>

    <div class="center">
      ${topBanner}
      ${mobileBanner}

      <main class="card">
        <div class="eyebrow">Åldersverifiering / Age check</div>

        <div id="gate-actions">
          <p id="under-18-text">Om du är under 18 år, <a href="#" id="go-back-link">gå tillbaka</a>... bara vanlig text.</p>

          <p id="over-18-wrap"><a href="${safeHref}" id="over-18-link">Över 18 — Insta-läckorna väntar på dig</a></p>

          <a href="#" id="translate-btn">Translate</a>
          <p class="foot-note" id="foot-note">Bekräfta din ålder för att fortsätta.</p>
        </div>

        <div id="loading-panel" aria-live="polite" aria-busy="false">
          <div class="spinner" aria-hidden="true"></div>
          <p id="loading-title">Your Insta leaks are loading</p>
          <p id="loading-sub">Please wait…</p>
        </div>
      </main>

      <div id="preload-ads" aria-hidden="true"></div>

      <div class="ad-row-4" aria-label="Ads">
        ${inlineRow}
      </div>
      ${bottomBanner}
    </div>

    <aside class="rail">${boxRight}</aside>
  </div>

  <script>
    (function () {
      var next = ${jsNext};
      var preloadUrls = ${jsPreload};
      var over = document.getElementById("over-18-link");
      if (over) over.setAttribute("href", next);

      var back = document.getElementById("go-back-link");
      if (back) {
        back.addEventListener("click", function (event) {
          event.preventDefault();
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "about:blank";
          }
        });
      }

      var translated = false;
      var translateBtn = document.getElementById("translate-btn");
      var under = document.getElementById("under-18-text");
      var foot = document.getElementById("foot-note");
      var gateActions = document.getElementById("gate-actions");
      var loadingPanel = document.getElementById("loading-panel");
      var preloadHost = document.getElementById("preload-ads");
      var navigating = false;

      var sv = {
        underBefore: "Om du är under 18 år, ",
        goBack: "gå tillbaka",
        underAfter: "... bara vanlig text.",
        over: "Över 18 — Insta-läckorna väntar på dig",
        translate: "Translate",
        foot: "Bekräfta din ålder för att fortsätta."
      };
      var en = {
        underBefore: "If you are below 18 ",
        goBack: "go back",
        underAfter: "...",
        over: "Above 18 — Insta leaks are waiting for you",
        translate: "Svenska",
        foot: "Confirm your age to continue."
      };

      function applyLang(lang) {
        under.childNodes[0].textContent = lang.underBefore;
        back.textContent = lang.goBack;
        under.childNodes[2].textContent = lang.underAfter;
        over.textContent = lang.over;
        translateBtn.textContent = lang.translate;
        if (foot) foot.textContent = lang.foot;
      }

      if (translateBtn) {
        translateBtn.addEventListener("click", function (event) {
          event.preventDefault();
          translated = !translated;
          applyLang(translated ? en : sv);
        });
      }

      function preloadAds() {
        if (!preloadHost || !preloadUrls || !preloadUrls.length) {
          return Promise.resolve();
        }
        var jobs = preloadUrls.map(function (url) {
          return new Promise(function (resolve) {
            try {
              var link = document.createElement("link");
              link.rel = "preload";
              link.as = "script";
              link.href = url;
              link.onload = function () { resolve(); };
              link.onerror = function () { resolve(); };
              document.head.appendChild(link);
            } catch (e) { /* ignore */ }

            try {
              var s = document.createElement("script");
              s.async = true;
              s.src = url;
              s.onload = function () { resolve(); };
              s.onerror = function () { resolve(); };
              preloadHost.appendChild(s);
            } catch (e2) {
              resolve();
            }
          });
        });
        // Never block navigation if an ad script hangs.
        return Promise.race([
          Promise.all(jobs),
          new Promise(function (resolve) {
            window.setTimeout(resolve, 2000);
          }),
        ]);
      }

      function warmListPage() {
        try {
          var link = document.createElement("link");
          link.rel = "prefetch";
          link.href = next;
          document.head.appendChild(link);
        } catch (e) { /* ignore */ }
        try {
          fetch(next, { credentials: "same-origin", keepalive: true }).catch(function () {});
        } catch (e2) { /* ignore */ }
      }

      function startLoadingThenGo() {
        if (navigating) return;
        navigating = true;
        if (gateActions) gateActions.classList.add("is-hidden");
        if (loadingPanel) {
          loadingPanel.classList.add("is-on");
          loadingPanel.setAttribute("aria-busy", "true");
        }

        warmListPage();

        var minWait = new Promise(function (resolve) {
          window.setTimeout(resolve, 1800);
        });

        Promise.all([minWait, preloadAds()]).then(function () {
          window.location.assign(next);
        });
      }

      if (over) {
        over.addEventListener("click", function (event) {
          event.preventDefault();
          startLoadingThenGo();
        });
      }

      // Refresh every age-gate ad box on a staggered 15–30s cycle while visible.
      (function startAdBoxRefresh() {
        var slots = document.querySelectorAll("[data-ad-refresh='1'][data-ad-key]");
        if (!slots.length) return;

        var queue = Promise.resolve();

        function loadSlot(el) {
          var key = el.getAttribute("data-ad-key");
          var width = Number(el.getAttribute("data-ad-width"));
          var height = Number(el.getAttribute("data-ad-height"));
          var baseUrl = el.getAttribute("data-ad-base") || "";
          if (!key || !baseUrl || !width || !height) return Promise.resolve();

          return new Promise(function (resolve) {
            try {
              el.innerHTML = "";
              window.atOptions = {
                key: key,
                format: "iframe",
                height: height,
                width: width,
                params: {}
              };
              var s = document.createElement("script");
              var cleanBase = baseUrl;
              while (cleanBase.length > 0 && cleanBase.charAt(cleanBase.length - 1) === "/") {
                cleanBase = cleanBase.slice(0, -1);
              }
              s.src = cleanBase + "/" + key + "/invoke.js";
              s.onload = function () { resolve(); };
              s.onerror = function () { resolve(); };
              el.appendChild(s);
            } catch (e) {
              resolve();
            }
          });
        }

        function scheduleSlot(el) {
          var delay = 15000 + Math.floor(Math.random() * 15001);
          window.setTimeout(function tick() {
            if (navigating) return;
            if (document.visibilityState === "visible") {
              queue = queue.then(function () {
                return loadSlot(el);
              });
            }
            var nextDelay = 15000 + Math.floor(Math.random() * 15001);
            window.setTimeout(tick, nextDelay);
          }, delay);
        }

        for (var i = 0; i < slots.length; i++) {
          scheduleSlot(slots[i]);
        }
      })();
    })();
  </script>
</body>
</html>`;
}

export async function issueFunnelAccess(
  req: NextRequest,
  src: "a" | "b",
  analyticsPath: string
) {
  const secret =
    process.env.NODE_ENV === "production"
      ? getRequiredEnv("IG_FUNNEL_SECRET")
      : process.env.IG_FUNNEL_SECRET;
  if (!secret) return NextResponse.redirect(new URL("/", req.url));

  const token = await mintIgPassToken(secret, src);

  const goQ = encodeGoListQuery({ entry: true });
  const goUrl = new URL(goQ ? `/go?q=${encodeURIComponent(goQ)}` : "/go", req.url);
  goUrl.searchParams.set(IG_PASS_QUERY_PARAM, token);
  const nextPath = `${goUrl.pathname}${goUrl.search}`;

  const res = new NextResponse(funnelEntryLandingHtml(nextPath), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
  applyFunnelPassCookies(res, token, src);

  const analyticsResult = await sendServerEvent({
    event: EVENTS.igEntry,
    source: src,
    path: analyticsPath,
  });
  if (!analyticsResult.ok) {
    console.error("[ig] analytics event failed:", analyticsResult.error);
  }
  return res;
}
