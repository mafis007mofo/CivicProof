import { DEMO_PACKET } from "@/lib/demoCase";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { AlertTriangle, Car, CheckCircle2, Clock, Download, FileX, MapPin, Upload, Zap } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CivicProof - Turn Evidence into Action",
  description: "Create official-ready action packets from civic complaint and road incident evidence.",
};

const problemCards = [
  {
    icon: FileX,
    title: "You have evidence but do not know how to use it",
    description: "Photos, notes, and receipts often sit scattered across devices instead of becoming a structured record.",
  },
  {
    icon: AlertTriangle,
    title: "Complaints get rejected due to weak documentation",
    description: "Missing dates, unclear location proof, or unsupported claims can slow down legitimate submissions.",
  },
  {
    icon: Clock,
    title: "Genuine issues remain unresolved for months",
    description: "When documentation is incomplete, follow-up becomes harder and accountability becomes easier to avoid.",
  },
];

const steps = [
  {
    title: "Upload",
    description: "Add photos, videos, location details, and description.",
    icon: Upload,
  },
  {
    title: "Analyze",
    description: "AI maps your claims to evidence, detects missing proof, and scores completeness.",
    icon: Zap,
  },
  {
    title: "Download",
    description: "Get a structured complaint packet ready for authorities or insurers.",
    icon: Download,
  },
];

const useCases = [
  {
    title: "Road Accidents",
    icon: Car,
    description: "Document collisions, damage, injuries, and claim context with clean evidence mapping.",
    bullets: ["Vehicle damage documentation", "Insurance claim summaries", "Third-party collision evidence"],
  },
  {
    title: "Civic Complaints",
    icon: MapPin,
    description: "Turn civic issues into complete packets with location, proof gaps, and authority-ready language.",
    bullets: ["Pothole and road damage", "Broken infrastructure", "Public safety hazards"],
  },
];

const trustItems = [
  "Evidence labels - every item marked as user-provided or unverified",
  "Missing proof detection - know what you are missing before you submit",
  "No legal claims - CivicProof organizes evidence, it does not judge truth",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:flex-row lg:px-8 lg:pt-20">
        <div className="w-full lg:w-3/5">
          <div
            className="inline-flex animate-fade-in-up items-center rounded-full border px-4 py-2 text-sm font-semibold opacity-0"
            style={{
              animationDelay: "0ms",
              backgroundColor: "color-mix(in srgb, var(--accent-green) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--accent-green) 32%, transparent)",
              color: "var(--accent-green)",
            }}
          >
            Evidence-based. Claim-aware. Action-ready.
          </div>
          <h1
            className="mt-8 max-w-4xl animate-fade-in-up text-5xl font-extrabold leading-[1.02] opacity-0 sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "100ms", color: "var(--text-primary)" }}
          >
            Turn incident evidence into official-ready action.
          </h1>
          <p
            className="mt-6 max-w-2xl animate-fade-in-up text-lg leading-8 opacity-0 sm:text-xl"
            style={{ animationDelay: "200ms", color: "var(--text-muted)" }}
          >
            Real incidents get ignored when documentation is weak. CivicProof turns your scattered photos,
            notes, and details into structured complaint packets with missing-proof checks in minutes.
          </p>
          <div className="mt-9 flex animate-fade-in-up flex-col gap-3 opacity-0 sm:flex-row" style={{ animationDelay: "300ms" }}>
            <Link
              href="/cases/new"
              className="rounded-md px-6 py-4 text-center text-sm font-bold transition hover:scale-[1.02]"
              style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}
            >
              Create Incident Packet
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border px-6 py-4 text-center text-sm font-bold transition hover:scale-[1.02]"
              style={{
                backgroundColor: "color-mix(in srgb, var(--bg-surface) 72%, transparent)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              View Demo Case
            </Link>
          </div>
          <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
            No account required. Free to use. Evidence stays on your device.
          </p>
        </div>

        <div className="w-full lg:w-2/5">
          <div
            className="glow-green rotate-[-2deg] rounded-lg border p-5 shadow-2xl backdrop-blur-xl transition hover:rotate-0 hover:scale-[1.01]"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-surface) 82%, transparent)",
              borderColor: "color-mix(in srgb, var(--accent-green) 44%, var(--border-subtle))",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase" style={{ color: "var(--accent-green)" }}>
                  Demo
                </p>
                <h2 className="mt-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Pothole Damage, Whitefield
                </h2>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 14%, transparent)", color: "var(--accent-green)" }}>
                Packet Ready
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="aspect-[4/3] rounded-md border" style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }} />
              <div className="aspect-[4/3] rounded-md border" style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }} />
            </div>
            <div className="mt-6 rounded-md border p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  55 / 100 - Moderate
                </span>
                <span className="font-mono text-xs" style={{ color: "var(--accent-amber)" }}>
                  Evidence score
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                <div className="h-full w-[55%] rounded-full" style={{ backgroundColor: "var(--accent-amber)" }} />
              </div>
            </div>
            <div className="mt-4 rounded-md border px-4 py-3 text-sm" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 35%, transparent)", color: "var(--accent-amber)" }}>
              {DEMO_PACKET.missingEvidence.length} items missing from evidence checklist
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            The documentation gap is real.
          </h2>
          <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>
            Genuine incidents go ignored not because they did not happen, but because the evidence is disorganized.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {problemCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border p-6 transition hover:scale-[1.01]"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <card.icon className="h-7 w-7" style={{ color: "var(--accent-blue)" }} />
              <h3 className="mt-5 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          From scattered evidence to structured action
        </h2>
        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <div className="absolute left-1/2 top-10 hidden h-px w-2/3 -translate-x-1/2 md:block" style={{ backgroundColor: "var(--border-subtle)" }} />
          {steps.map((step, index) => (
            <article key={step.title} className="relative rounded-lg border p-6 text-center" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--accent-green)", color: "var(--accent-green)" }}>
                <step.icon className="h-7 w-7" />
              </div>
              <p className="mt-5 font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          Built for real incidents
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {useCases.map((useCase) => (
            <article key={useCase.title} className="rounded-lg border p-7" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <useCase.icon className="h-8 w-8" style={{ color: "var(--accent-green)" }} />
              <h3 className="mt-5 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                {useCase.title}
              </h3>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                {useCase.description}
              </p>
              <ul className="mt-6 space-y-3">
                {useCase.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-primary)" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--accent-green)" }} />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          Built with responsibility
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border p-5" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" style={{ color: "var(--accent-green)" }} />
              <p className="text-sm leading-6" style={{ color: "var(--text-primary)" }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-lg border p-8 text-center sm:p-12" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 10%, var(--bg-surface))", borderColor: "color-mix(in srgb, var(--accent-green) 36%, var(--border-subtle))" }}>
          <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            Ready to document your incident?
          </h2>
          <Link href="/cases/new" className="mt-7 inline-flex rounded-md px-6 py-4 text-sm font-bold transition hover:scale-[1.02]" style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}>
            Create Incident Packet
          </Link>
        </div>
      </section>

      <footer className="border-t px-4 py-10 sm:px-6 lg:px-8" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mx-auto max-w-7xl">
          <p className="font-heading text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            CivicProof
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Evidence to action for civic complaints and road incidents.
          </p>
          <p className="mt-6 max-w-4xl text-xs leading-6" style={{ color: "var(--text-muted)" }}>
            CivicProof organizes user-provided evidence. It does not verify legal truth, guarantee official
            acceptance, or replace police, legal, medical, insurance, or government procedures.
          </p>
        </div>
      </footer>
    </main>
  );
}
