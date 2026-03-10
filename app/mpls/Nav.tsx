"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAboutOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeMenu() {
    setAboutOpen(false);
  }

  return (
    <header className="mpls-topbar">
      <div className="mpls-container mpls-topbar-inner">
        <Link href="/" className="mpls-brand">
          <span className="mpls-brand-mark">MPLS</span>
          <span className="mpls-brand-copy">
            <div className="mpls-brand-title">
              Modern Project Leadership Society
            </div>
            <div className="mpls-brand-subtitle">
              Practical leadership for complex work
            </div>
          </span>
        </Link>

        <nav className="mpls-nav">
          <Link href="/">Home</Link>

          <div className="mpls-dropdown" ref={dropdownRef}>
            <button
              className="mpls-dropdown-trigger"
              onClick={() => setAboutOpen(!aboutOpen)}
            >
              About ▾
            </button>

            {aboutOpen && (
              <div className="mpls-dropdown-menu">
                <Link href="/about" onClick={closeMenu}>
                  About MPLS
                </Link>
                <Link href="/governance" onClick={closeMenu}>
                  Governance
                </Link>
                <Link href="/leadership" onClick={closeMenu}>
                  Leadership
                </Link>
              </div>
            )}
          </div>

          <Link href="/membership">Membership</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/awards">Awards</Link>
          <Link href="/events">Events</Link>
          <Link href="/partners">Partners</Link>
        </nav>

        <div className="mpls-actions">
          <Link href="/membership" className="mpls-btn mpls-btn-secondary">
            Join MPLS
          </Link>
          <Link href="/awards" className="mpls-btn mpls-btn-primary">
            Nominate
          </Link>
        </div>
      </div>
    </header>
  );
}
