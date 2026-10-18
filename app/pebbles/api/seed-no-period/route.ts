import crypto from "node:crypto";
import { getState, saveState } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_HASH = "23570cb48b9e65530c107d6d28dcde063e08f3d834c7d63b07adc5b4b79fe178";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function safeEqual(a:string,b:string){
  if(a.length!==b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const payload = url.searchParams.get("payload") || "";
  if (!safeEqual(sha256(token), TOKEN_HASH)) {
    return Response.json({ ok:false, error:"Unauthorized" }, { status:401 });
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
    const body = JSON.parse(plain) as { dates?: string[] };
    if (!Array.isArray(body.dates) || !body.dates.every(d => /^\d{4}-\d{2}-\d{2}$/.test(d))) {
      throw new Error("dates");
    }

    const state = await getState();
    if (!state.updatedAt || Object.keys(state.periods).length === 0) {
      return Response.json({ ok:false, error:"Shared Pebbles data unavailable" }, { status:503 });
    }
    const noPeriods = { ...(state.noPeriods || {}) };
    const periods = { ...state.periods };
    for (const date of body.dates) {
      noPeriods[date] = true;
      delete periods[date];
    }
    await saveState({ ...state, periods, noPeriods });
    return Response.json({ ok:true, updated:body.dates.length });
  } catch {
    return Response.json({ ok:false, error:"Invalid payload" }, { status:400 });
  }
}
