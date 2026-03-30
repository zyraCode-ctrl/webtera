import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { entry: string } }
) {
  // Funnel entry is now only supported via the 2-part links:
  // `/[entry]/[sub]` (see `app/[entry]/[sub]/route.ts`)
  return NextResponse.redirect(new URL("/", req.url));
}
