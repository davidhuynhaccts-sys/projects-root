export default function GovernancePage() {
  const board = [
    {
      name: "Dr. Katherine Lawson",
      role: "Chair / President",
      linkedin: "",
      bio: "Katherine Lawson is a transformation executive with more than twenty years of experience leading global delivery organizations. She has built and scaled enterprise PMOs across healthcare, financial services, and technology companies.",
    },
    {
      name: "Marcus Delgado",
      role: "Vice Chair",
      linkedin: "",
      bio: "Marcus Delgado is a senior program leader known for guiding large-scale digital transformation programs. He has led multi-billion dollar modernization initiatives and advises organizations on aligning strategy with delivery execution.",
    },
    {
      name: "Elaine Wu",
      role: "Treasurer",
      linkedin: "",
      bio: "Elaine Wu is a finance and operations executive specializing in program governance and enterprise portfolio management. Her work focuses on building financial discipline into complex delivery environments.",
    },
    {
      name: "Robert Caldwell",
      role: "Secretary",
      linkedin: "",
      bio: "Robert Caldwell has spent his career developing governance models for large-scale programs and institutional initiatives. His work focuses on accountability, transparency, and decision discipline.",
    },

    {
      name: "David Huynh",
      role: "Board Member",
      linkedin: "",
      bio: "David Huynh is a project management and delivery leader with extensive experience building enterprise project management offices and improving how organizations execute complex initiatives. His work focuses on practical delivery leadership and modernizing project management practices.",
    },

    {
      name: "Frederik Tylim",
      role: "Board Member",
      linkedin: "",
      bio: "Frederik Tylim is a technology and delivery strategist with experience guiding large transformation initiatives across global organizations. His interests include modern project leadership, organizational execution, and the intersection of strategy and delivery.",
    },

    {
      name: "Svetlana Mueller",
      role: "Board Member",
      linkedin: "",
      bio: "Svetlana Mueller is a program and operations leader specializing in cross-functional initiatives and global delivery programs. She brings deep experience in aligning teams, stakeholders, and operational systems to achieve complex outcomes.",
    },
  ];

  return (
    <section className="mpls-section">
      <div className="mpls-container">
        <div className="mpls-section-header">
          <p className="mpls-eyebrow">Governance</p>

          <h1 className="mpls-section-title">Board of Directors</h1>

          <p className="mpls-section-subtitle">
            The Board of Directors provides strategic oversight for the Modern
            Project Leadership Society and ensures the organization remains
            aligned with its mission to advance the craft of project leadership.
          </p>
        </div>

        <div className="mpls-grid-3">
          {board.map((member) => (
            <div key={member.name} className="mpls-card">
              <h3>{member.name}</h3>

              <p className="mpls-kicker">{member.role}</p>

              <p>{member.bio}</p>

              {member.linkedin && (
                <p style={{ marginTop: "12px" }}>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn →
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mpls-prose" style={{ marginTop: "48px" }}>
          <h2>Governance Philosophy</h2>

          <p>
            The Board of Directors exists to steward the mission of MPLS and to
            ensure the society remains practitioner-focused, independent, and
            intellectually serious.
          </p>

          <p>
            Board members contribute strategic guidance based on their
            experience leading complex initiatives, transformation programs,
            and project management organizations.
          </p>
        </div>
      </div>
    </section>
  );
}
