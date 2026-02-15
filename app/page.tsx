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
          <di
