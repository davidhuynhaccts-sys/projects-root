import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const hostname = host.split(":")[0];
  const url = req.nextUrl.clone();

  if (hostname === "ampersand.projectsproject.com") {
    url.pathname = "/ampersand";
    return NextResponse.rewrite(url);
  }

  if (hostname === "mpls.projectsproject.com") {
    url.pathname = `/mpls${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
