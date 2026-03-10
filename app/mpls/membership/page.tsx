export default function MembershipPage() {
  return (
    <section className="mpls-section">
      <div className="mpls-container">
        <div className="mpls-section-header">
          <p className="mpls-eyebrow">Membership</p>
          <h1 className="mpls-section-title">Join the Society</h1>
          <p className="mpls-section-subtitle">
            Membership is about participation in a serious professional
            community, not the collection of credentials.
          </p>
        </div>

        <div className="mpls-grid-2">
          <div className="mpls-card">
            <h2>Individual Membership</h2>
            <ul className="mpls-list">
              <li>Access to MPLS community discussions and roundtables</li>
              <li>Invitations to events and practitioner sessions</li>
              <li>Early access to research, articles, and features</li>
              <li>Eligibility for awards and recognition programs</li>
              <li>Opportunity to contribute articles and perspectives</li>
            </ul>
          </div>

          <div className="mpls-card">
            <h2>Corporate Membership</h2>
            <ul className="mpls-list">
              <li>Recognition as a supporting organization</li>
              <li>Participation in thought leadership and events</li>
              <li>PMO spotlight opportunities</li>
              <li>Support for practitioner development and visibility</li>
              <li>Connection to a broader delivery leadership community</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
