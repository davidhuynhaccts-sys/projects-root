"use client";

import { FormEvent, useEffect, useState } from "react";
import "./bridge.css";

type Result = {
  temperature: "calm" | "tense" | "hot";
  summary: string;
  phuc: string;
  erica: string;
  commonGround: string[];
  unresolved: string[];
  nextStep: string;
  suggestedWords: string;
  pause?: string;
};

type Room = {
  id: string;
  topic: string;
  createdAt: string;
  createdBy: "phuc" | "erica";
  role: "phuc" | "erica";
  meSubmitted: boolean;
  partnerSubmitted: boolean;
  myText: string;
  ready: boolean;
  result: Result | null;
  durable: boolean;
};

type Coaching = {
  intent: string;
  flags: string[];
  suggested: string;
  questions: string[];
};

const starters = [
  "I want to talk about something important.",
  "I want help putting my thoughts into words.",
  "I want to understand where we see this differently.",
  "I want help finding a next step we can both live with.",
];

export default function BridgePage() {
  const [roomId, setRoomId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [topic, setTopic] = useState("");
  const [creator, setCreator] = useState<"phuc" | "erica">("phuc");
  const [draft, setDraft] = useState("");
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [partnerUrl, setPartnerUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("room") || "";
    const token = p.get("token") || "";
    if (id && token) { setRoomId(id); setAccessToken(token); loadRoom(id, token); }
  }, []);

  useEffect(() => {
    if (!roomId || !accessToken || !room || room.result) return;
    const timer = window.setInterval(() => loadRoom(roomId, accessToken, true), 7000);
    return () => window.clearInterval(timer);
  }, [roomId, accessToken, room?.result]);

  async function loadRoom(id: string, token: string, quiet = false) {
    try {
      const r = await fetch(`/bridge/api/session?room=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!r.ok) throw new Error((await r.json()).error || "Room not found.");
      let data: Room = await r.json();
      if (!quiet && data.myText) setDraft(data.myText);
      if (data.ready && !data.result) {
        const resolve = await fetch("/bridge/api/session", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room: id, token, action: "resolve" }) });
        if (resolve.ok) data = await resolve.json();
      }
      const hadResult = Boolean(room?.result);
      setRoom(data);
      if (data.result && !hadResult && quiet) notifyReady();
    } catch (e) {
      if (!quiet) setError(e instanceof Error ? e.message : "Could not open this room.");
    }
  }

  function notifyReady() {
    if ("Notification" in window && Notification.permission === "granted") new Notification("Bridge is ready", { body: "Both perspectives are in. Your shared conversation is ready to read." });
  }

  async function requestNotifications() {
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
  }

  async function createRoom(e: FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 3) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/bridge/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, createdBy: creator }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not create room.");
      const mine = new URL(data.myUrl);
      const id = mine.searchParams.get("room") || "";
      const token = mine.searchParams.get("token") || "";
      setRoomId(id); setAccessToken(token); setPartnerUrl(data.partnerUrl);
      window.history.replaceState({}, "", `/bridge?room=${id}&token=${token}`);
      await loadRoom(id, token);
      await requestNotifications();
      if (data.storage === "memory") setStatus("Shared-room persistence still needs the Bridge database connection; this room may expire between server instances.");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  async function coachDraft() {
    if (!room || draft.trim().length < 3) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/bridge/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: room.topic, role: room.role, text: draft }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Bridge could not review the draft.");
      setCoaching(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not review draft."); }
    finally { setLoading(false); }
  }

  async function submitPerspective() {
    if (!room || draft.trim().length < 3) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/bridge/api/session", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room: room.id, token: accessToken, action: "submit", text: draft }) });
      if (!r.ok) throw new Error((await r.json()).error || "Could not submit.");
      const data: Room = await r.json();
      setRoom(data); setCoaching(null); await requestNotifications();
      if (data.ready && !data.result) await loadRoom(room.id, accessToken, true);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit."); }
    finally { setLoading(false); }
  }

  async function copyPartnerLink() {
    if (!partnerUrl) return;
    await navigator.clipboard.writeText(partnerUrl);
    setStatus(`Private link copied for ${creator === "phuc" ? "Erica" : "Phuc"}.`);
  }

  function acceptSuggestion() { if (coaching?.suggested) { setDraft(coaching.suggested); setCoaching(null); } }

  if (!room) {
    return <main className="bridge-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="bridge-header"><div className="brand-mark">&amp;</div><div><div className="eyebrow">PRIVATE SPACE FOR PHUC + ERICA</div><h1>Bridge</h1></div></header>
      <section className="hero"><div className="hero-copy"><span className="status-pill"><i /> De-escalation first</span><h2>Start the issue here.<br/>Not in a text fight.</h2><p>One of you opens a private room. Each person gets their own space to say what they mean. Bridge helps clarify the words before either perspective becomes part of the shared conversation.</p></div>
      <div className="principles-card"><div className="tiny-label">THREE SPACES</div><p><strong>Phuc mode.</strong> Private drafting and coaching for Phuc.</p><p><strong>Erica mode.</strong> Private drafting and coaching for Erica.</p><p><strong>Together mode.</strong> Opens only after both perspectives are submitted.</p></div></section>
      <form className="mediator-card start-card" onSubmit={createRoom}>
        <div className="step-row"><span className="step-number">1</span><div><span className="tiny-label">OPEN A ROOM</span><h3>Who is starting this conversation?</h3></div></div>
        <div className="role-toggle"><button type="button" className={creator === "phuc" ? "active" : ""} onClick={() => setCreator("phuc")}>Phuc</button><button type="button" className={creator === "erica" ? "active" : ""} onClick={() => setCreator("erica")}>Erica</button></div>
        <label className="field-label">What do you want to talk about?</label>
        <textarea className="topic-input" value={topic} onChange={e => setTopic(e.target.value)} rows={4} placeholder="Describe the issue in one or two sentences. This becomes the shared topic—not your whole argument." />
        <div className="starter-row">{starters.map(s => <button type="button" key={s} onClick={() => setTopic(s)}>{s}</button>)}</div>
        <div className="action-row"><span className="privacy-note">Your first draft stays private.</span><button className="primary-button" disabled={loading || topic.trim().length < 3}>{loading ? "Opening…" : "Open private room →"}</button></div>
        {error && <p className="error-message">{error}</p>}
      </form>
      <footer><span>Bridge is a communication aid, not therapy, legal advice, or an emergency service.</span><span>Built for understanding, not evidence.</span></footer>
    </main>;
  }

  const myName = room.role === "phuc" ? "Phuc" : "Erica";
  const partnerName = room.role === "phuc" ? "Erica" : "Phuc";

  return <main className="bridge-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="bridge-header"><div className="brand-mark">&amp;</div><div><div className="eyebrow">ROOM {room.id.toUpperCase()}</div><h1>Bridge</h1></div><span className="mode-badge">{room.result ? "Together mode" : `${myName} mode`}</span></header>

    <section className="room-topic"><span className="tiny-label">THE SHARED TOPIC</span><h2>{room.topic}</h2><p>Bridge keeps your private drafts separate until each of you chooses what to submit.</p></section>

    {partnerUrl && !room.partnerSubmitted && <section className="invite-card"><div><span className="tiny-label">INVITE {partnerName.toUpperCase()}</span><h3>Your room is ready.</h3><p>Send {partnerName} this private link. It opens directly into {partnerName} mode.</p></div><button className="primary-button" onClick={copyPartnerLink}>Copy {partnerName}&apos;s link</button></section>}

    {!room.meSubmitted && !room.result && <section className="mediator-card">
      <div className="step-row"><span className="step-number">2</span><div><span className="tiny-label">PRIVATE DRAFT · {myName.toUpperCase()} ONLY</span><h3>What do you want {partnerName} to understand?</h3></div></div>
      <textarea className="draft-input" value={draft} onChange={e => { setDraft(e.target.value); setCoaching(null); }} rows={11} placeholder="Write it the way it comes out first. Bridge can help separate what happened, what you felt, what you fear it means, and what you are asking for." />
      <div className="draft-actions"><button className="secondary-button" onClick={coachDraft} disabled={loading || draft.trim().length < 3}>Review my wording</button><span>Nothing is shared yet.</span></div>
      {coaching && <div className="coach-card"><div className="tiny-label">PRIVATE BRIDGE COACH</div><h4>{coaching.intent}</h4><ul>{coaching.flags.map((x,i) => <li key={i}>{x}</li>)}</ul><div className="rewrite"><span>Clearer version</span><p>{coaching.suggested}</p></div><div className="coach-actions"><button className="secondary-button" onClick={() => setCoaching(null)}>Keep mine</button><button className="primary-button" onClick={acceptSuggestion}>Use this version</button></div></div>}
      <div className="submit-band"><div><strong>Ready for {partnerName} to eventually see this?</strong><p>You can still revise until you press submit.</p></div><button className="primary-button" onClick={submitPerspective} disabled={loading || draft.trim().length < 3}>Submit my perspective →</button></div>
      {error && <p className="error-message">{error}</p>}
    </section>}

    {room.meSubmitted && !room.result && <section className="waiting-card"><div className="waiting-icon">✓</div><span className="tiny-label">YOUR PART IS IN</span><h2>{room.partnerSubmitted ? "Bridge is building the shared conversation." : `Waiting for ${partnerName}.`}</h2><p>Your submitted perspective is locked into this room. Bridge will alert this browser when both sides are ready.</p><button className="secondary-button" onClick={requestNotifications}>Allow browser alert</button></section>}

    {room.result && <section className="result-card" aria-live="polite"><div className="result-topline"><div><span className="tiny-label">TOGETHER MODE</span><h3>Here&apos;s the conversation underneath the argument.</h3></div><span className={`temperature ${room.result.temperature}`}>{room.result.temperature === "calm" ? "Calm" : room.result.temperature === "tense" ? "Tense" : "High emotion"}</span></div>
      {room.result.pause && <div className="pause-card"><strong>A pause may help.</strong><p>{room.result.pause}</p></div>}
      <p className="big-summary">{room.result.summary}</p>
      <div className="translation-grid"><div><span className="tiny-label">WHAT PHUC MAY BE TRYING TO SAY</span><p>{room.result.phuc}</p></div><div><span className="tiny-label">WHAT ERICA MAY BE TRYING TO SAY</span><p>{room.result.erica}</p></div></div>
      <div className="insight-grid"><div className="insight-card good"><span className="tiny-label">COMMON GROUND</span><ul>{room.result.commonGround.map((x,i) => <li key={i}>{x}</li>)}</ul></div><div className="insight-card open"><span className="tiny-label">STILL UNRESOLVED</span><ul>{room.result.unresolved.map((x,i) => <li key={i}>{x}</li>)}</ul></div></div>
      <div className="next-step"><span className="tiny-label">SMALLEST USEFUL NEXT STEP</span><h4>{room.result.nextStep}</h4><div className="words-card"><span>Try saying:</span><p>“{room.result.suggestedWords}”</p></div></div>
    </section>}
    {status && <div className="toast-note">{status}</div>}
    {!room.durable && <div className="infra-note"><strong>Prototype storage:</strong> connect Redis to make room links durable across browsers and server restarts.</div>}
    <footer><span>Private drafts are not shown to the other person. Only submitted perspectives enter Together mode.</span><span>Built for understanding, not evidence.</span></footer>
  </main>;
}
