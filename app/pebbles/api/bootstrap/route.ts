import crypto from "node:crypto";
import { getState, saveState, type PebblesState } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_HASH = "04b1d4d8ca4029349d8e44da1f7691d1edb05cf769c195b18d216a7ee12d88fb";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function safeEqual(a:string,b:string){
  if(a.length!==b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
}

export async function GET(request: Request) {
  const current = await getState();
  if (current.updatedAt) return Response.json({ ok: false, error: "Already initialized." }, { status: 409 });

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const payload = url.searchParams.get("payload") || "";
  if (!safeEqual(sha256(token), TOKEN_HASH)) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    const [ivText, tagText, cipherText] = payload.split(".");
    if (!ivText || !tagText || !cipherText) throw new Error("payload");
    const key = crypto.createHash("sha256").update(token).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(cipherText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const state = JSON.parse(plain) as PebblesState;
    await saveState(state);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }
}
