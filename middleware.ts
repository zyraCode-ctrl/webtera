import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIgFunnelSecret, hasValidIgPass, IG_PASS_COOKIE } from "@/lib/funnelAuth";

export async function middleware(req: NextRequest) {
  const secret = getIgFunnelSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const token = req.cookies.get(IG_PASS_COOKIE)?.value;
  const ok = token ? await hasValidIgPass(req) : false;
  if (ok) return NextResponse.next();

  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/go", "/post/:path*", "/out/:path*", "/help/:path*"],
};
