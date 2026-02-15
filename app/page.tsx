"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const fullText =
    "Shipping small experiments. Learning fast. Keeping the good ones.";

  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#181818",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        color: "white"
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "0.5rem"
        }}
      >
        The Projects Project
      </h1>

      <h2
        style={{
          fontWeight: 300,
          marginBottom: "2rem",
          opacity: 0.8
        }}
      >
        A structured idea lab.
      </h2>

      <div
        style={{
          background: "white",
          color: "#111",
          padding: "1.5rem 2rem",
          borderRadius: "8px",
          fontSize: "1rem",
          fontFamily: "monospace",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {displayText}
        <span
          style={{
            marginLeft: "4px",
            animation: "blink 1s infinite"
          }}
        >
          |
        </span>
      </div>

      <style jsx>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
