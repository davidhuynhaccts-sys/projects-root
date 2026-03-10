import type { Metadata } from "next";
import Link from "next/link";
import Nav from "./Nav";

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
  --mpls-accent-soft: #f5edd9;
  --mpls-link: #264d73;
  --mpls-max: 1160px;
  --mpls-radius: 18px;
  --mpls-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--mpls-bg);
  color: var(--mpls-text);
  font-family: Georgia, "Times New Roman", serif;
}

body {
  min-height: 100vh;
}

a {
  color: var(--mpls-link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.mpls-shell {
  min-height: 100vh;
}

.mpls-container {
  width: min(var(--mpls-max), calc(100% - 32px));
  margin: 0 auto;
}

.mpls-main {
  padding-bottom: 48px;
}

.mpls-hero {
  padding: 86px 0 70px;
  background:
    linear-gradient(180deg, rgba(31, 42, 68, 0.06) 0%, rgba(246, 247, 249, 0) 100%);
}

.mpls-eyebrow {
  margin: 0 0 14px;
  color: var(--mpls-secondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
}

.mpls-hero h1,
.mpls-section h1,
.mpls-section h2,
.mpls-card h3,
.mpls-card h2 {
  color: var(--mpls-primary);
  margin-top: 0;
}

.mpls-hero h1 {
  font-size: clamp(40px, 5.2vw, 84px);
  line-height: 0.98;
  max-width: 13ch;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.mpls-lead {
  font-size: 20px;
  line-height: 1.75;
  max-width: 760px;
  color: #5a6270;
  margin: 0;
}

.mpls-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.mpls-section {
  padding: 56px 0;
}

.mpls-section-alt {
  background: #eef1f5;
  border-top: 1px solid var(--mpls-border);
  border-bottom: 1px solid var(--mpls-border);
}

.mpls-section-header {
  margin-bottom: 26px;
}

.mpls-section-title {
  font-size: clamp(30px, 4vw, 44px);
  margin-bottom: 10px;
}

.mpls-section-subtitle {
  color: var(--mpls-muted);
  font-size: 18px;
  line-height: 1.7;
  max-width: 760px;
}

.mpls-grid-2,
.mpls-grid-3,
.mpls-grid-4 {
  display: grid;
  gap: 20px;
}

.mpls-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mpls-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mpls-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

.mpls-card {
  background: var(--mpls-surface);
  border: 1px solid var(--mpls-border);
  border-radius: var(--mpls-radius);
  padding: 24px;
  box-shadow: var(--mpls-shadow);
}

.mpls-card h2,
.mpls-card h3 {
  margin-bottom: 10px;
  font-size: 26px;
}

.mpls-card p,
.mpls-prose p,
.mpls-prose li,
.mpls-list li {
  color: var(--mpls-muted);
  line-height: 1.75;
  font-size: 17px;
}

.mpls-list {
  margin: 0;
  padding-left: 20px;
}

.mpls-prose {
  max-width: 820px;
}

.mpls-prose h1 {
  font-size: clamp(34px, 5vw, 56px);
  margin-bottom: 20px;
}

.mpls-prose h2 {
  font-size: 28px;
  margin-top: 34px;
  margin-bottom: 12px;
}

.mpls-highlight {
  border-left: 4px solid var(--mpls-accent);
  background: var(--mpls-accent-soft);
  padding: 18px 20px;
  border-radius: 12px;
  color: var(--mpls-primary);
}

.mpls-award-card {
  border-color: rgba(199, 154, 59, 0.45);
  background: linear-gradient(180deg, #fff 0%, #fcfaf4 100%);
}

.mpls-feature {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  align-items: stretch;
}

.mpls-feature-panel {
  background: var(--mpls-surface);
  border: 1px solid var(--mpls-border);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--mpls-shadow);
}

.mpls-kicker {
  font-family: Arial, Helvetica, sans-serif;
  color: var(--mpls-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  margin-bottom: 10px;
}

.mpls-feature-title {
  font-size: 32px;
  line-height: 1.15;
  margin-bottom: 12px;
  color: var(--mpls-primary);
}

.mpls-feature-copy {
  color: var(--mpls-muted);
  font-size: 17px;
  line-height: 1.7;
}

.mpls-footer {
  border-top: 1px solid var(--mpls-border);
  background: #edf1f5;
  padding: 42px 0;
  margin-top: 20px;
}

.mpls-footer-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 1fr;
  gap: 24px;
}

.mpls-footer h4 {
  margin: 0 0 14px;
  color: var(--mpls-primary);
  font-size: 18px;
}

.mpls-footer p,
.mpls-footer li,
.mpls-footer a {
  color: var(--mpls-muted);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 1.7;
}

.mpls-footer ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mpls-footer li {
  margin-bottom: 8px;
}

@media (max-width: 1080px) {
  .mpls-feature,
  .mpls-grid-4,
  .mpls-grid-3,
  .mpls-grid-2,
  .mpls-footer-grid {
    grid-template-columns: 1fr;
  }
}
`;

function Footer() {
  return (
    <footer className="mpls-footer">
      <div className="mpls-container mpls-footer-grid">
        <div>
          <h4>MPLS</h4>
          <p>
            A professional society dedicated to advancing the craft of modern
            project leadership.
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
              <Link href="https://projectsproject.com">Main site</Link>
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
        <div className="mpls-shell">
          <Nav />
          <main className="mpls-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
