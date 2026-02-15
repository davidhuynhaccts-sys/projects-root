"use client";

import { useMemo, useState } from "react";

export default function AmpersandHome() {
  const [email, setEmail] = useState("");

  const stats = useMemo(
    () => [
      { k: "1 in 2", v: "people will experience menopause (women, trans men, nonbinary people)." },
      { k: "7–10", v: "years is a common length for the menopause transition." },
      { k: "0 shame", v: "the amount we should accept around symptoms and treatment." }
    ],
    []
  );

  const resources = useMemo(
    () => [
      {
        title: "Start here: What’s happening to my body?",
        desc: "A plain-English overview of perimenopause, menopause, and postmenopause.",
        tag: "Guide"
      },
      {
        title: "Symptoms you’re not imagining",
        desc: "Sleep, mood, anxiety, joint pain, brain fog, hot flashes — and what helps.",
        tag: "Symptoms"
      },
      {
        title: "Treatment options (science-first)",
        desc: "Hormone therapy, non-hormonal options, lifestyle supports, and how to talk to a clinician.",
        tag: "Care"
      },
      {
        title: "For partners & friends",
        desc: "What to say, what not to say, and how to be steady when it’s hard.",
        tag: "Support"
      }
    ],
    []
  );

  const stories = useMemo(
    () => [
      {
        quote:
          "I thought I was failing at life. It was perimenopause. Naming it changed everything.",
        who: "Anonymous"
      },
      {
        quote:
          "The hardest part wasn’t the symptoms — it was feeling alone and uninformed.",
        who: "Anonymous"
      },
      {
        quote:
          "Support at work shouldn’t require a crisis. It should be normal.",
        who: "Anonymous"
      }
    ],
    []
  );

  return (
    <div className="page">
      <header className="nav">
        <div className="brand">
          <span className="mark" aria-hidden>
            &amp;
          </span>
          <div className="brandText">
            <div className="name">Ampersand</div>
            <div className="tag">Menopause Awareness & Support</div>
          </div>
        </div>

        <nav className="links">
          <a href="#mission">Mission</a>
          <a href="#resources">Resources</a>
          <a href="#workplace">Workplace</a>
          <a href="#stories">Stories</a>
        </nav>

        <div className="navCtas">
          <a className="btn ghost" href="#newsletter">
            Get updates
          </a>
          <a className="btn" href="#support">
            Donate
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="heroInner">
            <div className="heroCopy">
              <div className="pill">
                A movement for menopause — clear info, real support, no shame.
              </div>

              <h1>
                Menopause isn’t an ending.
                <br />
                It’s an <span className="em">and</span>.
              </h1>

              <p className="lead">
                Ampersand exists to normalize menopause, modernize information,
                and make support easier to find — at home, at work, and in
                healthcare.
              </p>

              <div className="heroCtas">
                <a className="btn big" href="#resources">
                  Find resources
                </a>
                <a className="btn big ghost" href="#workplace">
                  Workplace toolkit
                </a>
              </div>

              <div className="micro">
                Not medical advice. We help you get oriented and prepared for
                better conversations with clinicians.
              </div>
            </div>

            <div className="heroCard">
              <div className="heroCardTop">
                <div className="hcTitle">Quick self-check</div>
                <div className="hcSub">Common signs of perimenopause</div>
              </div>

              <ul className="checklist">
                <li>Sleep changes / night sweats</li>
                <li>Hot flashes</li>
                <li>Mood shifts, anxiety, irritability</li>
                <li>Brain fog / concentration issues</li>
                <li>Cycle changes (heavier, lighter, irregular)</li>
                <li>Joint pain, fatigue</li>
              </ul>

              <a className="miniLink" href="#resources">
                See what helps →
              </a>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section id="mission" className="section">
          <div className="sectionHead">
            <h2>Our mission</h2>
            <p>
              Menopause impacts health, relationships, confidence, and careers —
              yet people are left to piece it together alone. We’re changing
              that with education, community, and practical tools.
            </p>
          </div>

          <div className="cards3">
            <div className="card">
              <div className="icon" aria-hidden>
                ⟡
              </div>
              <h3>Normalize</h3>
              <p>
                Bring menopause into the open with language that’s honest,
                respectful, and non-sensational.
              </p>
            </div>

            <div className="card">
              <div className="icon" aria-hidden>
                ◎
              </div>
              <h3>Modernize</h3>
              <p>
                Make evidence-based options understandable — hormones, non-hormonal
                care, and lifestyle support.
              </p>
            </div>

            <div className="card">
              <div className="icon" aria-hidden>
                ✦
              </div>
              <h3>Support</h3>
              <p>
                Help partners, families, and workplaces show up better — with
                practical scripts and toolkits.
              </p>
            </div>
          </div>
        </section>

        {/* STATS BAND */}
        <section className="band">
          <div className="bandInner">
            {stats.map((s) => (
              <div className="stat" key={s.k}>
                <div className="k">{s.k}</div>
                <div className="v">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RESOURCES */}
        <section id="resources" className="section">
          <div className="sectionHead">
            <h2>Resources</h2>
            <p>
              Start with the basics, then go deeper. We’ll keep expanding these
              into full guides and printable checklists.
            </p>
          </div>

          <div className="resourceGrid">
            {resources.map((r) => (
              <a
                className="resource"
                href="#"
                onClick={(e) => e.preventDefault()}
                key={r.title}
              >
                <div className="tagChip">{r.tag}</div>
                <div className="rt">{r.title}</div>
                <div className="rd">{r.desc}</div>
                <div className="more">Coming soon →</div>
              </a>
            ))}
          </div>
        </section>

        {/* WORKPLACE */}
        <section id="workplace" className="section split">
          <div className="splitCopy">
            <h2>Menopause at work</h2>
            <p className="lead2">
              This shouldn’t be a hidden struggle. Teams do better when leaders
              and HR know what’s real, what’s helpful, and what language to use.
            </p>

            <ul className="bullets">
              <li>Simple accommodations that help (and cost little)</li>
              <li>Manager scripts for supportive 1:1 conversations</li>
              <li>Policy suggestions for modern workplaces</li>
              <li>Education for partners and teammates</li>
            </ul>

            <div className="heroCtas">
              <a className="btn big" href="#newsletter">
                Get the toolkit
              </a>
              <a className="btn big ghost" href="#support">
                Sponsor this work
              </a>
            </div>
          </div>

          <div className="splitPanel">
            <div className="panelCard">
              <div className="panelTitle">Workplace pledge</div>
              <div className="panelText">
                We commit to informed support, respectful language, and practical
                flexibility — because careers shouldn’t collapse during a normal
                life stage.
              </div>
              <a className="miniLink" href="#" onClick={(e) => e.preventDefault()}>
                Add your organization (coming soon) →
              </a>
            </div>
          </div>
        </section>

        {/* STORIES */}
        <section id="stories" className="section">
          <div className="sectionHead">
            <h2>Stories</h2>
            <p>
              When people name what’s happening, everything changes. We’ll
              publish stories that reduce shame and increase clarity.
            </p>
          </div>

          <div className="stories">
            {stories.map((s, idx) => (
              <div className="story" key={idx}>
                <div className="quote">“{s.quote}”</div>
                <div className="who">— {s.who}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORT / DONATE */}
        <section id="support" className="support">
          <div className="supportInner">
            <div>
              <h2>Help us build this</h2>
              <p className="supportP">
                Ampersand is building free guides, toolkits, and campaigns that
                make menopause easier to understand and easier to talk about.
              </p>
            </div>

            <div className="supportCtas">
              <a className="btn big" href="#" onClick={(e) => e.preventDefault()}>
                Donate (coming soon)
              </a>
              <a
                className="btn big ghost"
                href="#newsletter"
              >
                Join the newsletter
              </a>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section id="newsletter" className="section newsletter">
          <div className="newsletterCard">
            <h2>Get updates</h2>
            <p>
              Monthly, not spammy. New guides, workplace toolkit progress, and
              ways to help.
            </p>

            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Signup coming soon — wire this to Buttondown/Mailchimp/Substack next.");
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
              />
              <button className="btn" type="submit">
                Subscribe
              </button>
            </form>

            <div className="micro dim">
              We’ll add a real signup integration next (Buttondown, Mailchimp, Substack, etc.).
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footerInner">
          <div className="fBrand">
            <div className="mark small" aria-hidden>
              &amp;
            </div>
            <div>
              <div className="name">Ampersand</div>
              <div className="tag">Menopause Awareness & Support</div>
            </div>
          </div>

          <div className="fLinks">
            <a href="#mission">Mission</a>
            <a href="#resources">Resources</a>
            <a href="#workplace">Workplace</a>
            <a href="#stories">Stories</a>
          </div>

          <div className="fine">
            <div>© {new Date().getFullYear()} Ampersand</div>
            <div className="dim">ampersand.projectsproject.com</div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        :root {
  --bg: #fff6f9;
  --ink: #1b1b1f;
  --muted: rgba(27, 27, 31, 0.68);

  --brand: #d81b60; /* deep rose */
  --brand2: #6d28d9; /* plum */
  --brandSoft: rgba(216, 27, 96, 0.12);

  --card: rgba(255, 255, 255, 0.9);
  --border: rgba(27, 27, 31, 0.12);

  --shadow: 0 18px 50px rgba(27, 27, 31, 0.12);
        }

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: radial-gradient(900px 600px at 10% 10%, rgba(216, 27, 96, 0.12), transparent 60%),
            radial-gradient(800px 550px at 90% 20%, rgba(109, 40, 217, 0.10), transparent 55%),
            linear-gradient(180deg, var(--bg), #ffffff);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        /* NAV */
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(27, 27, 31, 0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 230px;
        }

        .mark {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(216, 27, 96, 0.22), rgba(109, 40, 217, 0.16));
          border: 1px solid rgba(216, 27, 96, 0.22);
          color: var(--brand);
          font-weight: 800;
          font-size: 22px;
          line-height: 1;
          user-select: none;
        }

        .mark.small {
          width: 34px;
          height: 34px;
          font-size: 20px;
        }

        .brandText .name {
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .brandText .tag {
          font-size: 12px;
          color: rgba(27, 27, 31, 0.62);
          margin-top: 2px;
        }

        .links {
          display: flex;
          gap: 14px;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .links a {
          text-decoration: none;
          color: rgba(27, 27, 31, 0.74);
          font-weight: 600;
          font-size: 13px;
        }
        .links a:hover {
          color: var(--ink);
        }

        .navCtas {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-end;
          min-width: 230px;
        }

        /* BUTTONS */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--brand), var(--brand2));
          color: white;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 10px 25px rgba(216, 27, 96, 0.18);
          transition: transform 0.08s ease, filter 0.12s ease;
          user-select: none;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }
        .btn.ghost {
          background: rgba(255, 255, 255, 0.75);
          color: rgba(27, 27, 31, 0.8);
          box-shadow: none;
          border: 1px solid rgba(27, 27, 31, 0.12);
        }
        .btn.big {
          height: 44px;
          padding: 0 16px;
          font-size: 14px;
        }

        /* HERO */
        .hero {
          padding: 46px 18px 22px;
        }
        .heroInner {
          width: min(1100px, calc(100% - 0px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 18px;
          align-items: stretch;
        }
        .heroCopy {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 22px;
          padding: 26px 22px;
          box-shadow: var(--shadow);
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(216, 27, 96, 0.10);
          border: 1px solid rgba(216, 27, 96, 0.18);
          color: rgba(27, 27, 31, 0.78);
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
        }
        h1 {
          margin: 14px 0 10px;
          font-size: clamp(38px, 4.6vw, 56px);
          letter-spacing: -0.03em;
          line-height: 1.06;
        }
        .em {
  color: var(--brand); /* fallback if gradient text isn’t supported */
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
        }
        .lead {
          margin: 0;
          color: rgba(27, 27, 31, 0.74);
          line-height: 1.6;
          font-size: 16px;
          max-width: 70ch;
        }
        .heroCtas {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }
        .micro {
          margin-top: 12px;
          font-size: 12px;
          color: rgba(27, 27, 31, 0.55);
        }

        .heroCard {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 22px;
          padding: 18px 16px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .heroCardTop {
          margin-bottom: 10px;
        }
        .hcTitle {
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .hcSub {
          margin-top: 4px;
          color: rgba(27, 27, 31, 0.62);
          font-size: 13px;
        }
        .checklist {
          margin: 10px 0 0;
          padding-left: 18px;
          color: rgba(27, 27, 31, 0.76);
          line-height: 1.7;
          font-size: 13px;
        }
        .miniLink {
          margin-top: 12px;
          color: rgba(216, 27, 96, 0.9);
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
        }
        .miniLink:hover {
          text-decoration: underline;
        }

        /* SECTIONS */
        .section {
          width: min(1100px, calc(100% - 36px));
          margin: 0 auto;
          padding: 26px 0;
        }
        .sectionHead h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.02em;
        }
        .sectionHead p {
          margin: 10px 0 0;
          color: rgba(27, 27, 31, 0.70);
          line-height: 1.65;
          max-width: 80ch;
        }

        .cards3 {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .card {
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 10px 30px rgba(27, 27, 31, 0.06);
        }
        .icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(216, 27, 96, 0.10);
          border: 1px solid rgba(216, 27, 96, 0.16);
          color: rgba(216, 27, 96, 0.95);
          font-weight: 900;
          margin-bottom: 10px;
        }
        .card h3 {
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }
        .card p {
          margin: 0;
          color: rgba(27, 27, 31, 0.72);
          line-height: 1.6;
        }

        /* BAND */
        .band {
          margin-top: 6px;
          background: linear-gradient(135deg, rgba(216, 27, 96, 0.10), rgba(109, 40, 217, 0.08));
          border-top: 1px solid rgba(27, 27, 31, 0.08);
          border-bottom: 1px solid rgba(27, 27, 31, 0.08);
        }
        .bandInner {
          width: min(1100px, calc(100% - 36px));
          margin: 0 auto;
          padding: 18px 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .stat {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 16px;
          padding: 14px 14px;
        }
        .k {
          font-weight: 900;
          font-size: 20px;
          letter-spacing: -0.02em;
        }
        .v {
          margin-top: 6px;
          color: rgba(27, 27, 31, 0.68);
          line-height: 1.5;
          font-size: 13px;
        }

        /* RESOURCES */
        .resourceGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .resource {
          text-decoration: none;
          color: inherit;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 10px 28px rgba(27, 27, 31, 0.06);
          transition: transform 0.08s ease, box-shadow 0.12s ease;
        }
        .resource:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 40px rgba(27, 27, 31, 0.10);
        }
        .tagChip {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 11px;
          color: rgba(27, 27, 31, 0.75);
          background: rgba(216, 27, 96, 0.10);
          border: 1px solid rgba(216, 27, 96, 0.16);
        }
        .rt {
          margin-top: 10px;
          font-weight: 900;
          letter-spacing: -0.01em;
        }
        .rd {
          margin-top: 6px;
          color: rgba(27, 27, 31, 0.70);
          line-height: 1.6;
          font-size: 13px;
        }
        .more {
          margin-top: 10px;
          font-weight: 900;
          color: rgba(216, 27, 96, 0.92);
          font-size: 13px;
        }

        /* SPLIT */
        .split {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 14px;
          align-items: stretch;
        }
        .lead2 {
          margin: 10px 0 0;
          color: rgba(27, 27, 31, 0.72);
          line-height: 1.65;
        }
        .bullets {
          margin: 12px 0 0;
          padding-left: 18px;
          color: rgba(27, 27, 31, 0.74);
          line-height: 1.8;
        }
        .splitPanel {
          display: grid;
          align-items: start;
        }
        .panelCard {
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 10px 28px rgba(27, 27, 31, 0.06);
        }
        .panelTitle {
          font-weight: 900;
          letter-spacing: -0.01em;
        }
        .panelText {
          margin-top: 8px;
          color: rgba(27, 27, 31, 0.70);
          line-height: 1.65;
          font-size: 13px;
        }

        /* STORIES */
        .stories {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .story {
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 18px;
          padding: 16px 16px;
          box-shadow: 0 10px 28px rgba(27, 27, 31, 0.06);
        }
        .quote {
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1.45;
        }
        .who {
          margin-top: 10px;
          color: rgba(27, 27, 31, 0.62);
          font-size: 12px;
          font-weight: 700;
        }

        /* SUPPORT */
        .support {
          margin-top: 10px;
          background: linear-gradient(135deg, rgba(216, 27, 96, 0.12), rgba(109, 40, 217, 0.10));
          border-top: 1px solid rgba(27, 27, 31, 0.08);
          border-bottom: 1px solid rgba(27, 27, 31, 0.08);
        }
        .supportInner {
          width: min(1100px, calc(100% - 36px));
          margin: 0 auto;
          padding: 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .supportP {
          margin: 10px 0 0;
          color: rgba(27, 27, 31, 0.70);
          line-height: 1.65;
          max-width: 70ch;
        }
        .supportCtas {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* NEWSLETTER */
        .newsletter {
          padding-bottom: 48px;
        }
        .newsletterCard {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(27, 27, 31, 0.10);
          border-radius: 20px;
          padding: 18px 16px;
          box-shadow: var(--shadow);
        }
        .newsletterCard p {
          margin: 10px 0 0;
          color: rgba(27, 27, 31, 0.70);
          line-height: 1.6;
        }
        .form {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        input {
          flex: 1;
          min-width: 220px;
          height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(27, 27, 31, 0.14);
          padding: 0 14px;
          outline: none;
          background: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }
        input:focus {
          border-color: rgba(216, 27, 96, 0.35);
          box-shadow: 0 0 0 4px rgba(216, 27, 96, 0.10);
        }

        /* FOOTER */
        .footer {
          padding: 22px 18px 30px;
          border-top: 1px solid rgba(27, 27, 31, 0.08);
          background: rgba(255, 255, 255, 0.45);
        }
        .footerInner {
          width: min(1100px, calc(100% - 0px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          align-items: start;
        }
        .fBrand {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .fLinks {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }
        .fLinks a {
          text-decoration: none;
          color: rgba(27, 27, 31, 0.70);
          font-weight: 700;
          font-size: 13px;
        }
        .fLinks a:hover {
          color: rgba(27, 27, 31, 0.88);
        }
        .fine {
          display: grid;
          justify-items: end;
          color: rgba(27, 27, 31, 0.62);
          font-size: 12px;
          gap: 4px;
        }

        .dim {
          opacity: 0.7;
        }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .heroInner {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 900px) {
          .cards3 {
            grid-template-columns: 1fr;
          }
          .bandInner {
            grid-template-columns: 1fr;
          }
          .resourceGrid {
            grid-template-columns: 1fr;
          }
          .split {
            grid-template-columns: 1fr;
          }
          .stories {
            grid-template-columns: 1fr;
          }
          .links {
            display: none;
          }
          .footerInner {
            grid-template-columns: 1fr;
            justify-items: start;
          }
          .fine {
            justify-items: start;
          }
          .fLinks {
            justify-content: flex-start;
          }
          .brand,
          .navCtas {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
