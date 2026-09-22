import { NextRequest } from "next/server";
import { getState, saveState, type DingState } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getState(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as Partial<DingState>;
  if (!Array.isArray(body.categories) || !Array.isArray(body.tasks)) {
    return Response.json({ error: "Invalid Ding state." }, { status: 400 });
  }
  const state = await saveState({
    categories: body.categories,
    tasks: body.tasks,
    updatedAt: Date.now(),
  });
  return Response.json({ ok: true, state });
}
