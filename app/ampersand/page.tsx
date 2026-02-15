"use client";

import { useEffect, useMemo, useState } from "react";

export default function Ampersand() {
  const headline = "Ampersand";
  const subhead =
    "A movement for menopause awareness, education, and dignity — because women are not finished.";
  const manifesto = [
    "Menopause is not an ending. It’s a transition.",
    "Information should be clear, modern, and shame-free.",
    "Partners, leaders, and clinicians should know what to expect and how to help.",
    "Women deserve support at home, at work, and in healthcare — without stigma.",
    "We are not less-than. We are and."
  ];

  const typedText = useMemo(
    () =>
      "Normalize the conversation → modernize the information → humanize the experience",
    []
  );
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: number | undefined;

    const tick = () => {
      i += 1;
      setTyped(typedText.slice(0, i));
      if (i < typedText.length) timer = window.setTimeout(tick, 28);
    };

    timer = window.setTimeout(tick, 28);
    return () => timer && window.clearTimeout(timer);
  }, [typedText]);

  return (
    <main className="outer">
      <div className="wrap">
        <header className="header">
          <div className="mark" aria-hidden>
            &amp;
          </div>
          <div>
            <h1>{headline}</h1>
            <p className="sub">{subhead}</p>
          </div>
        </header>

        <section className="typing">
          <span className="mono">{typed}</span>
          <span className="cursor" />
        </section>

        <section className="grid">
          <div className="card">
            <h2>Why this exists</h2>
            <p>
              Menopause affects careers, relationships, mental health, sleep,
              confidence, and physical well-being — yet most people are left to
              Google their way through it.
            </p>
            <p>
              Ampersand is a public “and”: education <span className="dim">and</span>{" "}
              empathy, science <span className="dim">and</span> stories, support{" "}
              <span className="dim">and</span> action.
            </p>
          </div>

          <div className="card">
            <h2>The manifesto</h2>
            <ul>
              {manifesto.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ctaRow">
          <div className="ctaCard">
            <h3>Get the starter guide</h3>
            <p className="small">
              A short, plain-English guide: symptoms, treatment options, how to
              talk about it, and how to support someone you love.
            </p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>
              Coming soon
            </a>
          </div>

          <div className="ctaCard">
            <h3>For workplaces</h3>
            <p className="small">
              A simple toolkit for managers and HR: language, accommodations,
              policies, and culture.
            </p>
            <a className="btn ghost" href="#" onClick={(e) => e.preventDefault()}>
              Coming soon
            </a>
          </div>

          <div className="ctaCard">
            <h3>For partners</h3>
            <p className="small">
              What to say, what not to say, and how to be steady when things are
              hard.
            </p>
            <a className="btn ghost" href="#" onClick={(e) => e.preventDefault()}>
              Coming soon
            </a>
          </div>
        </section>

        <footer className="footer">
          <div className="mono dim">
            ampersand.projectsproject.com
          </div>
          <div className="links">
            <a href="https://projectsproject.com">Back to the lab</a>
            <span className="dot">•</span>
            <a href="/ampersand">/ampersand</a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .outer {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 48px 18px;
          background: radial-gradient(
              1200px 700px at 20% 10%,
              rgba(37, 99, 235, 0.15),
              transparent 60%
            ),
            radial-gradient(
              900px 600px at 85% 70%,
              rgba(15, 23, 42, 0.55),
              transparent 55%
            ),
            linear-gradient(135deg, #0b1220, #0f172a);
          color: #e5e7eb;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial;
        }
        .wrap {
          width: min(980px, calc(100% - 24px));
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
          overflow: hidden;
          padding: 44px 42px;
          backdrop-filter: blur(10px);
        }
        .header {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 18px;
        }
        .mark {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(37, 99, 235, 0.18);
          border: 1px solid rgba(37, 99, 235, 0.35);
          color: #bfdbfe;
          font-size: 34px;
          line-height: 1;
          user-select: none;
        }
        h1 {
          margin: 0;
          font-size: clamp(40px, 5vw, 56px);
          letter-spacing: -0.03em;
          color: #f9fafb;
        }
        .sub {
          margin: 10px 0 0;
          font-size: clamp(16px, 2.2vw, 18px);
          color: rgba(229, 231, 235, 0.82);
          line-height: 1.5;
          max-width: 70ch;
        }

        .typing {
          margin-top: 22px;
          border-radius: 14px;
          padding: 14px 16px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 13.5px;
          color: #93c5fd;
        }
        .cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #93c5fd;
          margin-left: 5px;
          vertical-align: bottom;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        .grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 16px;
          margin-top: 18px;
        }
        @media (max-width: 860px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .wrap {
            padding: 34px 22px;
          }
        }

        .card {
          border-radius: 16px;
          padding: 18px 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .card h2 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #f3f4f6;
          letter-spacing: -0.01em;
        }
        .card p {
          margin: 0 0 10px;
          line-height: 1.65;
          color: rgba(229, 231, 235, 0.82);
        }
        .card ul {
          margin: 0;
          padding-left: 18px;
          color: rgba(229, 231, 235, 0.86);
          line-height: 1.7;
        }
        .card li {
          margin: 8px 0;
        }
        .dim {
          opacity: 0.7;
        }

        .ctaRow {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 860px) {
          .ctaRow {
            grid-template-columns: 1fr;
          }
        }
        .ctaCard {
          border-radius: 16px;
          padding: 16px 16px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .ctaCard h3 {
          margin: 0 0 8px;
          font-size: 14px;
          letter-spacing: -0.01em;
          color: #f9fafb;
        }
        .small {
          margin: 0 0 12px;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(229, 231, 235, 0.8);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.95);
          color: white;
          font-size: 13px;
          text-decoration: none;
          border: 1px solid rgba(37, 99, 235, 0.5);
          transition: transform 0.08s ease, filter 0.12s ease;
          user-select: none;
        }
        .btn:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .btn.ghost {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(229, 231, 235, 0.92);
        }

        .footer {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .links {
          display: inline-flex;
          gap: 10px;
          align-items: center;
          font-size: 13px;
          color: rgba(229, 231, 235, 0.75);
        }
        .links a {
          color: rgba(147, 197, 253, 0.95);
          text-decoration: none;
        }
        .links a:hover {
          text-decoration: underline;
        }
        .dot {
          opacity: 0.45;
        }
      `}</style>
    </main>
  );
}
