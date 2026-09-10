import { NextRequest, NextResponse } from "next/server";
import { getRoom, roleForToken, saveRoom, storageReady } from "../../lib/store";

function token() {
  return crypto.randomUUID().replaceAll("-", "");
}

function publicRoom(room: Awaited<ReturnType<typeof getRoom>>, role: "phuc" | "erica") {
  if (!room) return null;
  return {
    id: room.id,
    topic: room.topic,
    createdAt: room.createdAt,
    createdBy: room.createdBy,
    role,
    meSubmitted: role === "phuc" ? Boolean(room.phucSubmittedAt) : Boolean(room.ericaSubmittedAt),
    partnerSubmitted: role === "phuc" ? Boolean(room.ericaSubmittedAt) : Boolean(room.phucSubmittedAt),
    myText: role === "phuc" ? room.phucText || "" : room.ericaText || "",
    result: room.result || null,
    ready: Boolean(room.phucSubmittedAt && room.ericaSubmittedAt),
    durable: storageReady(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const topic = String(body.topic || "").trim().slice(0, 3000);
  const createdBy = body.createdBy === "erica" ? "erica" : "phuc";
  if (topic.length < 3) return NextResponse.json({ error: "Add a topic first." }, { status: 400 });

  const id = crypto.randomUUID().split("-")[0];
  const phucToken = token();
  const ericaToken = token();
  const room = { id, topic, createdBy, createdAt: new Date().toISOString(), phucToken, ericaToken };
  const storage = await saveRoom(room);
  const origin = req.nextUrl.origin;
  return NextResponse.json({
    id,
    storage,
    myUrl: `${origin}/bridge?room=${id}&token=${createdBy === "phuc" ? phucToken : ericaToken}`,
    partnerUrl: `${origin}/bridge?room=${id}&token=${createdBy === "phuc" ? ericaToken : phucToken}`,
  });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("room") || "";
  const accessToken = req.nextUrl.searchParams.get("token");
  const room = await getRoom(id);
  if (!room) return NextResponse.json({ error: "This Bridge room was not found." }, { status: 404 });
  const role = roleForToken(room, accessToken);
  if (!role) return NextResponse.json({ error: "This private link is not valid." }, { status: 403 });
  return NextResponse.json(publicRoom(room, role), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = String(body.room || "");
  const accessToken = String(body.token || "");
  const room = await getRoom(id);
  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  const role = roleForToken(room, accessToken);
  if (!role) return NextResponse.json({ error: "Invalid private link." }, { status: 403 });

  if (body.action === "submit") {
    const text = String(body.text || "").trim().slice(0, 8000);
    if (text.length < 3) return NextResponse.json({ error: "Write a little more before submitting." }, { status: 400 });
    if (role === "phuc") { room.phucText = text; room.phucSubmittedAt = new Date().toISOString(); }
    else { room.ericaText = text; room.ericaSubmittedAt = new Date().toISOString(); }
  }

  if (body.action === "resolve" && room.phucSubmittedAt && room.ericaSubmittedAt && !room.result) {
    const response = await fetch(new URL("/bridge/api/mediate", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: room.topic, phuc: room.phucText || "", erica: room.ericaText || "" }),
    });
    if (response.ok) room.result = await response.json();
  }

  await saveRoom(room);
  return NextResponse.json(publicRoom(room, role));
}
