import { NextRequest } from "next/server";
import { isAuthorized } from "../../../lib/auth";
import { getPushSubscription } from "../../../lib/store";
import { sendPush } from "../../../lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const subscription = await getPushSubscription();
  if (!subscription) return Response.json({ error: "Notifications are not enabled." }, { status: 409 });
  try {
    await sendPush(subscription, { title: "Ding", body: "Notifications are working.", url: "/ding" });
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error("Ding test push failed", error);
    return Response.json({ error: "Test notification failed." }, { status: 500 });
  }
}
