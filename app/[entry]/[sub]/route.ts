import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { issueFunnelAccess } from "@/lib/funnelEntry";

type Entry = {
  entry: string;
  sub: string;
  src: "a" | "b";
};

// 2-part funnel entry links. Visiting any of these sets a short-lived cookie
// and redirects the user to `/go`.
const FUNNEL_ENTRIES: Entry[] = [
  { entry: "VKDU7gv2CPJ", sub: "FuadqNngBkNmWt12K3k", src: "a" },
  { entry: "HXz4R4jTGqhx", sub: "ZZywMTrDZt7JC1mY9q", src: "b" },
  { entry: "pA38MGTQtyQ", sub: "FSkMxJ57ZpXAHZnB4CZ", src: "a" },
  { entry: "K6BV274RH0Zq", sub: "c3TUxTxfRnZbEzmtZR", src: "b" },
  { entry: "i7gF6MmiTk2Dtk", sub: "Y24m6gHSUvKBU07w", src: "a" },
  { entry: "rvFjE7nKbXBUBjc", sub: "M65LAuNbubrjS9v", src: "b" },
];

export async function GET(
  req: NextRequest,
  { params }: { params: { entry: string; sub: string } }
) {
  const match = FUNNEL_ENTRIES.find(
    (x) => x.entry === params.entry && x.sub === params.sub
  );

  if (!match) return NextResponse.redirect(new URL("/", req.url));
  return issueFunnelAccess(req, match.src, `/funnel_entry/${params.entry}/${params.sub}`);
}

