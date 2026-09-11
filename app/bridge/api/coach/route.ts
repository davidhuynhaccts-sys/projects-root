import { NextRequest, NextResponse } from "next/server";

function gatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.OPENAI_API_KEY || "";
}

function usingGateway() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

function gatewayUrl() {
  return usingGateway()
    ? "https://ai-gateway.vercel.sh/v1/responses"
    : "https://api.openai.com/v1/responses";
}

function gatewayModel() {
  if (usingGateway()) return "openai/gpt-5.6-sol";
  return process.env.BRIDGE_MODEL || "gpt-5.6";
}

function safeGatewayMessage(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return String(parsed?.error?.message || parsed?.message || parsed?.error || "AI Gateway rejected the request.").slice(0, 500);
  } catch {
    return raw.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 500) || "AI Gateway rejected the request.";
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = String(body.text || "").trim().slice(0, 8000);
  const topic = String(body.topic || "").trim().slice(0, 3000);
  const role = body.role === "erica" ? "Erica" : "Phuc";
  if (text.length < 3) return NextResponse.json({ error: "Write a little more first." }, { status: 400 });

  const apiKey = gatewayToken();
  if (!apiKey) {
    return NextResponse.json({
      error: "Bridge AI is not configured on this deployment.",
      detail: "No AI_GATEWAY_API_KEY, VERCEL_OIDC_TOKEN, or OPENAI_API_KEY is available.",
    }, { status: 503 });
  }

  try {
    const response = await fetch(gatewayUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: gatewayModel(),
        instructions: `You are Bridge's private writing coach. Help ${role} communicate clearly and reduce avoidable escalation without sanitizing legitimate feelings, impact, boundaries, or disagreement. First infer the user's actual intent and reflect it back accurately. Never tell the user they are right. Never diagnose or assign motives. Do not reveal private history. Preserve the user's voice rather than making it sound clinical or generic. Distinguish observation from interpretation. Prefer first-person experience and specific requests over accusation. If the original wording is already clear, say so rather than rewriting for the sake of rewriting. Output strict JSON only.`,
        input: `TOPIC:\n${topic}\n\nPRIVATE DRAFT:\n${text}`,
        text: { format: { type: "json_schema", name: "bridge_coaching", strict: true, schema: {
          type: "object", additionalProperties: false,
          properties: {
            intent: { type: "string" },
            flags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
            suggested: { type: "string" },
            questions: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 }
          },
          required: ["intent", "flags", "suggested", "questions"]
        } } }
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      const detail = safeGatewayMessage(raw);
      console.error("Bridge coach AI error", response.status, detail);
      return NextResponse.json({
        error: `Bridge AI request failed (${response.status}).`,
        detail,
      }, { status: 502 });
    }

    const data = await response.json();
    const output = data.output_text || data.output?.flatMap((x: any) => x.content || []).find((x: any) => x.type === "output_text")?.text;
    if (!output) {
      console.error("Bridge coach AI returned no output text");
      return NextResponse.json({ error: "Bridge AI returned an empty response." }, { status: 502 });
    }

    return NextResponse.json({ ...JSON.parse(output), source: "ai" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown AI error";
    console.error("Bridge coach AI exception", detail);
    return NextResponse.json({ error: "Bridge AI request failed.", detail: detail.slice(0, 500) }, { status: 502 });
  }
}
