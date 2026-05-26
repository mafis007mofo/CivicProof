"use client";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateId, saveCase } from "@/lib/localStorage";
import type { IncidentCase, IncidentType } from "@/types";
import { AlertCircle, Car, CheckCircle, Lightbulb, MapPin, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = 1 | 2;

type FormState = {
  incidentType: IncidentType;
  title: string;
  location: string;
  incidentDate: string;
  incidentTime: string;
  description: string;
};

type FormErrors = Partial<Record<keyof Pick<FormState, "title" | "location" | "incidentDate" | "description">, string>>;

const initialFormState: FormState = {
  incidentType: "road_accident",
  title: "",
  location: "",
  incidentDate: "",
  incidentTime: "",
  description: "",
};

const typeOptions: { value: IncidentType; title: string; description: string; icon: typeof Car; pills: string[] }[] = [
  {
    value: "road_accident",
    title: "Road Accident",
    description: "Vehicle damage, collision documentation, insurance-ready summaries.",
    icon: Car,
    pills: ["Vehicle collision", "Pothole damage", "Hit and run"],
  },
  {
    value: "civic_issue",
    title: "Civic Issue",
    description: "Potholes, broken infrastructure, unsafe public conditions.",
    icon: MapPin,
    pills: ["Road damage", "Broken streetlight", "Garbage dumping"],
  },
];

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!form.incidentDate.trim()) {
    errors.incidentDate = "Date is required.";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  }

  return errors;
}

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [declarationSigned, setDeclarationSigned] = useState(false);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const goNext = () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStep(2);
    }
  };

  const createCase = () => {
    if (!declarationSigned) {
      return;
    }

    const now = new Date().toISOString();
    const newCase: IncidentCase = {
      id: generateId(),
      title: form.title.trim(),
      incidentType: form.incidentType,
      status: "draft",
      location: form.location.trim(),
      incidentDate: form.incidentDate,
      incidentTime: form.incidentTime || undefined,
      description: form.description.trim(),
      declarationSigned: true,
      createdAt: now,
      updatedAt: now,
    };

    saveCase(newCase);
    router.push(`/cases/${newCase.id}`);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase" style={{ color: "var(--accent-green)" }}>
            Incident intake
          </p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ color: "var(--text-primary)" }}>
            Report an Incident
          </h1>
          <div className="mt-6 flex items-center gap-0">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-full font-mono text-sm font-bold"
                style={{
                  backgroundColor: step >= 1 ? "var(--accent-green)" : "var(--bg-elevated)",
                  color: step >= 1 ? "var(--bg-primary)" : "var(--text-muted)",
                }}
              >
                1
              </span>
              <span className="text-sm font-semibold" style={{ color: step >= 1 ? "var(--text-primary)" : "var(--text-muted)" }}>Incident Details</span>
            </div>
            {/* Connecting line */}
            <div className="mx-3 h-px w-12" style={{ backgroundColor: step > 1 ? "var(--accent-green)" : "var(--border-subtle)" }} />
            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-full font-mono text-sm font-bold"
                style={{
                  backgroundColor: step >= 2 ? "var(--accent-green)" : "var(--bg-elevated)",
                  color: step >= 2 ? "var(--bg-primary)" : "var(--text-muted)",
                }}
              >
                2
              </span>
              <span className="text-sm font-semibold" style={{ color: step >= 2 ? "var(--text-primary)" : "var(--text-muted)" }}>Declaration</span>
            </div>
          </div>
        </div>

        <section className="rounded-lg border p-5 sm:p-7" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          {step === 1 ? (
            <div className="animate-fade-in space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = form.incidentType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("incidentType", option.value)}
                      className="rounded-lg border p-5 text-left transition hover:scale-[1.01]"
                      style={{
                        backgroundColor: selected ? "color-mix(in srgb, var(--accent-green) 10%, var(--bg-primary))" : "var(--bg-primary)",
                        borderColor: selected ? "var(--accent-green)" : "var(--border-subtle)",
                        boxShadow: selected ? "0 0 18px color-mix(in srgb, var(--accent-green) 18%, transparent)" : "none",
                      }}
                    >
                      <Icon className="h-7 w-7" style={{ color: selected ? "var(--accent-green)" : "var(--text-muted)" }} />
                      <h2 className="mt-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {option.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                        {option.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {option.pills.map((pill) => (
                          <span key={pill} className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                            {pill}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-5">
                <div>
                  <Label htmlFor="title" style={{ color: "var(--text-primary)" }}>
                    Title
                  </Label>
                  <Input id="title" value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="e.g. Pothole damage to my vehicle near Whitefield" className="mt-2" />
                  {errors.title ? <p className="mt-2 text-sm" style={{ color: "var(--accent-red)" }}>{errors.title}</p> : null}
                </div>

                <div>
                  <Label htmlFor="location" style={{ color: "var(--text-primary)" }}>
                    Location
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                    <Input id="location" value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Area, City, State" className="pl-9" />
                  </div>
                  {errors.location ? <p className="mt-2 text-sm" style={{ color: "var(--accent-red)" }}>{errors.location}</p> : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="incidentDate" style={{ color: "var(--text-primary)" }}>
                      Date
                    </Label>
                    <Input id="incidentDate" type="date" value={form.incidentDate} onChange={(event) => updateField("incidentDate", event.target.value)} className="mt-2" />
                    {errors.incidentDate ? <p className="mt-2 text-sm" style={{ color: "var(--accent-red)" }}>{errors.incidentDate}</p> : null}
                  </div>
                  <div>
                    <Label htmlFor="incidentTime" style={{ color: "var(--text-primary)" }}>
                      Time
                    </Label>
                    <Input id="incidentTime" type="time" value={form.incidentTime} onChange={(event) => updateField("incidentTime", event.target.value)} className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" style={{ color: "var(--text-primary)" }}>
                    Description
                  </Label>
                  <Textarea id="description" rows={6} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Describe what happened in detail - include what you saw, any damage, approximate times, and relevant observations" className="mt-2 resize-none" />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {errors.description ? <p className="text-sm" style={{ color: "var(--accent-red)" }}>{errors.description}</p> : <span />}
                    <p className="text-sm" style={{ color: form.description.length > 80 ? "var(--accent-green)" : "var(--text-muted)" }}>
                      {form.description.length} characters
                    </p>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-md border px-3 py-2" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 28%, transparent)" }}>
                    <Lightbulb className="mt-0.5 h-[11px] w-[11px] shrink-0" style={{ color: "var(--accent-amber)" }} />
                    <p className="text-xs leading-5" style={{ color: "var(--text-muted)" }}>Be specific — mention landmarks, approximate times, damage details, and any witnesses you saw</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={goNext} style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}>
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Review summary
                </h2>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Type</dt>
                    <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{form.incidentType === "road_accident" ? "Road Accident" : "Civic Issue"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Date</dt>
                    <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{form.incidentDate}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Title</dt>
                    <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{form.title}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Location</dt>
                    <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{form.location}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-primary)", borderColor: declarationSigned ? "var(--accent-green)" : "var(--border-subtle)" }}>
                <div className="mb-4 flex items-center gap-3">
                  <Shield className="h-5 w-5" style={{ color: "var(--accent-green)" }} />
                  <div>
                    <h3 className="font-heading text-lg font-bold" style={{ color: "var(--text-primary)" }}>CivicProof Declaration</h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Required before generating your action packet</p>
                  </div>
                </div>
                <button type="button" onClick={() => setDeclarationSigned((current) => !current)} className="flex w-full gap-4 text-left">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded border" style={{ backgroundColor: declarationSigned ? "var(--accent-green)" : "transparent", borderColor: declarationSigned ? "var(--accent-green)" : "var(--border-subtle)", color: "var(--bg-primary)" }}>
                    {declarationSigned ? <CheckCircle className="h-4 w-4" /> : null}
                  </span>
                  <span className="text-sm leading-6" style={{ color: "var(--text-primary)" }}>
                    I confirm that the information and evidence I am submitting is accurate to the best of my knowledge. I understand that CivicProof does not verify legal truth, and that filing a false report may have legal consequences.
                  </span>
                </button>
              </div>

              <div className="flex gap-3 rounded-lg border p-4" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 35%, transparent)", color: "var(--accent-amber)" }}>
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-6">
                  CivicProof generates documentation from your input. It does not replace legal, police, or insurance procedures.
                </p>
              </div>

              <Button type="button" disabled={!declarationSigned} onClick={createCase} className="w-full" style={{ backgroundColor: declarationSigned ? "var(--accent-green)" : "var(--bg-elevated)", color: declarationSigned ? "var(--bg-primary)" : "var(--text-muted)" }}>
                Create Case
              </Button>
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                Back
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
