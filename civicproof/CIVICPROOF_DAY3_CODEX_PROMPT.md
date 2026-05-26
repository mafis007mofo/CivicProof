# CivicProof — Day 3 Codex Build Prompt
### Wednesday May 28 | MVP Brief Due Tonight
### Audited by Claude (Anthropic) — Based on Gemini Flash Day 2 Audit

---

## CONTEXT

Today is the most important day. The MVP brief is due tonight. Judges will see the product for the first time. Every fix and feature today must make the product look and feel complete, trustworthy, and impressive.

You are Codex. You will be reviewed by Gemini Flash and audited by Claude after today. Build with full precision. Take your time on each task. Do not rush.

---

## RULES — Same as every day

- Run Review Agent after every task before proceeding
- Commit to GitHub after every task with a descriptive message
- Update Notion task status in real time
- Use Stitch before writing any new UI component
- No hardcoded colors — CSS variables only
- No any types
- Every client component must have "use client" at top
- Mobile responsive at 375px
- Run npm run build after Block C and confirm zero errors

---

## REVIEW AGENT CHECKLIST — Run after every task

```
[ ] Zero TypeScript errors
[ ] No any types
[ ] All imports resolve
[ ] Component renders without crash
[ ] CSS variables used, no hardcoded colors
[ ] Mobile 375px usable
[ ] No console.log in code
[ ] Committed to GitHub
[ ] Notion updated
VERDICT: PASS / FAIL
```

---

## BLOCK A — CRITICAL FIXES (do these first, non-negotiable)

These must be done before anything else. They affect the demo and the MVP brief directly.

---

### FIX 1 — API key missing should use fallback, not 500
File: app/api/generate-packet/route.ts

Find the section that checks for OPENAI_API_KEY and returns a 500 error.
Replace it with:

```typescript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || apiKey === "your_key_here" || apiKey.trim() === "") {
  const fallback = createFallbackPacket(incidentCase, evidence);
  return NextResponse.json({ packet: fallback, fallback: true }, { status: 200 });
}
```

This means in any environment without a valid key — local, Vercel preview, judge testing — the app still works and returns a complete packet instead of breaking.

Review Agent. Commit: "fix: API fallback when OPENAI_API_KEY missing — no more 500 error"

---

### FIX 2 — Canvas responsive width
File: components/canvas/EvidenceCanvas.tsx

The canvas currently uses hardcoded canvasWidth = 1000 and canvasHeight = 560. This breaks on laptops smaller than 1200px wide and looks bad on mobile.

Replace the hardcoded dimensions with a responsive approach:

1. Add a ref to the canvas container div: `const containerRef = useRef<HTMLDivElement>(null)`
2. Add state: `const [canvasWidth, setCanvasWidth] = useState(900)`
3. Add a useEffect with ResizeObserver:
```typescript
useEffect(() => {
  if (!containerRef.current) return;
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const width = Math.floor(entry.contentRect.width);
      setCanvasWidth(Math.max(width, 340));
    }
  });
  observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```
4. Keep canvasHeight fixed at 520 — only width is responsive
5. Attach containerRef to the outer canvas container div
6. All node position calculations that reference canvasWidth must use the state value — they will recompute automatically when width changes

Review Agent. Commit: "fix: canvas responsive width with ResizeObserver — no more overflow on smaller screens"

---

### FIX 3 — PacketPreview: all missing polish applied
File: components/PacketPreview.tsx

This is the most important polish task today because judges will see the packet. Apply every item from the audit in one focused pass.

Add to component state:
```typescript
const [copiedSection, setCopiedSection] = useState<string | null>(null);
const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
const [scoreCount, setScoreCount] = useState(0);
```

Add handlers:
```typescript
const handleCopy = (sectionId: string, text: string) => {
  void navigator.clipboard?.writeText(text);
  setCopiedSection(sectionId);
  setTimeout(() => setCopiedSection(null), 2000);
};

const toggleChecked = (item: string) => {
  setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
};
```

**1. Official document header**
At the very top of the packet, before all sections, add:
- A formal header bar with dark background, green left border (4px), containing:
  - Left: Shield icon (green, 20px) + "CivicProof" in Syne bold + "Evidence Action Packet" in muted smaller text
  - Right: Case ID in JetBrains Mono (small, muted) + generated date formatted as "Generated: DD MMM YYYY HH:MM"
- Below the header: a thin full-width green line (1px, 30% opacity)

**2. Status pills with icons in claim-vs-evidence table**
Import CheckCircle2, AlertCircle, XCircle from lucide-react.
Update each status pill:
- supported_by_user_evidence → green pill with CheckCircle2 icon (14px) + "Supported"
- user_statement_only → amber pill with AlertCircle icon + "Unverified"  
- missing → red pill with XCircle icon + "Missing"
- not_independently_verified → amber pill with AlertCircle icon + "Unverified"

Add hover highlight to claim table rows:
```tsx
<tr className="border-b transition-colors hover:bg-[var(--bg-elevated)] cursor-default">
```

**3. Missing evidence — numbered items + copy all button**
Add a "Copy Checklist" button next to the section heading.
When clicked: copies all missing evidence items as a numbered list to clipboard.
Show "Copied!" for 2 seconds then revert.
Each missing evidence item: show a small numbered badge (1, 2, 3...) before the text — styled as a small muted rounded pill.

**4. Draft sections with line numbers**
For both complaintDraft and claimOrCivicDraft:
Split the text by newline: `const lines = text.split('\n')`
Render as a two-column layout inside the dark card:
- Left column (32px wide): line numbers in JetBrains Mono, muted, right-aligned, size 11px
- Right column: the line text
- Left border on the whole block: 2px solid var(--border-subtle)
Update copy button to show "Copied!" for 2 seconds using the copiedSection state.

**5. Follow-up checklist — interactive with strikethrough**
Replace static checkmark icons with interactive checkboxes:
Each item:
```tsx
<div
  onClick={() => toggleChecked(item)}
  className="flex items-start gap-3 cursor-pointer group"
>
  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
    checkedItems[item]
      ? 'bg-[var(--accent-green)] border-[var(--accent-green)]'
      : 'border-[var(--border-subtle)] group-hover:border-[var(--accent-green)]'
  }`}>
    {checkedItems[item] && <Check size={10} className="text-black" />}
  </div>
  <span className={`text-sm transition-all ${
    checkedItems[item]
      ? 'line-through text-[var(--text-muted)]'
      : 'text-[var(--text-primary)]'
  }`}>{item}</span>
</div>
```

**6. Score count-up animation**
Add a useEffect that counts up the score from 0 to actual value on mount:
```typescript
useEffect(() => {
  const target = packet.evidenceStrengthScore;
  const duration = 1200;
  const steps = 40;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    setScoreCount(Math.floor(current));
    if (current >= target) clearInterval(timer);
  }, duration / steps);
  return () => clearInterval(timer);
}, [packet.evidenceStrengthScore]);
```
Use scoreCount instead of packet.evidenceStrengthScore in the score display.

Review Agent. Commit: "feat: PacketPreview complete polish — official header, icons, line numbers, interactive checklist, copy feedback, score animation"

---

## BLOCK B — REMAINING DESIGN POLISH

Apply these targeted improvements to make every page look MVP-ready.

---

### POLISH 1 — Landing page
File: app/page.tsx

**Hero section:**
Add a radial glow behind the heading — inside the left column div, add as first child:
```tsx
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(34,197,94,0.07) 0%, transparent 70%)',
  }}
/>
```
Make the left column div position: relative.

**Animated divider under hero:**
After the hero section closing tag, add:
```tsx
<div className="relative h-px w-full overflow-hidden">
  <div
    className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-[var(--accent-green)] to-transparent"
    style={{ animation: 'expandWidth 1.5s ease forwards', width: '100%', opacity: 0.3 }}
  />
</div>
```
Add to globals.css:
```css
@keyframes expandWidth {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 0.3; }
}
```

**Problem cards:**
Add `borderTop: '2px solid rgba(245, 158, 11, 0.4)'` and `transition: transform 0.2s ease, box-shadow 0.2s ease` to each problem card.
Add hover class or inline onMouseEnter/Leave for `translateY(-4px)` and a subtle shadow.

**Use case cards watermark icon:**
Inside each use case card, add a large semi-transparent icon absolutely positioned bottom-right:
```tsx
<div className="absolute bottom-4 right-4 opacity-[0.04] pointer-events-none">
  <Car size={96} /> {/* or MapPin for civic */}
</div>
```
Make the card div position: relative and overflow: hidden.

**Footer green top border:**
Add `borderTop: '1px solid rgba(34, 197, 94, 0.2)'` to the footer element.

**Mock canvas preview in hero card:**
Inside the mock evidence card on the right side of the hero, replace the two grey placeholder boxes with a mini canvas preview — just styled divs with SVG:
- A small SVG (200px × 120px) showing 3 circles connected by bezier lines
- Center circle: green border (incident node)
- Two side circles: muted border (evidence nodes)
- Bezier path connecting them in green, opacity 0.5
- Label below: "Evidence Map" in JetBrains Mono, size 10px, muted

Review Agent. Commit: "feat: landing page polish — radial glow, animated divider, problem card hover, watermarks, mini canvas preview"

---

### POLISH 2 — Dashboard
File: app/dashboard/page.tsx

**Stats row below header:**
After the page header div, add a stats row:
```tsx
const totalCases = cases.length;
const packetsGenerated = cases.filter(c => c.status === 'packet_generated' || c.status === 'submitted').length;
const avgScore = cases.length > 0
  ? Math.round(cases.reduce((sum, c) => {
      const ev = getEvidenceForCase(c.id);
      return sum + calculateEvidenceScore(c, ev).total;
    }, 0) / cases.length)
  : 0;
```
Render 3 stat pills in a row:
- "X Cases" with FileText icon
- "X Packets Ready" with Zap icon  
- "Avg Score: X/100" with BarChart2 icon
Style: small dark surface pills with muted text, inline with a dividing dot between them.

**Score strip at bottom of each case card:**
At the very bottom of each case card div, add a full-width 3px strip:
```tsx
<div
  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-lg"
  style={{
    backgroundColor: score.color === 'green'
      ? 'var(--accent-green)'
      : score.color === 'amber'
      ? 'var(--accent-amber)'
      : 'var(--accent-red)',
    opacity: 0.7,
  }}
/>
```
Make each case card div position: relative and overflow: hidden.

**Breadcrumb:**
At the very top of the page content (below navbar clearance), add:
```tsx
<div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
  <span>CivicProof</span>
  <ChevronRight size={12} />
  <span className="text-[var(--text-primary)]">Dashboard</span>
</div>
```

Review Agent. Commit: "feat: dashboard polish — stats row, score strip per card, breadcrumb"

---

### POLISH 3 — New case form
File: app/cases/new/page.tsx

**Step bar with labels:**
Replace the current dot/bar step indicator with:
```tsx
<div className="flex items-center gap-0 mb-8">
  <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)]'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step === 1 ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-black' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>1</div>
    <span>Incident Details</span>
  </div>
  <div className={`flex-1 h-px mx-3 ${step > 1 ? 'bg-[var(--accent-green)]' : 'bg-[var(--border-subtle)]'}`} />
  <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)]'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step === 2 ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-black' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>2</div>
    <span>Declaration</span>
  </div>
</div>
```

**Sub-type pills inside incident type cards:**
Inside each incident type selector card, below the description text, add a row of small pills:
- Road Accident: ["Vehicle collision", "Pothole damage", "Hit and run"]
- Civic Issue: ["Road damage", "Broken streetlight", "Garbage dumping"]
Style: small rounded pills, dark background, muted text, size 11px, flex-wrap row, gap-1, mt-3.

**AI hint below description textarea:**
After the textarea, add:
```tsx
<p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5">
  <Lightbulb size={11} className="text-[var(--accent-amber)] flex-shrink-0" />
  Be specific — mention landmarks, approximate times, damage details, and any witnesses you saw
</p>
```
Import Lightbulb from lucide-react.

**Declaration box official styling:**
In Step 2, replace the plain declaration checkbox area with:
```tsx
<div className="border border-[var(--border-subtle)] rounded-lg p-5 bg-[var(--bg-surface)]">
  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border-subtle)]">
    <Shield size={20} className="text-[var(--accent-green)] flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-[var(--text-primary)] font-display">CivicProof Declaration</p>
      <p className="text-xs text-[var(--text-muted)]">Required before generating your action packet</p>
    </div>
  </div>
  {/* existing checkbox and declaration text here */}
</div>
```

Review Agent. Commit: "feat: new case form polish — step bar labels, sub-type pills, AI hint, official declaration box"

---

### POLISH 4 — Case detail page
File: app/cases/[id]/page.tsx

**Case ID in monospace:**
In the case header section, below the title, add:
```tsx
<p className="text-xs font-mono text-[var(--text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
  Case #{incidentCase.id}
</p>
```

**Evidence file count + total size:**
Calculate total size from evidence array:
```typescript
const totalSizeBytes = evidence.reduce((sum, e) => sum + (e.fileSize || 0), 0);
const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
```
Show next to the "Evidence" section heading:
```tsx
<span className="text-xs text-[var(--text-muted)] ml-2">
  {evidence.length} file{evidence.length !== 1 ? 's' : ''} · {totalSizeMB} MB
</span>
```

**Score breakdown table in sidebar:**
Below the ScoreBadge in the right sidebar, add a breakdown section.
Import ScoreBreakdown type. The scoreBreakdown state already has the breakdown array.
Render:
```tsx
<div className="mt-4 space-y-1.5">
  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Score Breakdown</p>
  {scoreBreakdown.breakdown.map((item, i) => (
    <div key={i} className="flex items-center justify-between text-xs">
      <span className={item.earned ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
        {item.criterion}
      </span>
      <span className={`font-mono flex items-center gap-1 ${item.earned ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)]'}`}>
        {item.earned ? <Check size={10} /> : <Minus size={10} />}
        +{item.points}
      </span>
    </div>
  ))}
</div>
```
Import Check, Minus from lucide-react.

**Generate button full width + shimmer:**
Make the generate packet button full width (`w-full`).
When all conditions are met (evidence.length > 0 AND declarationSigned AND !isGenerating), add a shimmer animation:
Add to globals.css:
```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.btn-shimmer {
  background: linear-gradient(90deg, var(--accent-green) 0%, #4ade80 40%, var(--accent-green) 60%, #16a34a 100%);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
}
```
Apply `.btn-shimmer` class to the button only when it is active (not disabled, not loading).

**Background watermark icon:**
In the case header section container, add the incident type icon as a large watermark:
```tsx
<div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
  {incidentCase.incidentType === 'road_accident' ? <Car size={120} /> : <MapPin size={120} />}
</div>
```
Make the header container position: relative overflow: hidden.

Review Agent. Commit: "feat: case detail polish — case ID, file summary, score breakdown, shimmer button, watermark"

---

## BLOCK C — TRUST LAYER (Day 3 Core Feature)

This is the core Day 3 deliverable. The trust layer makes CivicProof different from a simple chatbot. It must be complete and visible in the UI before the MVP brief is submitted.

---

### FEATURE 1 — Trust label assignment engine
File: lib/trustAnalysis.ts (new file)

Create this file. Import EvidenceItem, TrustLabel from @/types.

Export function assignTrustLabel(file: File, item: EvidenceItem): TrustLabel

Rules (apply in order, return first match):
1. If file.type starts with "image/" and file.size > 8 * 1024 * 1024 (8MB): return "possibly_edited" — unusually large images are suspicious
2. If file.type starts with "image/" and file.lastModified === 0: return "metadata_missing"
3. If file.type === "application/pdf": return "needs_human_verification"
4. If file.type starts with "video/": return "user_provided" — videos are generally accepted as-is
5. If file.type starts with "audio/": return "user_provided"
6. If file.name.toLowerCase().includes("screenshot") || file.name.toLowerCase().includes("edited") || file.name.toLowerCase().includes("copy"): return "possibly_edited"
7. If file.lastModified > 0 and the file has a valid MIME type: return "metadata_available"
8. Default: return "user_provided"

Export function getTrustLabelMeta(label: TrustLabel): { color: string; bgColor: string; description: string }
Return a lookup object for each label:
- user_provided: { color: 'var(--accent-green)', bgColor: 'rgba(34,197,94,0.1)', description: 'Submitted directly by user' }
- metadata_available: { color: 'var(--accent-green)', bgColor: 'rgba(34,197,94,0.1)', description: 'File metadata present and readable' }
- metadata_missing: { color: 'var(--accent-amber)', bgColor: 'rgba(245,158,11,0.1)', description: 'No metadata — origin cannot be confirmed' }
- possibly_edited: { color: 'var(--accent-amber)', bgColor: 'rgba(245,158,11,0.1)', description: 'File may have been modified after capture' }
- ai_risk_unknown: { color: 'var(--accent-red)', bgColor: 'rgba(239,68,68,0.1)', description: 'Cannot determine if AI-generated' }
- needs_human_verification: { color: 'var(--accent-red)', bgColor: 'rgba(239,68,68,0.1)', description: 'Requires human review before submission' }

Export function getOverallTrustScore(evidence: EvidenceItem[]): { score: number; label: string; color: string }
Rules:
- Start at 100
- For each evidence item: if metadata_missing → -10, if possibly_edited → -20, if ai_risk_unknown → -25, if needs_human_verification → -15
- Clamp to 0-100
- 0-39: { label: 'Low Trust', color: 'var(--accent-red)' }
- 40-69: { label: 'Moderate Trust', color: 'var(--accent-amber)' }
- 70-100: { label: 'High Trust', color: 'var(--accent-green)' }

Review Agent. Commit: "feat: trust analysis engine — label assignment, trust score, label metadata"

---

### FEATURE 2 — Wire trust labels into evidence upload
File: components/evidence/EvidenceUpload.tsx

Import assignTrustLabel from @/lib/trustAnalysis.

In the file processing logic, after creating the EvidenceItem object, call:
```typescript
const trustLabel = assignTrustLabel(file, item);
const itemWithTrust = { ...item, trustLabel };
```
Use itemWithTrust everywhere after this point.

This means every uploaded file automatically gets a trust label before it appears in the canvas or evidence list.

Review Agent. Commit: "feat: wire trust labels into upload — every file auto-labeled on upload"

---

### FEATURE 3 — Trust Panel component
File: components/trust/TrustPanel.tsx (new file)

Create this as a 'use client' component.

Props: { evidence: EvidenceItem[] }

Use Stitch before coding. Stitch prompt:
"CivicProof trust panel UI component. Shows overall evidence trust score (large number, colored green/amber/red). Below: a table of evidence items, each row showing filename, trust label pill (color coded), and a one-line description of what the label means. Below the table: a disclaimer box explaining that CivicProof labels evidence based on file metadata and does not verify authenticity. Dark mode, matches CivicProof design system."

Build:
1. Overall trust score at top: large colored number + label (High/Moderate/Low Trust) + brief explanation "Based on file metadata analysis"
2. Evidence trust table: columns — File | Trust Label | What this means
   - Each row: filename (monospace, truncated), trust label pill (colored using getTrustLabelMeta), description from getTrustLabelMeta
3. AI risk notice box below table: amber border, AlertTriangle icon, text:
   "CivicProof cannot detect AI-generated images or deepfakes. All evidence is labeled based on file metadata only. Human verification is recommended for official submissions."
4. Declaration reminder at bottom: green border, Shield icon, text:
   "You declared that all submitted evidence is accurate to the best of your knowledge."

---

### FEATURE 4 — Wire TrustPanel into case detail
File: app/cases/[id]/page.tsx

Import TrustPanel from @/components/trust/TrustPanel.

Add a new section between the evidence list and the generate packet button:
- Section heading: "Evidence Trust Analysis"
- SubHeading muted: "Automated metadata assessment — not a verification of authenticity"
- Render: <TrustPanel evidence={evidence} />
- Only show when evidence.length > 0
- For demo-001: always show (DEMO_EVIDENCE has 2 items)

Review Agent. Commit: "feat: TrustPanel — trust score, per-file labels, AI risk notice, declaration confirmation"

---

### FEATURE 5 — Trust summary in GeneratedPacket display
File: components/PacketPreview.tsx

At the top of the packet, in the official document header area, add a small trust summary row:
- Import getOverallTrustScore from @/lib/trustAnalysis
- Accept evidence: EvidenceItem[] as an additional prop on PacketPreview
- Show: "Evidence Trust: [score]/100 — [label]" in the header right section, colored appropriately
- Update all usages of PacketPreview to pass evidence prop

Also update the disclaimer section at the bottom of the packet to include:
"Evidence trust labels are based on file metadata analysis only. CivicProof cannot verify whether files are authentic, AI-generated, or manipulated. All labels reflect technical file properties, not legal authenticity."

Review Agent. Commit: "feat: trust summary in PacketPreview — trust score in header, expanded disclaimer"

---

## BLOCK D — MVP BRIEF PREPARATION

Before you finish today, do these final steps to make sure the product is brief-ready.

---

### DEMO 1 — Verify demo case flow end to end

Navigate manually through this exact sequence and confirm everything works:
1. / → landing page loads, all sections visible, fonts correct
2. Click "View Demo Case" → /dashboard → demo case visible pinned at top
3. Click demo case → /cases/demo-001 loads
4. Canvas shows fully populated with incident node, 2 evidence nodes, 4 claim nodes, 5 missing nodes, all connected
5. Trust panel shows with both evidence items labeled "user_provided"
6. Score breakdown shows in sidebar
7. Scroll to packet preview — all sections present
8. Interactive checklist works (click items, strikethrough appears)
9. Copy complaint draft button shows "Copied!" for 2 seconds
10. Download PDF button visible (greyed out is fine — Day 4)

If any step fails: fix it before committing.

---

### DEMO 2 — Verify new case flow end to end

1. Go to /cases/new
2. Select Road Accident — card highlights green
3. Fill all fields including description > 80 chars
4. Click Next → Step 2 shows with summary
5. Check declaration → Create Case button activates
6. Submit → redirects to /cases/[new-id]
7. Canvas shows empty state with pulsing ring
8. Upload a test image file → canvas updates, evidence node appears, trust label assigned
9. Trust panel appears below
10. Score updates in sidebar with breakdown

---

### FINAL BUILD CHECK

Run: npm run build

Zero TypeScript errors required. Fix all before final commit.

Run: npm run dev

Confirm no console errors in browser.

Final commit:
```
git add .
git commit -m "feat: Day 3 complete — Block A fixes, design polish, trust layer, TrustPanel, trust labels, MVP-ready"
git push origin main
```

Update all Notion tasks to completed.

---

## TODAY'S SCHEDULE

| Block | Tasks | Time |
|---|---|---|
| Block A | 3 critical fixes | First priority |
| Block B | Design polish across all pages | Second |
| Block C | Trust layer — full feature | Third |
| Block D | Demo verification + build check | Before submitting brief |

---

## DO NOT BUILD TODAY

These are Day 4 and Day 5:
- PDF export (button placeholder stays greyed out)
- Supabase database integration
- Public share links
- Authentication
- Any new incident types

---

## WHAT THE MVP BRIEF MUST SHOW TONIGHT

When you submit the MVP brief, the product must demonstrate:
1. A user can create an incident case in under 2 minutes
2. Evidence canvas shows all uploaded files connected to the incident
3. Trust labels appear automatically on every file
4. AI generates a structured packet with claim-vs-evidence mapping
5. Missing evidence is clearly highlighted
6. The packet looks like an official document worth submitting

Everything in today's build serves one of these 5 demonstration points.

---

*This prompt was written by Claude (Anthropic) based on the Gemini Flash Day 2 audit. Every output will be reviewed by Gemini Flash and audited by Claude. Build accordingly.*
