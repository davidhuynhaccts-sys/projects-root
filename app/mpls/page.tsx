import Link from "next/link";

export default function MplsHomePage() {
  return (
    <>
      <section className="mpls-hero">
        <div className="mpls-container">
          <p className="mpls-eyebrow">Modern Project Leadership Society</p>

          <h1>Modern Project Leadership for the Real World</h1>

          <p className="mpls-lead">
            The Modern Project Leadership Society (MPLS) is a professional
            community dedicated to advancing the craft of project leadership.
            We focus on practical delivery, leadership judgment, and real-world
            execution rather than methodology debates or certification programs.
          </p>

          <div className="mpls-hero-actions">
            <Link href="/membership" className="mpls-btn mpls-btn-primary">
              Join MPLS
            </Link>

            <Link href="/insights" className="mpls-btn mpls-btn-secondary">
              Read Insights
            </Link>

            <Link href="/awards" className="mpls-btn mpls-btn-secondary">
              Nominate a Leader
            </Link>
          </div>
        </div>
      </section>

      <section className="mpls-section">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <p className="mpls-eyebrow">Latest from MPLS</p>
            <h2 className="mpls-section-title">
              Insights for people who lead complex work
            </h2>
            <p className="mpls-section-subtitle">
              Practical thinking, case studies, and lessons from real delivery
              environments.
            </p>
          </div>

          <div className="mpls-grid-3">
            <div className="mpls-card">
              <p className="mpls-kicker">Article</p>
              <h3>Why Most PMOs Fail — And How the Best Ones Actually Work</h3>
              <p>
                The strongest PMOs do not succeed by adding more process. They
                succeed by improving decision clarity, accountability, and
                delivery rhythm.
              </p>
              <Link href="/insights">Read article →</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Case Study</p>
              <h3>Rescuing a Failing Healthcare Platform Implementation</h3>
              <p>
                A look at how leadership, sequencing, and hard decision-making
                turned around a troubled delivery effort.
              </p>
              <Link href="/insights">Read case study →</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Interview</p>
              <h3>What Great Project Leaders Do Differently Under Pressure</h3>
              <p>
                An interview on stakeholder alignment, project rescue, and why
                calm judgment matters more than methodology purity.
              </p>
              <Link href="/insights">Read interview →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mpls-section mpls-section-alt">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <p className="mpls-eyebrow">Mission</p>

            <h2 className="mpls-section-title">
              Advancing the craft of project leadership
            </h2>

            <p className="mpls-section-subtitle">
              MPLS exists to elevate thoughtful conversation about how complex
              projects are actually delivered. We believe leadership, judgment,
              and execution matter more than rigid adherence to frameworks.
            </p>
          </div>

          <div className="mpls-grid-4">
            <div className="mpls-card">
              <p className="mpls-kicker">Community</p>

              <h3>Connect with experienced practitioners</h3>

              <p>
                Join a professional society of project leaders, PMO directors,
                and delivery executives who care about the craft of modern
                project leadership.
              </p>

              <Link href="/membership">Join the Society</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Insights</p>

              <h3>Practical thinking about complex work</h3>

              <p>
                Read articles, case studies, PMO spotlights, and interviews
                grounded in real delivery experience.
              </p>

              <Link href="/insights">Explore Insights</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Awards</p>

              <h3>Recognizing excellence in delivery</h3>

              <p>
                MPLS awards recognize project leaders and teams who demonstrate
                extraordinary judgment, resilience, and leadership in complex
                initiatives.
              </p>

              <Link href="/awards">View Awards</Link>
            </div>

            <div className="mpls-card">
              <p className="mpls-kicker">Events</p>

              <h3>Modern Project Leadership Summit</h3>

              <p>
                Join practitioners and delivery leaders for conversations about
                the realities of modern project leadership.
              </p>

              <Link href="/events">View Events</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mpls-section">
        <div className="mpls-container mpls-feature">
          <div className="mpls-feature-panel">
            <div className="mpls-kicker">Featured Insight</div>

            <div className="mpls-feature-title">
              Why Most PMOs Fail — And How the Best Ones Actually Work
            </div>

            <div className="mpls-feature-copy">
              Many PMOs focus on process compliance rather than delivery
              outcomes. The most effective PMOs instead focus on leadership,
              decision clarity, and execution discipline.
            </div>
          </div>

          <div className="mpls-feature-panel">
            <div className="mpls-kicker">Annual Event</div>

            <div className="mpls-feature-title">
              Modern Project Leadership Summit
            </div>

            <div className="mpls-feature-copy">
              A gathering for experienced practitioners who want to discuss
              project rescue, transformation programs, PMO design, and delivery
              leadership with seriousness and candor.
            </div>
          </div>
        </div>
      </section>

      <section className="mpls-section mpls-section-alt">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <p className="mpls-eyebrow">Philosophy</p>

            <h2 className="mpls-section-title">
              Leadership matters more than methodology
            </h2>
          </div>

          <div className="mpls-prose">
            <p>
              The philosophy of MPLS aligns closely with the principles of
              Common Sense Work (CoSY). We believe the craft of project
              leadership is built on clarity of thinking, practical execution,
              and disciplined delivery.
            </p>

            <div className="mpls-highlight">
              Delivery matters more than process. Leadership matters more than
              methodology. Judgment matters more than certification.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
