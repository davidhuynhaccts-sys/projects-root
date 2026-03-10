"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navStyles = `
.mpls-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(246, 247, 249, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--mpls-border);
}

.mpls-topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 76px;
  padding: 10px 0;
}

.mpls-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--mpls-primary);
  text-decoration: none;
  min-width: 0;
  flex-shrink: 0;
}

.mpls-brand:hover {
  text-decoration: none;
}

.mpls-brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--mpls-primary);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-family: Arial, Helvetica, sans-serif;
  background: var(--mpls-surface);
  flex: 0 0 auto;
}

.mpls-brand-copy {
  min-width: 0;
}

.mpls-brand-title {
  font-size: 18px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--mpls-primary);
}

.mpls-brand-subtitle {
  font-size: 12px;
  color: var(--mpls-muted);
  font-family: Arial, Helvetica, sans-serif;
  margin-top: 3px;
}

.mpls-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  justify-content: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

.mpls-nav > a,
.mpls-dropdown-trigger {
  color: var(--mpls-primary);
  display: inline-flex;
  align-items: center;
  height: 40px;
  font-weight: 500;
}

.mpls-nav > a:hover,
.mpls-dropdown-trigger:hover {
  text-decoration: underline;
}

.mpls-dropdown {
  position: relative;
}

.mpls-dropdown-trigger {
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  gap: 6px;
}

.mpls-dropdown-caret {
  font-size: 11px;
  color: var(--mpls-secondary);
  transform: translateY(1px);
}

.mpls-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 220px;
  background: var(--mpls-surface);
  border: 1px solid var(--mpls-border);
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.10);
  padding: 8px 0;
  z-index: 200;
}

.mpls-dropdown-menu a {
  display: block;
  padding: 10px 14px;
  white-space: nowrap;
  color: var(--mpls-primary);
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
}

.mpls-dropdown-menu a:hover {
  background: #f3f5f8;
  text-decoration: none;
}

.mpls-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.mpls-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 11px 16px;
  border: 1px solid var(--mpls-primary);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s ease;
}

.mpls-btn:hover {
  text-decoration: none;
  transform: translateY(-1px);
}

.mpls-btn-primary {
  background: var(--mpls-primary);
  color: white;
}

.mpls-btn-secondary {
  background: var(--mpls-surface);
  color: var(--mpls-primary);
}

@media (max-width: 1080px) {
  .mpls-topbar-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .mpls-nav,
  .mpls-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .mpls-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: auto;
  }
}
`;

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

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAboutOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeMenu() {
    setAboutOpen(false);
  }

  return (
    <>
      <style>{navStyles}</style>

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
                type="button"
                className="mpls-dropdown-trigger"
                aria-expanded={aboutOpen}
                aria-haspopup="menu"
                onClick={() => setAboutOpen((open) => !open)}
              >
                About
                <span className="mpls-dropdown-caret">▾</span>
              </button>

              {aboutOpen && (
                <div className="mpls-dropdown-menu" role="menu">
                  <Link href="/about" role="menuitem" onClick={closeMenu}>
                    About MPLS
                  </Link>
                  <Link href="/governance" role="menuitem" onClick={closeMenu}>
                    Governance
                  </Link>
                  <Link href="/leadership" role="menuitem" onClick={closeMenu}>
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
    </>
  );
}
