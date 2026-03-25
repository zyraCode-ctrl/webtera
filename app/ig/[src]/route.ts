import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { issueFunnelAccess } from "@/lib/funnelEntry";

export async function GET(
  req: NextRequest,
  { params }: { params: { src: string } }
) {
  // Only two allowed Instagram entry links.
  const src = params.src === "a" || params.src === "b" ? params.src : null;
  if (!src) return NextResponse.redirect(new URL("/", req.url));
  return issueFunnelAccess(req, src, `/ig/${src}`);
}

