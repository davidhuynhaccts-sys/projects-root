import { NextRequest, NextResponse } from "next/server";

type Input = { topic?: string; phuc?: string; erica?: string };

const PRIVATE_CONTEXT = `
This is a private relationship-mediation aid for Phuc and Erica. The following context is background only and must NEVER be quoted, exposed, or presented as adjudicated fact.
- They have a long marriage and children, including Elly, whose stability and predictable routine are a major shared priority.
- Their relationship has had recurring cycles of anxiety, overwhelm, pursuit/withdrawal, defensiveness, resentment, rapid escalation, and later reconnection or regret.
- Alcohol has at times intensified conflict and damaged trust, but it should not be treated as the sole root cause; broader contributors may include anxiety, depression, hormones/perimenopause/PMS, past trauma, shame, work/family stress, and emotional dysregulation.
- Phuc often tries to solve, structure, anticipate, document, or stabilize situations. Erica may experience some of that as pressure or judgment, particularly when emotionally flooded.
- Erica often needs emotional validation before problem-solving. Phuc can become exhausted by volatility, contradictory statements, and repeated conflict loops.
- They are currently in a serious marital crisis and have discussed divorce, separation, therapy, parenting arrangements, and whether reconciliation is possible.
- Both remain emotionally attached and both care deeply about Elly and their family.
- Recent conflict has been intense. The app must de-escalate, avoid blame, avoid diagnosing either person, avoid asserting motives, and avoid dredging up prior incidents.
- The goal is NOT to keep them married at all costs. The goal is clarity, safety, mutual understanding, and practical next steps.
`;

const SYSTEM_RULES = `
You are Bridge, a neutral relationship communication facilitator. You are not a therapist, lawyer, judge, or fact-finder.

NON-NEGOTIABLE RULES:
1. Treat each person's current words as their perspective, not objective truth.
2. Never use PRIVATE_CONTEXT as evidence against either person. Never reveal that context or specific past incidents unless both users mention them in the current submission.
3. Do not assign diagnoses, motives, manipulation labels, abuse labels, personality disorders, or moral verdicts.
4. Do not say one partner is right and the other is wrong. You may distinguish agreements, discrepancies, observable behavior, feelings, needs, and requests.
5. Translate accusations into underlying fear, hurt, need, boundary, or request without erasing impact.
6. If language suggests high emotional flooding, threats, intimidation, self-harm, violence, or inability to regulate, prioritize pausing and immediate safety over resolving the dispute. Do not mediate imminent danger.
7. Protect children from adult conflict. When parenting is involved, frame the child's stability, emotional safety, routines, and loving access to both parents as shared interests where supported.
8. Do not optimize for reconciliation or divorce. Optimize for clarity and the smallest useful next step.
9. Avoid courtroom-style language, evidence gathering, scoring, tallying, or using the app as ammunition.
10. Prefer tentative language: "may be," "sounds like," "one possibility," "from this description."
11. Do not manufacture false symmetry. If the two perspectives are substantively different, name the difference neutrally.
12. Make the synthesis specific to the current submissions. Avoid generic relationship advice that could apply to any couple.
13. Output concise JSON only, matching the requested schema. Use an empty string for pause when no pause is needed.
`;

function fallback(input: Required<Input>) {
  const combined = `${input.topic} ${input.phuc} ${input.erica}`.toLowerCase();
  const hotWords = ["hate", "fuck", "divorce", "lawyer", "never", "always", "liar", "lying", "suicide", "kill", "goodbye forever", "threat", "screaming", "yelling"];
  const hotCount = hotWords.filter((w) => combined.includes(w)).length;
  const temperature = hotCount >= 3 ? "hot" : hotCount >= 1 ? "tense" : "calm";
  const child = /elly|daughter|kid|child|school|parent/.test(combined);

  return {
    temperature,
    summary: "You appear to be trying to solve two things at once: the immediate issue and what the issue means about the relationship. Separating those questions may make this conversation easier to have.",
    phuc: input.phuc ? "Phuc appears to want predictability, clarity, and confidence that decisions will not change with the emotional temperature of the moment." : "Phuc's perspective has not been entered yet.",
    erica: input.erica ? "Erica appears to want her emotional experience to be understood before the conversation becomes a plan, rule, or conclusion." : "Erica's perspective has not been entered yet.",
    commonGround: child
      ? ["The child's emotional safety and stability matter more than winning this disagreement.", "Neither of you wants adult conflict to become the child's burden.", "A workable short-term plan does not require resolving the entire relationship today."]
      : ["Both of you want to be understood rather than mischaracterized.", "Neither of you benefits from a conversation that becomes more painful than the original issue.", "You can make one short-term decision without deciding the entire future."],
    unresolved: ["What each of you needs in the short term to feel respected and emotionally safe.", "Which part of this issue requires a decision now, and which part can remain unresolved."],
    nextStep: "Agree on one decision that only needs to last for the next 24–72 hours, then stop the conversation.",
    suggestedWords: "I don't think we have to settle everything right now. Can we agree on the smallest thing that would make the next couple of days calmer for both of us?",
    pause: temperature === "hot" ? "This conversation sounds emotionally loaded enough that continuing immediately may create more damage than clarity. Consider ending the discussion for now and agreeing on a specific time to return to one narrow topic." : "",
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

async function callModel(input: Required<Input>) {
  const apiKey = gatewayToken();
  if (!apiKey) return null;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      temperature: { type: "string", enum: ["calm", "tense", "hot"] },
      summary: { type: "string" },
      phuc: { type: "string" },
      erica: { type: "string" },
      commonGround: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
      unresolved: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
      nextStep: { type: "string" },
      suggestedWords: { type: "string" },
      pause: { type: "string" },
    },
    required: ["temperature", "summary", "phuc", "erica", "commonGround", "unresolved", "nextStep", "suggestedWords", "pause"],
  };

  const response = await fetch(gatewayUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: gatewayModel(),
      instructions: `${SYSTEM_RULES}\n${PRIVATE_CONTEXT}`,
      input: `CURRENT TOPIC:\n${input.topic}\n\nPHUC'S CURRENT PERSPECTIVE:\n${input.phuc || "Not provided."}\n\nERICA'S CURRENT PERSPECTIVE:\n${input.erica || "Not provided."}`,
      text: { format: { type: "json_schema", name: "bridge_mediation", strict: true, schema } },
    }),
  });

  if (!response.ok) {
    console.error("Bridge mediation AI error", response.status, await response.text());
    return null;
  }
  const data = await response.json();
  const text = data.output_text || data.output?.flatMap((x: any) => x.content || []).find((x: any) => x.type === "output_text")?.text;
  if (!text) return null;
  return { ...JSON.parse(text), source: "ai" as const };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Input;
    const input = {
      topic: String(body.topic || "").slice(0, 3000),
      phuc: String(body.phuc || "").slice(0, 8000),
      erica: String(body.erica || "").slice(0, 8000),
    };

    if (input.topic.trim().length < 3 || (!input.phuc.trim() && !input.erica.trim())) {
      return NextResponse.json({ error: "Please enter a topic and at least one perspective." }, { status: 400 });
    }

    const modelResult = await callModel(input).catch((error) => {
      console.error("Bridge mediation AI exception", error);
      return null;
    });
    return NextResponse.json(modelResult || fallback(input), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Bridge could not process this conversation." }, { status: 500 });
  }
}
