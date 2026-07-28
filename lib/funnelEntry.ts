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

function funnelEntryLandingHtml(nextPath: string) {
  const safeAttr = nextPath.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${safeAttr}" />
  <title>Loading…</title>
  <style>body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#fafafa;color:#333}</style>
</head>
<body>
  <p>Loading your posts…</p>
  <script>location.replace(${JSON.stringify(nextPath)})</script>
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

  // HTML landing (not 302): in-app browsers (Meta/Facebook) often drop Set-Cookie on redirect chains.
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
