# CivicProof

CivicProof is an AI-powered evidence-to-action platform. It helps users organize photos, videos, and descriptions of real incidents (such as road accidents or civic issues like potholes) and automatically generates structured, official-ready complaint packets.

## Features Built So Far (Day 1-3)

* **Landing Page:** Animated, responsive landing page with radial glows, interactive problem cards, and a step-by-step feature breakdown.
* **Dashboard Workspace:** A central hub to view all documented cases, displaying total cases, generated packets, average evidence scores, and score indicator strips.
* **Incident Intake Form (New Case):** A streamlined 2-step form to capture incident type (Road Accident or Civic Issue), details, time, location, and a formal user declaration before submission.
* **Case Detail View:** A comprehensive view for each case, including:
  * Case metadata, file size calculations, and a detailed score breakdown table.
  * **Evidence Canvas:** A dynamic SVG-based node map that visually links user claims with uploaded evidence using a responsive `ResizeObserver` layout.
  * **Evidence Management:** Upload and review evidence files with trust labels.
* **AI Packet Generation:** Integration with OpenAI (`gpt-4o-mini`) to analyze evidence and generate structured action packets (complaint drafts, timeline, missing evidence checklist). Features a robust fallback mechanism if the API key is missing or invalid.
* **Packet Preview:** Official-document style preview of the generated packet, complete with status pills, copy-to-clipboard functionality with line numbers, animated score count-up, and an interactive follow-up checklist.
* **Dark Mode & Premium UI:** Built with Tailwind CSS, utilizing custom CSS variables, glassmorphism, shimmer effects, and smooth animations without hardcoded colors.

## Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript (Strict Mode, zero `any` types)
* **Styling:** Tailwind CSS (with CSS variables)
* **Components:** shadcn/ui & lucide-react
* **Storage:** LocalStorage (for client-side persistence)
* **AI:** OpenAI API (`gpt-4o-mini`)
* **Fonts:** Syne (headings), DM Sans (body), JetBrains Mono (code/IDs)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your environment variables by creating a `.env.local` file in the root directory. Add your OpenAI API key (if you don't have one, the app will gracefully use a fallback demo packet):

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
