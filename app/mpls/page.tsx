import Link from "next/link";

export default function MplsHomePage() {
  return (
    <>
      <section className="mpls-hero">
        <div className="mpls-container">
          <p className="mpls-eyebrow">Modern Project Leadership Society</p>
          <h1>Modern Project Leadership for the Real World</h1>
          <p className="mpls-lead">
            MPLS is a professional society for project leaders, PMO directors,
            delivery executives, and practitioners who care about the real work
            of guiding complex initiatives to meaningful outcomes.
          </p>

          <div className="mpls-hero-actions">
            <Link href="/mpls/membership" className="mpls-btn mpls-btn-primary">
              Join MPLS
            </Link>
            <Link href="/mpls/insights" className="mpls-btn mpls-btn-secondary">
              Read Insights
            </Link>
            <Link href="/mpls/awards" className="mpls-btn mpls-btn-secondary">
              Nominate a Leader
            </Link>
          </div>
        </div>
      </section>

      <section className="mpls-section">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <p className="mpls-eyebrow">Mission</p>
            <h2 className="mpls-section-title">Advance the craft of project leadership</h2>
            <p className="mpls-section-subtitle">
              The Modern Project Leadership Society exists to elevate practical
              delivery leadership through community, insight, recognition, and
              thoughtful discussion grounded in real-world execution.
            </p>
          </div>

          <div className="mpls-grid-4">
            <div className="mpls-card">
              <p className="mpls-kicker">Community</p>
              <h3>Built for experienced practitioners</h3>
              <p>
                A professional community for project leaders and PMO practitioners
                who want serious conversations about the craft.
              </p>
              <Link href="/mpls/membership">Join the Society</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Insights</p>
              <h3>Thought leadership rooted in practice</h3>
              <p>
                Articles, case studies, PMO spotlights, and interviews that focus
                on delivery reality rather than abstract methodology.
              </p>
              <Link href="/mpls/insights">Explore Insights</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Awards</p>
              <h3>Recognition for real excellence</h3>
              <p>
                Celebrate project leaders and teams who demonstrate judgment,
                clarity, resilience, and meaningful delivery impact.
              </p>
              <Link href="/mpls/awards">View Awards</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Events</p>
              <h3>Gatherings for modern project leaders</h3>
              <p>
                Practitioner-centered events featuring keynotes, panels,
                discussions, and an annual awards ceremony.
              </p>
              <Link href="/mpls/events">View Events</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mpls-section mpls-section-alt">
        <div className="mpls-container mpls-feature">
          <div className="mpls-feature-panel">
            <div className="mpls-kicker">Featured insight</div>
            <div className="mpls-feature-title">
              Why Most PMOs Fail — And How the Best Ones Actually Work
            </div>
            <div className="mpls-feature-copy">
              The strongest PMOs do not succeed by adding more process. They
              succeed by improving clarity, decision quality, execution rhythm,
              and accountability across complex work.
            </div>
          </div>

          <div className="mpls-feature-panel">
            <div className="mpls-kicker">Annual program</div>
            <div className="mpls-feature-title">Modern Project Leadership Summit</div>
            <div className="mpls-feature-copy">
              A flagship gathering for experienced leaders who want to discuss
              project rescue, PMO design, transformation leadership, and delivery
              culture with seriousness and candor.
            </div>
          </div>
        </div>
      </section>

      <section className="mpls-section">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <p className="mpls-eyebrow">Why MPLS</p>
            <h2 className="mpls-section-title">A modern society for modern delivery</h2>
          </div>

          <div className="mpls-prose">
            <p>
              MPLS emphasizes project leadership and practical delivery rather
              than certifications or rigid methodologies. Its philosophy aligns
              with Common Sense Work: clear thinking, minimal bureaucracy, and
              disciplined execution aimed at real outcomes.
            </p>

            <div className="mpls-highlight">
              Leadership matters more than methodology. Judgment matters more
              than certification. Delivery matters more than process theater.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
