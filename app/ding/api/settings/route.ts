import { NextRequest } from "next/server";
import { isAuthorized } from "../../lib/auth";
import { getSettings, saveSettings } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validTime(value: unknown) {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await getSettings(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const times = body?.notificationTimes;
  if (!Array.isArray(times) || times.length !== 2 || !times.every(validTime)) {
    return Response.json({ error: "Invalid notification times." }, { status: 400 });
  }
  if (times[0] === times[1]) {
    return Response.json({ error: "Choose two different times." }, { status: 400 });
  }
  const settings = await saveSettings({ notificationTimes: [times[0], times[1]] });
  return Response.json({ ok: true, settings });
}
