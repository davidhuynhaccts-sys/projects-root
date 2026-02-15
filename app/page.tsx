export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
        color: "#fff",
        textAlign: "center",
        padding: "2rem"
      }}
    >
      <div>
        <h1 style={{ fontSize: "3rem", margin: 0 }}>The Projects Project</h1>
        <p style={{ opacity: 0.8, marginTop: "0.75rem" }}>
          A structured idea lab.
        </p>
      </div>
    </main>
  );
}
