export default function InsightsPage() {
  return (
    <section className="mpls-section">
      <div className="mpls-container">
        <div className="mpls-section-header">
          <p className="mpls-eyebrow">Insights</p>
          <h1 className="mpls-section-title">The intellectual center of MPLS</h1>
          <p className="mpls-section-subtitle">
            Thoughtful writing and practical analysis for people who lead complex
            work in the real world.
          </p>
        </div>

        <div className="mpls-grid-2">
          <div className="mpls-card">
            <h2>Articles</h2>
            <ul className="mpls-list">
              <li>Why Most PMOs Fail — And How the Best Ones Actually Work</li>
              <li>The Myth of the Perfect Project Plan</li>
              <li>How Great Project Leaders Make Decisions Under Ambiguity</li>
              <li>When Agile Stops Working</li>
              <li>Why Delivery Culture Matters More Than Methodology</li>
              <li>The Quiet Skill of Project Rescue</li>
            </ul>
          </div>

          <div className="mpls-card">
            <h2>Case Studies</h2>
            <ul className="mpls-list">
              <li>Rescuing a failing healthcare platform implementation</li>
              <li>Building a PMO inside a high-growth startup</li>
              <li>Delivering a global ERP rollout under extreme time pressure</li>
            </ul>
          </div>

          <div className="mpls-card">
            <h2>PMO Spotlights</h2>
            <ul className="mpls-list">
              <li>Inside a modern enterprise PMO</li>
              <li>A healthcare delivery PMO built for speed</li>
              <li>How a transformation office rebuilt trust in delivery</li>
            </ul>
          </div>

          <div className="mpls-card">
            <h2>Interviews</h2>
            <ul className="mpls-list">
              <li>A conversation with a transformation executive</li>
              <li>Lessons from a program director who delivered 30+ major initiatives</li>
              <li>What a startup PMO looks like in practice</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
