import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MPLS | Modern Project Leadership Society",
  description:
    "A professional society dedicated to advancing the craft of modern project leadership through practical insight, recognition, and community.",
};

const styles = `
:root {
  --mpls-bg: #f6f7f9;
  --mpls-surface: #ffffff;
  --mpls-text: #1f2937;
  --mpls-muted: #5b6472;
  --mpls-border: #d8dde6;
  --mpls-primary: #1f2a44;
  --mpls-secondary: #3e5c76;
  --mpls-accent: #c79a3b;
  --mpls-link: #264d73;
  --mpls-max: 1160px;
  --mpls-radius: 18px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--mpls-bg);
  color: var(--mpls-text);
  font-family: Georgia, "Times New Roman", serif;
}

a {
  color: var(--mpls-link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.mpls-container {
  width: min(var(--mpls-max), calc(100% - 32px));
  margin: 0 auto;
}

.mpls-topbar {
  position: sticky;
  top: 0;
  background: rgba(246,247,249,0.95);
  border-bottom: 1px solid var(--mpls-border);
}

.mpls-topbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 70px;
}

.mpls-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  color: var(--mpls-primary);
}

.mpls-brand-mark {
  width: 44px;
  height: 44px;
  border: 1px solid var(--mpls-primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.mpls-brand-title {
  font-size: 18px;
  font-weight: 700;
}

.mpls-brand-subtitle {
  font-size: 12px;
  color: var(--mpls-muted);
}

.mpls-nav {
  display: flex;
  gap: 18px;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

.mpls-actions {
  display: flex;
  gap: 10px;
}

.mpls-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--mpls-primary);
  font-size: 14px;
}

.mpls-btn-primary {
  background: var(--mpls-primary);
  color: white;
}

.mpls-btn-secondary {
  background: white;
  color: var(--mpls-primary);
}

.mpls-dropdown {
  position: relative;
}

.mpls-dropdown-menu {
  position: absolute;
  top: 26px;
  left: 0;
  background: white;
  border: 1px solid var(--mpls-border);
  border-radius: 10px;
  display: none;
  flex-direction: column;
  min-width: 180px;
  padding: 6px 0;
}

.mpls-dropdown-menu a {
  padding: 8px 16px;
}

.mpls-dropdown:hover .mpls-dropdown-menu {
  display: flex;
}

.mpls-main {
  padding: 40px 0;
}

.mpls-footer {
  border-top: 1px solid var(--mpls-border);
  padding: 40px 0;
  background: #eef1f5;
}

.mpls-footer-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 20px;
}

.mpls-footer h4 {
  margin-bottom: 10px;
}

.mpls-footer ul {
  list-style: none;
  padding: 0;
}

.mpls-footer li {
  margin-bottom: 6px;
}
`;

function Nav() {
  return (
    <header className="mpls-topbar">
      <div className="mpls-container mpls-topbar-inner">
        <Link href="/" className="mpls-brand">
          <span className="mpls-brand-mark">MPLS</span>
          <span>
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

          <div className="mpls-dropdown">
            <span>About</span>
            <div className="mpls-dropdown-menu">
              <Link href="/about">About MPLS</Link>
              <Link href="/governance">Governance</Link>
              <Link href="/leadership">Leadership</Link>
            </div>
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

function Footer() {
  return (
    <footer className="mpls-footer">
      <div className="mpls-container mpls-footer-grid">
        <div>
          <h4>MPLS</h4>
          <p>
            A professional society advancing the craft of modern project
            leadership.
          </p>
        </div>

        <div>
          <h4>About</h4>
          <ul>
            <li><Link href="/about">About MPLS</Link></li>
            <li><Link href="/governance">Governance</Link></li>
            <li><Link href="/leadership">Leadership</Link></li>
          </ul>
        </div>

        <div>
          <h4>Programs</h4>
          <ul>
            <li><Link href="/insights">Insights</Link></li>
            <li><Link href="/awards">Awards</Link></li>
            <li><Link href="/events">Events</Link></li>
          </ul>
        </div>

        <div>
          <h4>ProjectsProject</h4>
          <ul>
            <li>
              <Link href="https://projectsproject.com">
                Main Site
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default function MplsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <style>{styles}</style>

        <Nav />

        <main className="mpls-main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
