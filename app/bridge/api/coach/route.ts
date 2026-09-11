import { NextRequest, NextResponse } from "next/server";

function heuristic(text: string) {
  let softened = text;
  const swaps: Array<[RegExp, string]> = [
    [/\byou always\b/gi, "I often experience"],
    [/\byou never\b/gi, "I don't feel like"],
    [/\byou make me\b/gi, "I feel"],
    [/\byou're lying\b/gi, "I'm having trouble reconciling what I'm hearing with what I understood"],
    [/\bthat's ridiculous\b/gi, "I see that differently"],
  ];
  for (const [pattern, replacement] of swaps) softened = softened.replace(pattern, replacement);
  return {
    intent: "Make the core concern easier to hear without weakening the point you are trying to make.",
    flags: text === softened ? ["Your wording is already fairly direct."] : ["A few phrases may land as accusation rather than explanation."],
    suggested: softened,
    questions: ["What do you most want the other person to understand?", "Is there a specific request you want to make, or do you mainly want to be understood?"],
    source: "fallback" as const,
  };
}

function gatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.OPENAI_API_KEY || "";
}

function gatewayUrl() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
    ? "https://ai-gateway.vercel.sh/v1/responses"
    : "https://api.openai.com/v1/responses";
}

function gatewayModel() {
  if (process.env.BRIDGE_MODEL) return process.env.BRIDGE_MODEL;
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
    ? "openai/gpt-5.6-sol"
    : "gpt-5.6";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = String(body.text || "").trim().slice(0, 8000);
  const topic = String(body.topic || "").trim().slice(0, 3000);
  const role = body.role === "erica" ? "Erica" : "Phuc";
  if (text.length < 3) return NextResponse.json({ error: "Write a little more first." }, { status: 400 });

  const apiKey = gatewayToken();
  if (!apiKey) return NextResponse.json(heuristic(text));

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
      console.error("Bridge coach AI error", response.status, await response.text());
      return NextResponse.json(heuristic(text));
    }
    const data = await response.json();
    const output = data.output_text || data.output?.flatMap((x: any) => x.content || []).find((x: any) => x.type === "output_text")?.text;
    const parsed = output ? JSON.parse(output) : null;
    return NextResponse.json(parsed ? { ...parsed, source: "ai" } : heuristic(text));
  } catch (error) {
    console.error("Bridge coach AI exception", error);
    return NextResponse.json(heuristic(text));
  }
}
