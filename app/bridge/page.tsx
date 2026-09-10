"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

type SavedSession = {
  id: string;
  createdAt: string;
  topic: string;
  phuc: string;
  erica: string;
  result: Result;
};

const starters = [
  "What are we actually disagreeing about?",
  "Help us talk about Elly without turning it into a fight.",
  "Help us decide what to do next without deciding the whole marriage tonight.",
  "Translate what each of us is trying to say.",
];

export default function BridgePage() {
  const [topic, setTopic] = useState("");
  const [phuc, setPhuc] = useState("");
  const [erica, setErica] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bridge-sessions-v1");
      if (raw) setSessions(JSON.parse(raw));
    } catch {
      // Local history is optional; ignore malformed browser storage.
    }
  }, []);

  const canSubmit = useMemo(
    () => topic.trim().length > 2 && (phuc.trim().length > 2 || erica.trim().length > 2),
    [topic, phuc, erica]
  );

  async function mediate(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/bridge/api/mediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, phuc, erica }),
      });
      if (!response.ok) throw new Error("The mediator could not respond.");
      const data: Result = await response.json();
      setResult(data);

      const saved: SavedSession = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        topic,
        phuc,
        erica,
        result: data,
      };
      const next = [saved, ...sessions].slice(0, 20);
      setSessions(next);
      localStorage.setItem("bridge-sessions-v1", JSON.stringify(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setTopic("");
    setPhuc("");
    setErica("");
    setResult(null);
    setError("");
  }

  function clearHistory() {
    setSessions([]);
    localStorage.removeItem("bridge-sessions-v1");
    setShowHistory(false);
  }

  return (
    <main className="bridge-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="bridge-header">
        <div className="brand-mark">&amp;</div>
        <div>
          <div className="eyebrow">PRIVATE SPACE FOR PHUC + ERICA</div>
          <h1>Bridge</h1>
        </div>
        <button className="ghost-button" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Close history" : "Our conversations"}
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="status-pill"><i /> De-escalation first</span>
          <h2>Both sides can be true.<br />Neither side has to win.</h2>
          <p>
            Bridge helps you slow a hard conversation down, understand what the other person is actually saying,
            and find the smallest useful next step.
          </p>
        </div>
        <div className="principles-card">
          <div className="tiny-label">HOW BRIDGE WORKS</div>
          <p><strong>It remembers context.</strong> It does not use old pain as ammunition.</p>
          <p><strong>It does not decide who is right.</strong> It separates facts, feelings, needs, and requests.</p>
          <p><strong>It protects the relationship.</strong> When a conversation is too hot, slowing down is a valid outcome.</p>
        </div>
      </section>

      {showHistory && (
        <section className="history-panel">
          <div className="section-heading">
            <div><span className="tiny-label">LOCAL TO THIS BROWSER</span><h3>Recent conversations</h3></div>
            {sessions.length > 0 && <button className="text-button" onClick={clearHistory}>Clear</button>}
          </div>
          {sessions.length === 0 ? (
            <p className="empty">Nothing saved yet. Bridge stores recent sessions only in this browser.</p>
          ) : (
            <div className="history-list">
              {sessions.map((session) => (
                <button key={session.id} className="history-item" onClick={() => {
                  setTopic(session.topic); setPhuc(session.phuc); setErica(session.erica); setResult(session.result); setShowHistory(false);
                }}>
                  <strong>{session.topic}</strong>
                  <span>{new Date(session.createdAt).toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <form className="mediator-card" onSubmit={mediate}>
        <div className="step-row">
          <span className="step-number">1</span>
          <div><span className="tiny-label">START HERE</span><h3>What do you need help talking through?</h3></div>
        </div>
        <textarea
          className="topic-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: We disagree about how much contact to have while we're separated..."
          rows={3}
        />
        <div className="starter-row">
          {starters.map((starter) => <button key={starter} type="button" onClick={() => setTopic(starter)}>{starter}</button>)}
        </div>

        <div className="divider" />

        <div className="step-row">
          <span className="step-number">2</span>
          <div><span className="tiny-label">SEPARATE PERSPECTIVES</span><h3>Say your side without interruption.</h3></div>
        </div>
        <div className="perspective-grid">
          <label className="perspective phuc-card">
            <span className="person-label"><i /> Phuc</span>
            <textarea value={phuc} onChange={(e) => setPhuc(e.target.value)} placeholder="What happened from your perspective? What are you feeling or worried about? What do you want Erica to understand?" rows={9} />
          </label>
          <label className="perspective erica-card">
            <span className="person-label"><i /> Erica</span>
            <textarea value={erica} onChange={(e) => setErica(e.target.value)} placeholder="What happened from your perspective? What are you feeling or worried about? What do you want Phuc to understand?" rows={9} />
          </label>
        </div>
        <p className="privacy-note">Each perspective is considered equally. Bridge will not reveal private historical notes or use one person&apos;s prior account as proof against the other.</p>

        <div className="action-row">
          <button type="button" className="secondary-button" onClick={clearForm}>New conversation</button>
          <button className="primary-button" disabled={!canSubmit || loading}>
            {loading ? "Finding common ground…" : "Find common ground →"}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      {result && (
        <section className="result-card" aria-live="polite">
          <div className="result-topline">
            <div><span className="tiny-label">BRIDGE&apos;S READ</span><h3>Here&apos;s the conversation underneath the argument.</h3></div>
            <span className={`temperature ${result.temperature}`}>{result.temperature === "calm" ? "Calm" : result.temperature === "tense" ? "Tense" : "High emotion"}</span>
          </div>

          {result.pause && <div className="pause-card"><strong>A pause may help.</strong><p>{result.pause}</p></div>}
          <p className="big-summary">{result.summary}</p>

          <div className="translation-grid">
            <div><span className="tiny-label">WHAT PHUC MAY BE TRYING TO SAY</span><p>{result.phuc}</p></div>
            <div><span className="tiny-label">WHAT ERICA MAY BE TRYING TO SAY</span><p>{result.erica}</p></div>
          </div>

          <div className="insight-grid">
            <div className="insight-card good"><span className="tiny-label">COMMON GROUND</span><ul>{result.commonGround.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
            <div className="insight-card open"><span className="tiny-label">STILL UNRESOLVED</span><ul>{result.unresolved.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
          </div>

          <div className="next-step">
            <span className="tiny-label">SMALLEST USEFUL NEXT STEP</span>
            <h4>{result.nextStep}</h4>
            <div className="words-card"><span>Try saying:</span><p>“{result.suggestedWords}”</p></div>
          </div>
        </section>
      )}

      <footer>
        <span>Bridge is a communication aid, not therapy, legal advice, or an emergency service.</span>
        <span>Built for understanding, not evidence.</span>
      </footer>
    </main>
  );
}
