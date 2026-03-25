import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { issueFunnelAccess } from "@/lib/funnelEntry";

export async function GET(
  req: NextRequest,
  { params }: { params: { entry: string } }
) {
  const token = process.env.IG_ENTRY_PATH_TOKEN;
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  if (params.entry !== token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return issueFunnelAccess(req, "a", `/${params.entry}`);
}
