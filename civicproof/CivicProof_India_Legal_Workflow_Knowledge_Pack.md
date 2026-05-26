# CivicProof — India Legal-Workflow Knowledge Pack

**Purpose:** This file gives Codex / any AI coding agent enough India-specific legal and civic workflow context to generate better CivicProof packets for the MVP.

**Project:** CivicProof  
**MVP categories:**  
1. Road Accident / Vehicle Damage  
2. Civic Issue / Public Infrastructure Complaint  

**Important:** This is product research and workflow guidance, not legal advice. CivicProof should generate **draft packets**, not final legal opinions. Users must verify with police, insurers, advocates, hospitals, BBMP/BWSSB/BESCOM, or the relevant authority.

---

## 1. Why this knowledge pack is needed

CivicProof currently converts evidence such as images, videos, voice notes, and text into an official-ready packet. However, for India, the packet must understand:

- Whether the issue needs a police FIR, a general complaint, insurance claim, MACT claim, or civic grievance.
- What evidence is strong vs weak.
- What documents users should carry.
- What restrictions and disclaimers are required.
- How to avoid false claims or unsupported accusations.
- How to structure the generated complaint in a responsible Indian context.

The product must never claim:

> “This is legally valid”  
> “This FIR will be accepted”  
> “This evidence proves guilt”

It should say:

> “This is a structured draft based on user-provided information and evidence. Please verify with the appropriate authority.”

---

## 2. Current Indian legal context

India’s old criminal-law workflow has been replaced by the new criminal laws:

- **Bharatiya Nyaya Sanhita, 2023 (BNS)**
- **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**
- **Bharatiya Sakshya Adhiniyam, 2023 (BSA)**

The Government of India has stated that BNS, BNSS, and BSA came into force from **1 July 2024**, with specific exceptions around BNS section 106(2).

For CivicProof, the relevant practical law layer is:

- **BNSS Section 173**: information relating to cognizable offences / FIR registration flow.
- **BNSS Section 174**: information about non-cognizable offences.
- **BNS Section 217**: false information to a public servant.

---

## 3. CivicProof decision model

CivicProof should classify a case into one of these output paths:

| User issue | Primary packet type | Typical authority |
|---|---|---|
| Road accident with injury/death | FIR-ready police complaint + hospital/insurance packet | Police station + insurer + MACT later |
| Road accident with hit-and-run | FIR-ready police complaint + CCTV preservation request | Police station / traffic police |
| Road accident with only vehicle/property damage | Police complaint / motor collision report + insurance packet | Police / traffic police + insurer |
| Vehicle insurance own-damage claim | Insurance claim packet | Insurer / garage |
| Pothole or road damage | Civic grievance packet | BBMP / municipal authority |
| Garbage dumping | Civic grievance packet | BBMP SWM / local ward office |
| Broken streetlight | Civic grievance packet | BBMP/BESCOM/local municipal authority depending location |
| Water/sewage issue | Civic grievance packet | BWSSB / municipal authority |
| Public safety hazard | Civic complaint + escalation packet | Municipal authority / police if immediate danger |

---

## 4. Road accident workflow in India

### 4.1 Immediate steps after accident

CivicProof should advise users to:

1. **Ensure safety first**
   - Move to a safe place if possible.
   - Do not obstruct traffic unnecessarily.
   - Call ambulance/emergency services if anyone is injured.

2. **Seek medical help**
   - If there is injury, go to a hospital.
   - Preserve medical records, MLC, prescriptions, discharge summary, bills, and doctor notes.

3. **Capture evidence**
   - Accident location.
   - Vehicle damage.
   - Road condition.
   - Registration number plates.
   - Driver details, if available.
   - Insurance and RC details, if exchanged.
   - Witness contacts.
   - CCTV camera locations nearby.
   - Police/traffic officer details if present.

4. **Report to police when required**
   - Injury, death, hit-and-run, third-party damage, rash/negligent driving, drunk driving, serious dispute, or refusal to share details should be treated as police-report-needed scenarios.
   - Some minor non-injury incidents may result in a police complaint, station diary entry, motor collision report, or insurance documentation rather than a full FIR.

5. **Notify insurer quickly**
   - Most insurers require prompt intimation.
   - Do not repair the vehicle before survey unless insurer permits or emergency repair is required.

---

## 5. FIR vs online complaint vs non-cognizable complaint

### 5.1 FIR / cognizable offence

Under BNSS Section 173, information relating to a cognizable offence can be given orally or by electronic communication to an officer in charge of a police station. Oral information must be reduced to writing and read back. A copy of the recorded information is to be given free of cost to the informant/victim.

CivicProof should use FIR-ready language when:

- There is injury or death.
- The other vehicle fled.
- There is rash/negligent driving.
- There is suspected drunk driving.
- There is threat, assault, or criminal conduct.
- There is serious third-party property damage.
- Police action/investigation is needed.

### 5.2 Refusal to register FIR

Under BNSS Section 173(4), if the officer in charge refuses to record information, the aggrieved person may send the information in writing by post to the Superintendent of Police. If that fails, the person may approach the Magistrate.

CivicProof should generate an escalation draft only as a secondary document:

- First draft: complaint to police station.
- Escalation draft: request to Superintendent of Police / senior officer.
- Optional: note to consult an advocate before Magistrate route.

### 5.3 Non-cognizable issues

BNSS Section 174 covers information about non-cognizable offences. Police may enter the substance of information and refer the informant to a Magistrate. Police generally cannot investigate a non-cognizable case without a Magistrate’s order.

CivicProof should not overstate FIR rights for purely civil or minor non-cognizable issues.

---

## 6. Documents for road accident packet

### 6.1 Must-have for police complaint / FIR-ready packet

CivicProof should ask for:

- Full name, phone number, address of complainant.
- Date and exact/approximate time of accident.
- Exact location with landmark.
- Direction of travel / road side / lane.
- Vehicle registration numbers.
- Vehicle type and color.
- Driver details, if known.
- Owner details, if known.
- Description of incident in sequence.
- Injury details.
- Hospital name and medical documents, if any.
- Photos/videos of:
  - vehicle damage
  - number plate
  - accident spot
  - road condition
  - traffic signal/signage
  - injuries if user consents
- Witness names and phone numbers.
- CCTV locations nearby.
- Police/traffic officer details, if any.
- Insurance policy details, if relevant.

### 6.2 Must-have for insurance claim packet

CivicProof should ask for:

- Insurance policy copy/number.
- RC copy.
- Driving licence of driver at time of accident.
- Claim form.
- Original repair estimate.
- Repair invoice and payment receipt.
- Photos of damage.
- FIR / police complaint if required by insurer, especially for theft, third-party injury/death/property damage, or major accidents.
- Garage/surveyor details.
- Bank details / cancelled cheque if reimbursement is needed.

### 6.3 Must-have for MACT / serious injury/death compensation support packet

CivicProof should not file MACT claims directly. It should generate an organizer packet and advise consulting an advocate.

Collect:

- FIR copy, if any.
- MLC / post-mortem / death report, as applicable.
- Identity documents of claimants/victim.
- Treatment records.
- Original medical bills.
- Disability certificate, if applicable.
- Proof of income.
- Proof of age.
- Insurance policy/cover note of offending vehicle, if available.
- Relationship affidavit/details in death cases.
- Witness details.
- Charge sheet/status, if later available.

---

## 7. Strong evidence for road accident cases

CivicProof should rank evidence as follows.

### Strong evidence

- FIR / police complaint acknowledgment.
- MLC or medical records for injury.
- Timestamped photos/videos.
- Dashcam footage.
- CCTV footage or location of nearby CCTV.
- Vehicle number plate photo.
- Repair estimate and invoice.
- Witness contact details.
- Insurance surveyor report.
- Police spot sketch / panchnama if available.
- GPS/location metadata if available.
- Traffic signal or road signage photo.

### Moderate evidence

- User description.
- Photos without metadata.
- WhatsApp-shared images.
- Approximate location.
- Garage estimate without final invoice.
- Witness name without contact.
- Screenshot of map location.

### Weak evidence

- Only text description.
- AI-polished description without specific facts.
- No date/time.
- No location.
- No vehicle number.
- No original media.
- Edited or cropped images without context.
- Unsupported allegation against a person/authority.

---

## 8. Road accident complaint draft structure

CivicProof should generate complaints in this structure:

```text
To,
The Station House Officer,
[Police Station Name],
[City]

Subject: Complaint regarding road accident / hit-and-run / vehicle damage at [location] on [date]

Respected Sir/Madam,

I, [name], residing at [address], wish to submit this complaint regarding an incident reported by me on [date] at approximately [time] near [location/landmark].

[Chronological facts only.]

The user reports that:
1. [Fact 1]
2. [Fact 2]
3. [Fact 3]

Evidence attached:
1. [Photo/video/document name] - [relevance]
2. [Photo/video/document name] - [relevance]

Missing or not independently verified:
1. [Missing item]
2. [Missing item]

Request:
I request you to kindly record my complaint, examine the available evidence, preserve any nearby CCTV footage if available, and take appropriate action as per law.

Declaration:
The information above is true to the best of my knowledge and based on the evidence currently available.

Name:
Phone:
Address:
Date:
Signature:
```

Use neutral language:

- “The user reports”
- “According to the uploaded evidence”
- “Not independently verified”
- “Request for review/action”

Avoid:

- “The accused is guilty”
- “The authority is responsible”
- “This proves negligence”
- “FIR must be registered” unless clear cognizable facts are present.

---

## 9. Civic complaint workflow in Bengaluru / Karnataka context

For Bengaluru civic issues, CivicProof should support packets for:

- Potholes
- Road damage
- Broken streetlights
- Garbage dumping
- Water leakage / sewage overflow
- Footpath damage
- Drainage issues
- Unsafe public conditions

### 9.1 BBMP / municipal civic issue route

For BBMP-related issues, official routes include:

- BBMP Sahaaya / Sahaaya 2.0 / Namma Bengaluru style complaint systems.
- Fix My Street / pothole reporting systems.
- Swachha Bengaluru / SWM complaint channels for garbage and dumping.
- Ward officials or zone officials.
- BBMP helpline for specific categories.

CivicProof should generate a civic complaint packet that can be copied into:

- BBMP/Sahaaya complaint portal
- Municipal grievance portal
- Email to ward engineer/officer
- Written representation
- WhatsApp/email follow-up if officer contact is known

### 9.2 Civic issue steps

1. Capture photo/video of issue.
2. Capture exact location:
   - GPS pin
   - street name
   - ward/area
   - nearest landmark
3. Add date/time when issue was noticed.
4. Add public impact:
   - safety risk
   - traffic obstruction
   - health hazard
   - repeated complaint
   - school/hospital/residential proximity
5. Submit to correct channel.
6. Save complaint number / acknowledgment.
7. Follow up after reasonable time.
8. Escalate with previous complaint number if unresolved.

---

## 10. Documents/evidence for civic complaint packet

### Must-have

- Clear photo/video of issue.
- Exact location / GPS pin.
- Landmark.
- Date/time.
- Description of issue.
- Category:
  - pothole
  - garbage
  - streetlight
  - sewage
  - footpath
  - drainage
  - public hazard
- Public impact.
- Complainant name and phone/email if submission requires it.

### Strong additional evidence

- Multiple angles.
- Wide shot showing location.
- Close shot showing damage.
- Size/depth estimate for pothole.
- Night photo for streetlight issue.
- Repeated complaint numbers.
- Previous unresolved screenshots.
- Nearby school/hospital/residential impact.
- Witness/resident support.

---

## 11. Civic complaint draft structure

```text
Subject: Civic complaint regarding [issue type] at [location]

Respected Sir/Madam,

I wish to report a civic issue at [exact location/landmark].

Issue category:
[Road damage / pothole / garbage dumping / broken streetlight / sewage overflow / etc.]

Description:
[Short factual description]

Public impact:
[Safety risk / inconvenience / health risk / traffic risk]

Evidence attached:
1. [Photo/video name] - [relevance]
2. [Location screenshot] - [relevance]

Request:
I request the concerned department/ward official to inspect the location and take corrective action at the earliest. Kindly provide a complaint/reference number and update the status after action is taken.

Name:
Phone:
Location:
Date:
```

If unresolved:

```text
Subject: Follow-up / escalation for unresolved civic complaint [Complaint ID]

I had raised a complaint on [date] regarding [issue] at [location]. The complaint/reference number is [ID]. The issue remains unresolved as of [date]. I request escalation to the concerned ward/zone official and an update on expected resolution.
```

---

## 12. Restrictions and safety rules

CivicProof must enforce these rules:

### 12.1 No legal advice claim

Always include:

> CivicProof provides documentation assistance only. It does not provide legal advice or guarantee official acceptance.

### 12.2 No false certainty

Do not write:

- “This is definitely illegal”
- “You will get compensation”
- “Police must register FIR”
- “The other person is guilty”
- “This evidence proves negligence”

Use:

- “May require police review”
- “Appears relevant”
- “User reports”
- “Not independently verified”
- “Consult relevant authority/advocate for legal action”

### 12.3 False information warning

Because false information to a public servant can lead to legal consequences under BNS, CivicProof should show a declaration:

```text
I confirm that the information and evidence I uploaded is accurate to the best of my knowledge. I understand that false information or fabricated evidence may have legal consequences.
```

### 12.4 AI-generated/fake evidence warning

CivicProof should not certify authenticity.

Each file should be labeled:

- User-provided
- Not independently verified
- Metadata unavailable, if metadata is missing
- Possibly edited, if metadata suggests export/editing
- Hash generated after upload, if available

---

## 13. Evidence authenticity layer

### MVP implementation

For each uploaded file:

1. Calculate SHA-256 hash.
2. Store file name, size, MIME type, upload timestamp.
3. If possible, extract image EXIF:
   - capture time
   - GPS
   - device make/model
4. Label missing metadata as:
   - “Metadata unavailable”
   - not “fake”
5. Add note:
   - “Many apps remove metadata, so missing metadata does not prove manipulation.”

### Do not build deepfake detection in MVP

Deepfake detection is unreliable, potentially expensive, and not necessary for hackathon MVP. Instead, use transparency labels and evidence mapping.

---

## 14. App logic rules for Codex

### Case classification

```ts
type PacketPath =
  | "police_fir_ready"
  | "police_general_complaint"
  | "insurance_claim"
  | "mact_support"
  | "civic_grievance"
  | "civic_followup_escalation";
```

### Recommended routing logic

```ts
if (incidentType === "road_accident") {
  if (hasInjury || hasDeath || hitAndRun || thirdPartyDamage || suspectedRashDriving) {
    packetPath = "police_fir_ready";
  } else {
    packetPath = "police_general_complaint";
  }

  if (needsInsurance) {
    alsoGenerate = "insurance_claim";
  }

  if (hasSeriousInjury || hasDeath) {
    addNote = "Consult advocate for MACT claim support.";
  }
}

if (incidentType === "civic_issue") {
  packetPath = "civic_grievance";

  if (previousComplaintId && unresolved) {
    alsoGenerate = "civic_followup_escalation";
  }
}
```

### Evidence completeness rule

```ts
const completenessScore = calculateEvidenceStrength(caseDetails, evidenceItems);
```

Do not use AI for the final score. Use rules.

---

## 15. Prompt instructions for packet generation

System instruction for AI packet generation:

```text
You are CivicProof, an evidence-to-action documentation assistant for India.
You do not provide legal advice.
You do not verify the truth of evidence.
You generate structured draft packets from user-provided facts and uploaded evidence metadata.
Never fabricate facts.
Use "the user reports" for claims.
Mark missing or unsupported details clearly.
Generate practical, official-style language that the user can edit.
Return valid JSON only.
```

User/context payload should include:

- incident type
- packet path
- location
- date/time
- description
- injuries yes/no
- death yes/no
- hit-and-run yes/no
- third-party damage yes/no
- insurance needed yes/no
- previous complaint ID
- evidence metadata
- retrieved checklist/template context
- evidence score
- missing fields

Expected output:

```json
{
  "packetPath": "police_fir_ready | police_general_complaint | insurance_claim | mact_support | civic_grievance | civic_followup_escalation",
  "incidentSummary": "",
  "timeline": [],
  "evidenceTable": [],
  "claimEvidenceMap": [],
  "missingEvidence": [],
  "complaintDraft": "",
  "insuranceOrCivicDraft": "",
  "followUpChecklist": [],
  "userWarnings": [],
  "disclaimer": ""
}
```

---

## 16. Must-have source references for generated packet

CivicProof should not expose heavy legal citations in every user packet, but internally it should know:

- BNSS Section 173: cognizable offence information/FIR flow.
- BNSS Section 174: non-cognizable information flow.
- BNS Section 217: false information to public servant.
- IRDAI motor insurance claim document basics.
- MACT document basics for serious injury/death.
- BBMP Sahaaya / Fix My Street / Swachha Bengaluru complaint channels for Bengaluru civic issues.

---

## 17. Source list used for this knowledge pack

Use these as internal references for the AI agent and README research notes.

### Indian criminal law / FIR workflow

1. Government PIB: New criminal laws came into force from 1 July 2024  
   https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2039055

2. India Code: Bharatiya Nagarik Suraksha Sanhita, 2023 PDF  
   https://www.indiacode.nic.in/bitstream/123456789/20335/1/a2023-46.pdf

3. Meghalaya Police: FIR explanation and process  
   https://megpolice.gov.in/first-information-report-fir

4. Nagpur Police online complaint disclaimer showing accidents/cognizable crimes require police station FIR route  
   https://nagpurpolice.gov.in/fir.html

5. NCRB / BNS Section 217 false information to public servant  
   https://cytrain.ncrb.gov.in/staticpage/web_pages/ChaptersBNS.html

### Motor insurance / MACT

6. IRDAI motor insurance FAQ  
   https://irdai.gov.in/web/policy-holder/motor-insurance

7. Delhi District Court MACT document list  
   https://session.delhi.gov.in/session/motor-accident-claims-tribunals

### Bengaluru civic complaint routes

8. BBMP Solid Waste Management complaint channels  
   https://apps.bbmpgov.in/SWM/Home/Forms/Publicaboutus.aspx?Page=Contact

9. BBMP IT Department: Fix My Street overview  
   https://site.bbmp.gov.in/departmentwebsites/BBMPIT/fms.html

10. BBMP mobile apps page: Sahaaya 2.0  
    https://site.bbmp.gov.in/departmentwebsites/BBMPIT/mobileapps.html

11. BBMP Fix Pothole app listing  
    https://play.google.com/store/apps/details?id=com.indigo.bbmp.fixpothole&hl=en_IN

---

## 18. Final instruction for Codex

Build CivicProof’s legal/civic intelligence layer as a **routing + checklist + draft-generation system**, not as a lawyer chatbot.

The system should:

1. Ask the right missing questions.
2. Identify the correct packet path.
3. Organize user-provided evidence.
4. Map claims to evidence.
5. Warn about missing proof.
6. Generate responsible drafts.
7. Export a PDF.
8. Avoid making unsupported legal conclusions.

The product should feel like:

> A responsible documentation assistant for Indian civic and accident incidents.

Not:

> A legal authority, FIR generator, or truth verification system.
