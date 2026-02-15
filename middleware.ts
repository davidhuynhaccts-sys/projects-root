import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const hostname = host.split(":")[0]; // strip port if present

  // ampersand.projectsproject.com -> /ampersand
  if (hostname === "ampersand.projectsproject.com") {
    const url = req.nextUrl.clone();
    url.pathname = "/ampersand";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"]
};
