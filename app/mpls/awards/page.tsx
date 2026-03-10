export default function AwardsPage() {
  const awards = [
    {
      title: "Project Leader of the Year",
      description:
        "Recognizes an individual who demonstrated exceptional leadership in delivering a complex initiative.",
    },
    {
      title: "PMO of the Year",
      description:
        "Awarded to a PMO that has materially improved the delivery capability of its organization.",
    },
    {
      title: "Project Rescue Award",
      description:
        "Recognizes the successful turnaround of a troubled or failing project.",
    },
    {
      title: "Rising Project Leader",
      description:
        "Honors an emerging leader showing extraordinary promise in the profession.",
    },
    {
      title: "Delivery Excellence Award",
      description:
        "Recognizes a team that delivered a high-impact initiative under complex conditions.",
    },
  ];

  return (
    <section className="mpls-section">
      <div className="mpls-container">
        <div className="mpls-section-header">
          <p className="mpls-eyebrow">Awards</p>
          <h1 className="mpls-section-title">MPLS Annual Awards</h1>
          <p className="mpls-section-subtitle">
            Recognizing individuals and organizations demonstrating excellence
            in project leadership and delivery.
          </p>
        </div>

        <div className="mpls-grid-2">
          {awards.map((award) => (
            <div key={award.title} className="mpls-card mpls-award-card">
              <h2>{award.title}</h2>
              <p>{award.description}</p>
            </div>
          ))}
        </div>

        <div className="mpls-prose" style={{ marginTop: 36 }}>
          <h2>Nomination Process</h2>
          <p>
            Nominations may be submitted by peers, organizations, or society
            members. Each nomination should include a project summary, leadership
            impact, and delivery outcomes.
          </p>

          <h2>Judging Process</h2>
          <p>
            Awards are judged by a panel of experienced project leaders and PMO
            executives using criteria such as leadership, complexity, outcomes,
            and organizational impact.
          </p>
        </div>
      </div>
    </section>
  );
}
