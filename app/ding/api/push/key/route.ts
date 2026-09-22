import { getVapidPublicKey } from "../../../lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ publicKey: getVapidPublicKey() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Ding VAPID key error", error);
    return Response.json({ error: "Push is not configured." }, { status: 503 });
  }
}
