"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const text = useMemo(
    () => "Shipping small experiments → learning fast → keeping the good ones",
    []
  );
  const speed = 35;

  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: number | undefined;

    const tick = () => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i < text.length) {
        timer = window.setTimeout(tick, speed);
      }
    };

    timer = window.setTimeout(tick, speed);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [text]);

  return (
    <main className="wrap-outer">
      <main className="wrap">
        <h1>The Projects Project</h1>

        <p className="sub">
          A structured
          <span className="build">
            <span className="word">
              <span className="tile t1" />
              <span className="tile t2" />
              <span className="tile t3" />
              <span className="tile t4" />
              idea
            </span>
            <span className="word">
              <span className="tile t5" />
              <span className="tile t6" />
              <span className="tile t7" />
              <span className="tile t8" />
              lab
            </span>
          </span>
          .
        </p>

        <div className="typing-container">
          <span id="typed-text">{typed}</span>
          <span className="cursor" />
        </div>

        <div className="footer">
          Ideas power this lab:
          <div className="idea-links">
            moonshot-socks.projectsproject.com
            <br />
            accidental-university.projectsproject.com
            <br />
            quantum-cookbook.projectsproject.com
            <br />
            polite-chaos.projectsproject.com
          </div>
        </div>
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .wrap-outer {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial;
          background: linear-gradient(135deg, #1f2937, #334155);
          color: #111827;
        }

        .wrap {
          width: min(900px, calc(100% - 48px));
          padding: 70px 50px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
        }

        h1 {
          margin: 0 0 20px;
          font-size: clamp(42px, 6vw, 64px);
          letter-spacing: -0.03em;
          color: #111827;
        }

        .sub {
          margin: 0 0 35px;
          font-size: clamp(18px, 2.2vw, 22px);
          color: #374151;
        }

        /* idea lab build effect */
        .build {
          display: inline-flex;
          gap: 12px;
          margin-left: 6px;
          font-weight: 600;
          color: #111827;
        }

        .word {
          display: inline-flex;
          gap: 6px;
          align-items: baseline;
        }

        .tile {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          background: #2563eb;
          transform: translateY(16px);
          opacity: 0;
          animation: place 0.6s ease forwards;
        }

        @keyframes place {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .t1 {
          animation-delay: 0.1s;
        }
        .t2 {
          animation-delay: 0.2s;
        }
        .t3 {
          animation-delay: 0.3s;
        }
        .t4 {
          animation-delay: 0.4s;
        }
        .t5 {
          animation-delay: 0.5s;
        }
        .t6 {
          animation-delay: 0.6s;
        }
        .t7 {
          animation-delay: 0.7s;
        }
        .t8 {
          animation-delay: 0.8s;
        }

        /* typing effect */
        .typing-container {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 15px;
          color: #2563eb;
          margin-top: 10px;
        }

        .cursor {
          display: inline-block;
          width: 2px;
          background: #2563eb;
          margin-left: 4px;
          animation: blink 1s infinite;
          height: 1em;
          vertical-align: bottom;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        /* footer */
        .footer {
          margin-top: 40px;
          font-size: 14px;
          color: #6b7280;
        }

        .idea-links {
          display: block;
          margin-top: 8px;
          color: #2563eb;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}
