import { claimDigest, deletePushSubscription, getPushSubscription, getState } from "../../lib/store";
import { sendPush } from "../../lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function centralNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    hour: Number(p.hour),
    minute: Number(p.minute),
  };
}

function slotForNow() {
  const now = centralNow();
  const minutes = now.hour * 60 + now.minute;
  const morning = 7 * 60;
  const afternoon = 14 * 60 + 30;

  if (minutes >= morning && minutes <= morning + 45) {
    return { id: `${now.date}:0700`, label: "7:00 AM" };
  }
  if (minutes >= afternoon && minutes <= afternoon + 45) {
    return { id: `${now.date}:1430`, label: "2:30 PM" };
  }
  return null;
}

function chunks(lines: string[], max = 2800) {
  const result: string[] = [];
  let current = "";
  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length > max && current) {
      result.push(current);
      current = line;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

export async function GET(request: Request) {
  const slot = slotForNow();
  if (!slot) return Response.json({ ok: true, skipped: "outside-window" });

  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent.includes("GitHub-Hookshot") && !userAgent.includes("curl")) {
    return Response.json({ ok: true, skipped: "scheduler-only" });
  }

  const [{ state }, subscription] = await Promise.all([getState(), getPushSubscription()]);
  if (!subscription) return Response.json({ ok: true, skipped: "no-subscription" });
  if (!state.tasks.length) return Response.json({ ok: true, skipped: "no-open-tasks" });

  const claimed = await claimDigest(slot.id);
  if (!claimed) return Response.json({ ok: true, skipped: "already-sent" });

  const categoryMap = new Map(state.categories.map(c => [c.id, c.name]));
  const lines = state.tasks.map(task => `• ${categoryMap.get(task.categoryId) || "Other"}: ${task.text}`);
  const bodies = chunks(lines);

  try {
    for (let i = 0; i < bodies.length; i++) {
      await sendPush(subscription, {
        title: bodies.length > 1
          ? `Ding · ${state.tasks.length} open · ${i + 1}/${bodies.length}`
          : `Ding · ${state.tasks.length} open`,
        body: bodies[i],
        url: "/ding",
        tag: `ding-${slot.id}-${i}`,
      });
    }
    return Response.json({ ok: true, sent: bodies.length, tasks: state.tasks.length, slot: slot.label });
  } catch (error: any) {
    console.error("Ding digest push failed", error);
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await deletePushSubscription();
    }
    return Response.json({ error: "Digest notification failed." }, { status: 500 });
  }
}
