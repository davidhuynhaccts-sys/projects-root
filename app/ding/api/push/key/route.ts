import { NextRequest } from "next/server";
import { isAuthorized } from "../../../lib/auth";
import { getVapidPublicKey } from "../../../lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json({ publicKey: getVapidPublicKey() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Ding VAPID key error", error);
    return Response.json({ error: "Push is not configured." }, { status: 503 });
  }
}
