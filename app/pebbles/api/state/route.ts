import { NextRequest } from "next/server";
import { isAuthorized } from "../../lib/auth";
import { getState, saveState, type PebblesState } from "../../lib/store";
import { prediction } from "../../lib/prediction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const state = await getState();
  return Response.json({ state, prediction: prediction(state) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as PebblesState | null;
  if (!body || typeof body.periods !== "object" || typeof body.pills !== "object" || typeof body.poops !== "object") {
    return Response.json({ error: "Invalid Pebbles state." }, { status: 400 });
  }
  const state = await saveState(body);
  return Response.json({ ok: true, state, prediction: prediction(state) });
}
