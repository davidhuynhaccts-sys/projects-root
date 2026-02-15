export default function Ampersand() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f0f0f",
        color: "white",
        textAlign: "center",
        padding: "2rem"
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>&amp;</h1>

      <h2 style={{ fontWeight: 300 }}>
        Because women are not finished.
      </h2>

      <p style={{ marginTop: "1.5rem", maxWidth: "500px", opacity: 0.7 }}>
        A movement for menopause awareness, education, and dignity.
      </p>
    </main>
  );
}
