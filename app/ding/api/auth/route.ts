import { NextRequest, NextResponse } from "next/server";
import { authCookieValue, checkPasscode, isAuthorized } from "../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";
  if (!checkPasscode(passcode)) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set("ding_auth", authCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/ding",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set("ding_auth", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/ding",
    maxAge: 0,
  });
  return response;
}
