"use client";

import { useMemo, useState } from "react";

type Link = { label: string; href: string };
type Card = { title: string; desc: string; href?: string; tag?: string };
type Story = { quote: string; who: string; role?: string };

export default function AmpersandHome() {
  // Sanity-ready content model (replace this with Sanity fetch soon)
  const content = useMemo(() => {
    return {
      nav: [
        { label: "Mission", href: "#mission" },
        { label: "Programs", href: "#programs" },
        { label: "Resources", href: "#resources" },
        { label: "Stories", href: "#stories" },
        { label: "Workplace", href: "#workplace" }
      ] as Link[],
      hero: {
        eyebrow: "Menopause awareness & support",
        headlineLine1: "Menopause isn’t an ending.",
        headlineLine2: "It’s an and.",
        lead:
          "aMpersand exists to normalize menopause, modernize information, and make support easier to find — at home, at work, and in healthcare.",
        primaryCta: { label: "Get support", href: "#resources" },
        secondaryCta: { label: "For workplaces", href: "#workplace" }
      },
      impact: [
        {
          k: "Clarity",
          v: "Plain-English guides that replace misinformation and shame."
        },
        { k: "Support", v: "Tools for partners, families, and workplaces." },
        { k: "Access", v: "Navigation help for talking with clinicians." }
      ],
      programs: [
        {
          tag: "Start here",
          title: "The Menopause Map",
          desc: "A simple overview of perimenopause → menopause → postmenopause, with practical next steps."
        },
        {
          tag: "Support",
          title: "Partner & Family Scripts",
          desc: "What to say, what not to say, and how to be steady when emotions and sleep are changing."
        },
        {
          tag: "Workplace",
          title: "Workplace Toolkit",
          desc: "Manager & HR guidance: language, accommodations, and culture that actually helps."
        }
      ] as Card[],
      resources: [
        {
          tag: "Symptoms",
          title: "Symptoms you’re not imagining",
          desc: "Sleep, anxiety, brain fog, hot flashes, joint pain — what’s common and what helps."
        },
        {
          tag: "Treatment",
          title: "Treatment options (science-first)",
          desc: "Hormone therapy, non-hormonal options, lifestyle supports, and questions to ask."
        },
        {
          tag: "Care",
          title: "How to talk to a clinician",
          desc: "Prepare for appointments with language that gets you taken seriously."
        },
        {
          tag: "Work",
          title: "Menopause at work",
          desc: "A practical guide to accommodations and supportive conversations."
        }
      ] as Card[],
      stories: [
        {
          quote:
            "I thought I was failing at life. Naming perimenopause changed everything.",
          who: "Anonymous",
          role: "Community story"
        },
        {
          quote:
            "The hardest part wasn’t symptoms — it was feeling alone and uninformed.",
          who: "Anonymous",
          role: "Community story"
        },
        {
          quote:
            "Support at work shouldn’t require a crisis. It should be normal.",
          who: "Anonymous",
          role: "Workplace perspective"
        }
      ] as Story[],
      workplace: {
        title: "Menopause at work",
        lead:
          "Workplaces can be a force multiplier for well-being. This toolkit helps leaders support employees without stigma or awkwardness.",
        bullets: [
          "Low-cost accommodations that help immediately",
          "Manager scripts for supportive 1:1 conversations",
          "Policy guidance that’s modern and practical",
          "Training outline for leaders and HR"
        ],
        cta: { label: "Get the toolkit", href: "#newsletter" }
      },
      donateBand: {
        title: "Help build aMpersand",
        lead:
          "We’re building free guides, toolkits, and campaigns that make menopause easier to understand and easier to talk about.",
        primary: { label: "Donate", href: "#donate" },
        secondary: { label: "Volunteer", href: "#newsletter" }
      },
      newsletter: {
        title: "Get updates",
        lead:
          "Monthly, not spammy. Guides, workplace toolkit progress, and ways to help.",
        placeholder: "you@example.com",
        button: "Subscribe"
      }
    };
  }, []);

  const [email, setEmail] = useState("");

  const Wordmark = () => (
    <span className="wordmark" aria-label="aMpersand">
      <span className="a">a</span>
      <span className="mScript">M</span>
      <span className="rest">persand</span>
    </span>
  );

  return (
    <div className="page">
      {/* Top bar */}
      <header className="header">
        <div className="brand">
          <a className="brandLink" href="#top">
            <Wordmark />
            <span className="brandTag">Menopause awareness & support</span>
          </a>
        </div>

        <nav className="nav">
          {content.nav.map((l) => (
            <a key={l.href} href={l.href} className="navLink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="headerCtas">
          <a className="btn ghost" href="#newsletter">
            Get updates
          </a>
          <a className="btn" href="#donate">
            Donate
          </a>
        </div>
      </header>

      {/* Hero */}
      <main id="top">
        <section className="hero">
          <div className="heroInner">
            <div className="heroCopy">
              <div className="eyebrow">
                <span className="dot" aria-hidden />
                {content.hero.eyebrow}
              </div>

              <h1 className="heroH1">
                {content.hero.headlineLine1}
                <br />
                {content.hero.headlineLine2}
              </h1>

              <p className="heroLead">{content.hero.lead}</p>

              <div className="heroCtas">
                <a className="btn big" href={content.hero.primaryCta.href}>
                  {content.hero.primaryCta.label}
                </a>
                <a
                  className="btn big ghost"
                  href={content.hero.secondaryCta.href}
                >
                  {content.hero.secondaryCta.label}
                </a>
              </div>

              <p className="disclaimer">
                Not medical advice. We help you get oriented and prepared for
                better conversations with clinicians.
              </p>
            </div>

            <div className="heroPanel" aria-label="Quick help panel">
              <div className="panelTop">
                <div className="panelTitle">Quick start</div>
                <div className="panelSub">
                  If you’re thinking “is this menopause?” you’re not alone.
                </div>
              </div>

              <div className="panelList">
                <div className="pillItem">Sleep changes / night sweats</div>
                <div className="pillItem">Hot flashes</div>
                <div className="pillItem">Mood shifts & anxiety</div>
                <div className="pillItem">Brain fog</div>
                <div className="pillItem">Cycle changes</div>
                <div className="pillItem">Joint pain / fatigue</div>
              </div>

              <div className="panelCtas">
                <a className="mini" href="#resources">
                  Explore resources →
                </a>
              </div>
            </div>
          </div>

          {/* Impact strip */}
          <div className="impactStrip" id="mission">
            <div className="impactInner">
              {content.impact.map((i) => (
                <div key={i.k} className="impactItem">
                  <div className="impactK">{i.k}</div>
                  <div className="impactV">{i.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="section" id="programs">
          <div className="sectionHead">
            <h2>What we’re building</h2>
            <p>
              Designed for real life — quick clarity when you need it, deeper
              support when you’re ready.
            </p>
          </div>

          <div className="grid3">
            {content.programs.map((c) => (
              <a
                key={c.title}
                className="card"
                href={c.href || "#newsletter"}
                onClick={(e) => {
                  if (!c.href) e.preventDefault();
                }}
              >
                <div className="tag">{c.tag}</div>
                <div className="cardTitle">{c.title}</div>
                <div className="cardDesc">{c.desc}</div>
                <div className="cardMore">Learn more →</div>
              </a>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="section alt" id="resources">
          <div className="sectionHead">
            <h2>Resources</h2>
            <p>
              We’ll publish these as clear, printable guides. For now, the
              structure is here — ready for Sanity-backed content.
            </p>
          </div>

          <div className="grid2">
            {content.resources.map((r) => (
              <a
                key={r.title}
                className="resource"
                href={r.href || "#newsletter"}
                onClick={(e) => {
                  if (!r.href) e.preventDefault();
                }}
              >
                <div className="resourceTop">
                  <div className="tag soft">{r.tag}</div>
                </div>
                <div className="resourceTitle">{r.title}</div>
                <div className="resourceDesc">{r.desc}</div>
                <div className="resourceMore">Open →</div>
              </a>
            ))}
          </div>
        </section>

        {/* Workplace */}
        <section className="section" id="workplace">
          <div className="split">
            <div className="splitCopy">
              <h2>{content.workplace.title}</h2>
              <p className="lead2">{content.workplace.lead}</p>
              <ul className="bullets">
                {content.workplace.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className="splitCtas">
                <a className="btn big" href={content.workplace.cta.href}>
                  {content.workplace.cta.label}
                </a>
                <a className="btn big ghost" href="#donate">
                  Sponsor this work
                </a>
              </div>
            </div>

            <div className="splitPanel">
              <div className="panelCard">
                <div className="panelCardTitle">Why the “M” changes</div>
                <p className="panelCardText">
                  We style the <strong>“M”</strong> differently to reflect a
                  simple truth: everyone experiences menopause differently. The
                  goal is not one-size-fits-all advice — it’s clarity, options,
                  and support that meet people where they are.
                </p>
                <div className="wordmarkDemo">
                  <Wordmark /> <span className="demoDim">looks different — on purpose</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stories */}
        <section className="section alt" id="stories">
          <div className="sectionHead">
            <h2>Stories</h2>
            <p>
              Stories reduce shame and increase clarity. We’ll publish
              community-led stories as a core part of the movement.
            </p>
          </div>

          <div className="stories">
            {content.stories.map((s, idx) => (
              <div className="story" key={idx}>
                <div className="quote">“{s.quote}”</div>
                <div className="who">
                  — {s.who}
                  {s.role ? <span className="role"> · {s.role}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Donate band */}
        <section className="donateBand" id="donate">
          <div className="donateInner">
            <div>
              <h2>{content.donateBand.title}</h2>
              <p>{content.donateBand.lead}</p>
            </div>
            <div className="donateCtas">
              <a className="btn big" href={content.donateBand.primary.href}>
                {content.donateBand.primary.label}
              </a>
              <a
                className="btn big ghost"
                href={content.donateBand.secondary.href}
              >
                {content.donateBand.secondary.label}
              </a>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="section" id="newsletter">
          <div className="newsletter">
            <div className="newsletterCopy">
              <h2>{content.newsletter.title}</h2>
              <p>{content.newsletter.lead}</p>
              <p className="note">
                Sanity-ready: this block will become a CMS-managed CTA module.
              </p>
            </div>

            <form
              className="newsletterForm"
              onSubmit={(e) => {
                e.preventDefault();
                // placeholder until you wire Sanity + a provider
                alert("Newsletter hookup coming soon (Buttondown/Mailchimp/etc.)");
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={content.newsletter.placeholder}
                type="email"
                required
                aria-label="Email address"
              />
              <button className="btn" type="submit">
                {content.newsletter.button}
              </button>
            </form>
          </div>
        </section>

        <footer className="footer">
          <div className="footerInner">
            <div className="footerBrand">
              <Wordmark />
              <div className="footerTag">Menopause awareness & support</div>
            </div>

            <div className="footerLinks">
              {content.nav.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>

            <div className="footerFine">
              <div>© {new Date().getFullYear()} aMpersand</div>
              <div className="fineDim">ampersand.projectsproject.com</div>
            </div>
          </div>
        </footer>
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        /* Brand colors (keep here for now; later move to global styles or CMS theme) */
        :global(:root) {
          --ink: #0f172a;
          --bg: #ffffff;
          --muted: rgba(15, 23, 42, 0.72);

          /* Livestrong-ish: bright, optimistic, high-contrast */
          --primary: #111827; /* near-black */
          --accent: #f59e0b; /* warm gold */
          --accent2: #7c3aed; /* violet */
          --accentSoft: rgba(245, 158, 11, 0.14);

          --card: rgba(255, 255, 255, 0.96);
          --border: rgba(15, 23, 42, 0.10);
          --shadow: 0 18px 55px rgba(15, 23, 42, 0.10);
        }

        .page {
          min-height: 100vh;
          background: radial-gradient(
              900px 600px at 15% 10%,
              rgba(245, 158, 11, 0.16),
              transparent 60%
            ),
            radial-gradient(
              800px 600px at 85% 12%,
              rgba(124, 58, 237, 0.10),
              transparent 60%
            ),
            linear-gradient(180deg, #ffffff, #fbfbfb);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial;
        }

        /* Header */
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.80);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .brandLink {
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          text-decoration: none;
          color: inherit;
        }

        .brandTag {
          font-size: 12px;
          color: rgba(15, 23, 42, 0.60);
          letter-spacing: 0.02em;
        }

        /* Wordmark: aMpersand */
        .wordmark {
          display: inline-flex;
          align-items: baseline;
          gap: 0px;
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
          font-size: 20px;
        }
        .wordmark .a,
        .wordmark .rest {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial;
          font-weight: 900;
        }
        .wordmark .mScript {
          margin: 0 1px;
          font-family: "Brush Script MT", "Segoe Script", "Snell Roundhand",
            "Apple Chancery", cursive;
          font-weight: 900;
          font-size: 1.2em;
          color: var(--accent2);
          text-shadow: 0 6px 18px rgba(124, 58, 237, 0.18);
        }

        .nav {
          display: flex;
          gap: 14px;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .navLink {
          text-decoration: none;
          color: rgba(15, 23, 42, 0.70);
          font-weight: 700;
          font-size: 13px;
        }
        .navLink:hover {
          color: rgba(15, 23, 42, 0.92);
        }

        .headerCtas {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--primary), #000000);
          color: white;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
          transition: transform 0.08s ease, filter 0.12s ease;
          user-select: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
        }
        .btn.ghost {
          background: rgba(255, 255, 255, 0.88);
          color: rgba(15, 23, 42, 0.86);
          box-shadow: none;
          border: 1px solid rgba(15, 23, 42, 0.14);
        }
        .btn.big {
          height: 46px;
          padding: 0 16px;
          font-size: 14px;
        }

        /* Hero */
        .hero {
          padding: 42px 18px 0;
        }
        .heroInner {
          width: min(1120px, calc(100% - 0px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 16px;
          align-items: stretch;
        }
        .heroCopy {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 26px 22px;
          box-shadow: var(--shadow);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.68);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 10px 26px rgba(245, 158, 11, 0.22);
        }
        .heroH1 {
          margin: 14px 0 10px;
          font-size: clamp(38px, 4.8vw, 58px);
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: rgba(15, 23, 42, 0.98);
        }
        .heroLead {
          margin: 0;
          color: rgba(15, 23, 42, 0.74);
          line-height: 1.7;
          font-size: 16px;
          max-width: 75ch;
        }
        .heroCtas {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }
        .disclaimer {
          margin-top: 12px;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.55);
        }

        .heroPanel {
          background: rgba(15, 23, 42, 0.92);
          border-radius: 22px;
          padding: 18px 16px;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.20);
          color: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .panelTitle {
          font-weight: 900;
          letter-spacing: -0.02em;
          font-size: 14px;
        }
        .panelSub {
          margin-top: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.5;
        }
        .panelList {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }
        .pillItem {
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.86);
        }
        .panelCtas {
          margin-top: 14px;
        }
        .mini {
          color: rgba(255, 255, 255, 0.90);
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
        }
        .mini:hover {
          text-decoration: underline;
        }

        /* Impact strip */
        .impactStrip {
          margin-top: 16px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.64);
        }
        .impactInner {
          width: min(1120px, calc(100% - 36px));
          margin: 0 auto;
          padding: 14px 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .impactItem {
          padding: 12px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(15, 23, 42, 0.10);
        }
        .impactK {
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .impactV {
          margin-top: 6px;
          color: rgba(15, 23, 42, 0.70);
          line-height: 1.5;
          font-size: 13px;
        }

        /* Sections */
        .section {
          width: min(1120px, calc(100% - 36px));
          margin: 0 auto;
          padding: 28px 0;
        }
        .section.alt {
          padding: 32px 0;
        }
        .sectionHead h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.02em;
        }
        .sectionHead p {
          margin: 10px 0 0;
          color: rgba(15, 23, 42, 0.70);
          line-height: 1.65;
          max-width: 85ch;
        }

        .grid3 {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .card {
          text-decoration: none;
          color: inherit;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(15, 23, 42, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
          transition: transform 0.08s ease, box-shadow 0.12s ease;
        }
        .card:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.12);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          padding: 0 10px;
          border-radius: 999px;
          background: var(--accentSoft);
          border: 1px solid rgba(245, 158, 11, 0.26);
          color: rgba(15, 23, 42, 0.78);
          font-weight: 900;
          font-size: 11px;
          letter-spacing: 0.02em;
        }
        .tag.soft {
          background: rgba(124, 58, 237, 0.10);
          border: 1px solid rgba(124, 58, 237, 0.18);
        }

        .cardTitle {
          margin-top: 10px;
          font-weight: 900;
          letter-spacing: -0.01em;
          font-size: 16px;
        }
        .cardDesc {
          margin-top: 8px;
          color: rgba(15, 23, 42, 0.70);
          line-height: 1.6;
          font-size: 13px;
        }
        .cardMore {
          margin-top: 12px;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.90);
          font-size: 13px;
        }

        .alt {
          background: rgba(15, 23, 42, 0.03);
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .grid2 {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .resource {
          text-decoration: none;
          color: inherit;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(15, 23, 42, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
          transition: transform 0.08s ease, box-shadow 0.12s ease;
        }
        .resource:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.12);
        }
        .resourceTitle {
          margin-top: 10px;
          font-weight: 900;
          letter-spacing: -0.01em;
          font-size: 16px;
        }
        .resourceDesc {
          margin-top: 8px;
          color: rgba(15, 23, 42, 0.70);
          line-height: 1.6;
          font-size: 13px;
        }
        .resourceMore {
          margin-top: 12px;
          font-weight: 900;
          color: rgba(124, 58, 237, 0.92);
          font-size: 13px;
        }

        /* Split section */
        .split {
          margin-top: 6px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 14px;
          align-items: start;
        }
        .lead2 {
          margin: 10px 0 0;
          color: rgba(15, 23, 42, 0.70);
          line-height: 1.7;
        }
        .bullets {
          margin: 12px 0 0;
          padding-left: 18px;
          color: rgba(15, 23, 42, 0.76);
          line-height: 1.85;
        }
        .splitCtas {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .panelCard {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(15, 23, 42, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
        }
        .panelCardTitle {
          font-weight: 900;
          letter-spacing: -0.01em;
        }
        .panelCardText {
          margin: 10px 0 0;
          color: rgba(15, 23, 42, 0.72);
          line-height: 1.65;
          font-size: 13px;
        }
        .wordmarkDemo {
          margin-top: 12px;
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(245, 158, 11, 0.10);
          border: 1px solid rgba(245, 158, 11, 0.18);
        }
        .demoDim {
          color: rgba(15, 23, 42, 0.64);
          font-size: 12px;
          font-weight: 700;
        }

        /* Stories */
        .stories {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .story {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(15, 23, 42, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
        }
        .quote {
          font-weight: 900;
          letter-spacing: -0.01em;
          line-height: 1.45;
        }
        .who {
          margin-top: 10px;
          color: rgba(15, 23, 42, 0.62);
          font-size: 12px;
          font-weight: 800;
        }
        .role {
          font-weight: 700;
          opacity: 0.75;
        }

        /* Donate band */
        .donateBand {
          margin-top: 6px;
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.92),
            rgba(0, 0, 0, 0.92)
          );
          color: rgba(255, 255, 255, 0.92);
          border-top: 1px solid rgba(255, 255, 255, 0.10);
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
        }
        .donateInner {
          width: min(1120px, calc(100% - 36px));
          margin: 0 auto;
          padding: 22px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .donateInner h2 {
          margin: 0;
          letter-spacing: -0.02em;
          color: white;
        }
        .donateInner p {
          margin: 10px 0 0;
          color: rgba(255, 255, 255, 0.74);
          max-width: 70ch;
          line-height: 1.6;
        }
        .donateCtas {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Newsletter */
        .newsletter {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          align-items: center;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(15, 23, 42, 0.10);
          border-radius: 22px;
          padding: 18px 16px;
          box-shadow: var(--shadow);
        }
        .newsletter p {
          margin: 10px 0 0;
          color: rgba(15, 23, 42, 0.70);
          line-height: 1.6;
        }
        .note {
          margin-top: 10px;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.55);
        }
        .newsletterForm {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        input {
          flex: 1;
          min-width: 220px;
          height: 46px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          padding: 0 14px;
          outline: none;
          background: rgba(255, 255, 255, 0.98);
          font-size: 14px;
        }
        input:focus {
          border-color: rgba(245, 158, 11, 0.55);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.14);
        }

        /* Footer */
        .footer {
          padding: 26px 18px 34px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.70);
        }
        .footerInner {
          width: min(1120px, calc(100% - 0px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          align-items: start;
        }
        .footerTag {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.62);
        }
        .footerLinks {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }
        .footerLinks a {
          text-decoration: none;
          color: rgba(15, 23, 42, 0.72);
          font-weight: 800;
          font-size: 13px;
        }
        .footerLinks a:hover {
          color: rgba(15, 23, 42, 0.92);
        }
        .footerFine {
          display: grid;
          justify-items: end;
          gap: 4px;
          color: rgba(15, 23, 42, 0.62);
          font-size: 12px;
          font-weight: 700;
        }
        .fineDim {
          opacity: 0.75;
        }

        /* Responsive */
        @media (max-width: 980px) {
          .heroInner {
            grid-template-columns: 1fr;
          }
          .impactInner {
            grid-template-columns: 1fr;
          }
          .grid3 {
            grid-template-columns: 1fr;
          }
          .grid2 {
            grid-template-columns: 1fr;
          }
          .split {
            grid-template-columns: 1fr;
          }
          .stories {
            grid-template-columns: 1fr;
          }
          .newsletter {
            grid-template-columns: 1fr;
          }
          .nav {
            display: none;
          }
          .footerInner {
            grid-template-columns: 1fr;
          }
          .footerLinks {
            justify-content: flex-start;
          }
          .footerFine {
            justify-items: start;
          }
        }
      `}</style>
    </div>
  );
}
