import { NextRequest } from "next/server";
import {
  deletePushSubscription,
  getPushSubscription,
  savePushSubscription,
  type DingPushSubscription,
} from "../../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const subscription = await getPushSubscription();
  return Response.json({ enabled: Boolean(subscription) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const subscription = (await request.json()) as DingPushSubscription;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return Response.json({ error: "Invalid push subscription." }, { status: 400 });
  }
  await savePushSubscription(subscription);
  return Response.json({ ok: true });
}

export async function DELETE() {
  await deletePushSubscription();
  return Response.json({ ok: true });
}
