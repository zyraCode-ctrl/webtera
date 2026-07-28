import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyFunnelPassCookies,
  decodeIgPassPayload,
  getIgFunnelSecret,
  hasValidIgPass,
  IG_PASS_QUERY_PARAM,
  mintIgPassToken,
  refreshFunnelPassCookies,
  verifyIgPassToken,
} from "@/lib/funnelAuth";

export async function middleware(req: NextRequest) {
  const secret = getIgFunnelSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (await hasValidIgPass(req)) {
    // Sliding 6-minute window on every funnel page hit (/go, /post, /help, /out).
    const res = NextResponse.next();
    await refreshFunnelPassCookies(req, res);
    return res;
  }

  // Meta / Facebook in-app browser: cookie from entry is often missing — bootstrap from URL token.
  const urlToken = req.nextUrl.searchParams.get(IG_PASS_QUERY_PARAM);
  if (urlToken) {
    const payload = decodeIgPassPayload(urlToken);
    if (payload && Date.now() <= payload.exp && (await verifyIgPassToken(urlToken, secret))) {
      const clean = req.nextUrl.clone();
      clean.searchParams.delete(IG_PASS_QUERY_PARAM);
      const res = NextResponse.redirect(clean);
      const fresh = await mintIgPassToken(secret, payload.src);
      applyFunnelPassCookies(res, fresh, payload.src);
      return res;
    }
  }

  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/go", "/post/:path*", "/out/:path*", "/help/:path*"],
};
