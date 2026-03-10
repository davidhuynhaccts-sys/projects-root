export default function LeadershipPage() {
  const leadership = [
    {
      name: "Daniel Foster",
      role: "Director of Membership",
      bio: "Daniel Foster leads membership growth and engagement for MPLS. He has spent his career building communities of practice around project delivery and organizational transformation.",
    },
    {
      name: "Sophia Martinez",
      role: "Director of Programs",
      bio: "Sophia Martinez oversees MPLS events including the Modern Project Leadership Summit. She previously led program management organizations responsible for global transformation initiatives.",
    },
    {
      name: "Michael Grant",
      role: "Director of Publications",
      bio: "Michael Grant leads the MPLS Insights platform. He works with practitioners to capture lessons learned from real project delivery experiences and translate them into thoughtful articles and case studies.",
    },
    {
      name: "Lena Sørensen",
      role: "Director of Partnerships",
      bio: "Lena Sørensen develops partnerships between MPLS and organizations that support the advancement of project leadership. Her background includes strategic alliances and transformation program sponsorship.",
    },
    {
      name: "Thomas Bennett",
      role: "Director of Marketing & Communications",
      bio: "Thomas Bennett leads communication strategy and public engagement for MPLS. His work focuses on helping practitioner communities share ideas, experiences, and lessons learned more effectively.",
    },
  ];

  return (
    <section className="mpls-section">
      <div className="mpls-container">
        <div className="mpls-section-header">
          <p className="mpls-eyebrow">Leadership</p>
          <h1 className="mpls-section-title">Volunteer Leadership</h1>
          <p className="mpls-section-subtitle">
            The Modern Project Leadership Society operates through a group of
            volunteer leaders who support the programs, publications, and
            community initiatives of the organization.
          </p>
        </div>

        <div className="mpls-grid-3">
          {leadership.map((person) => (
            <div key={person.name} className="mpls-card">
              <h3>{person.name}</h3>
              <p className="mpls-kicker">{person.role}</p>
              <p>{person.bio}</p>
            </div>
          ))}
        </div>

        <div className="mpls-prose" style={{ marginTop: "48px" }}>
          <h2>Volunteer Leadership Model</h2>
          <p>
            MPLS operates through volunteer leadership roles held by experienced
            practitioners who care deeply about advancing the craft of project
            leadership.
          </p>

          <p>
            These leaders help shape the society’s programs, publications,
            events, and community initiatives while maintaining the practical
            and practitioner-focused philosophy of the organization.
          </p>
        </div>
      </div>
    </section>
  );
}
