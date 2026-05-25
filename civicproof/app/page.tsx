export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-6" style={{ backgroundColor: "var(--bg-primary)" }}>
      <section
        className="max-w-xl rounded-lg border p-8 text-center"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
      >
        <p className="font-mono text-xs uppercase" style={{ color: "var(--accent-green)" }}>
          CivicProof
        </p>
        <h1 className="mt-4 text-4xl font-bold">Day 1 scaffold ready</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          Full Stitch-guided landing page implementation arrives in Task 7.
        </p>
      </section>
    </main>
  );
}
