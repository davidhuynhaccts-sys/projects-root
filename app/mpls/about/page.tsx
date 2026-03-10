import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <section className="mpls-section">
        <div className="mpls-container mpls-prose">
          <p className="mpls-eyebrow">About MPLS</p>

          <h1>Modern Project Leadership Society</h1>

          <p>
            The Modern Project Leadership Society (MPLS) is a professional
            society dedicated to advancing the craft of modern project
            leadership.
          </p>

          <p>
            Our focus is not on certifications or rigid methodologies. Instead,
            MPLS exists to promote thoughtful discussion about how complex work
            is actually delivered inside organizations.
          </p>

          <p>
            The society brings together experienced practitioners — project
            leaders, PMO directors, transformation executives, and delivery
            professionals — who care about improving how organizations execute
            complex initiatives.
          </p>

          <div className="mpls-highlight">
            Modern project leadership requires judgment, clarity of thinking,
            and disciplined execution — not simply adherence to process.
          </div>
        </div>
      </section>

      <section className="mpls-section mpls-section-alt">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <h2 className="mpls-section-title">Why MPLS Exists</h2>
          </div>

          <div className="mpls-grid-3">
            <div className="mpls-card">
              <h3>Elevate the Craft</h3>
              <p>
                Project leadership is often reduced to tools and templates.
                MPLS focuses instead on leadership, judgment, and the practical
                craft of delivering complex work.
              </p>
            </div>

            <div className="mpls-card">
              <h3>Share Real Experience</h3>
              <p>
                Many of the most valuable lessons in project delivery come from
                experience. MPLS provides a forum for practitioners to share
                insights grounded in real-world work.
              </p>
            </div>

            <div className="mpls-card">
              <h3>Recognize Excellence</h3>
              <p>
                Through its awards and publications, MPLS recognizes project
                leaders and teams who demonstrate exceptional delivery
                leadership in complex environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mpls-section">
        <div className="mpls-container mpls-prose">
          <h2>Philosophy of Modern Project Leadership</h2>

          <p>
            The philosophy behind MPLS is closely aligned with the principles
            of practical delivery leadership. Organizations succeed not because
            of methodology alone, but because leaders create clarity,
            accountability, and disciplined execution.
          </p>

          <p>
            While frameworks and tools can be helpful, the true craft of project
            leadership lies in navigating complexity, aligning stakeholders, and
            guiding teams toward successful outcomes.
          </p>

          <div className="mpls-highlight">
            Leadership matters more than methodology. Delivery matters more
            than process. Judgment matters more than certification.
          </div>
        </div>
      </section>

      <section className="mpls-section mpls-section-alt">
        <div className="mpls-container">
          <div className="mpls-section-header">
            <h2 className="mpls-section-title">Organization</h2>

            <p className="mpls-section-subtitle">
              The Modern Project Leadership Society operates through a
              volunteer-led governance and leadership structure composed of
              experienced practitioners.
            </p>
          </div>

          <div className="mpls-grid-2">
            <div className="mpls-card">
              <h3>Governance</h3>

              <p>
                The MPLS Board of Directors provides strategic oversight for
                the society and ensures the organization remains aligned with
                its mission to advance the craft of project leadership.
              </p>

              <Link href="/governance">
                View Governance →
              </Link>
            </div>

            <div className="mpls-card">
              <h3>Leadership</h3>

              <p>
                MPLS operates through a group of volunteer leaders responsible
                for membership, programs, publications, partnerships, and
                community engagement.
              </p>

              <Link href="/leadership">
                View Leadership →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
