import { DEMO_CASE, DEMO_EVIDENCE, DEMO_PACKET } from "@/lib/demoCase";
import type { EvidenceItem, GeneratedPacket, IncidentCase } from "@/types";

const CASES_KEY = "civicproof_cases";
const EVIDENCE_KEY = "civicproof_evidence";
const PACKETS_KEY = "civicproof_packets";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readItems<T>(key: string): T[] {
  try {
    if (!isBrowser()) {
      return [];
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems<T>(key: string, items: T[]): void {
  try {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    return;
  }
}

export function getAllCases(): IncidentCase[] {
  try {
    const savedCases = readItems<IncidentCase>(CASES_KEY).filter((item) => item.id !== DEMO_CASE.id);
    return [DEMO_CASE, ...savedCases];
  } catch {
    return [DEMO_CASE];
  }
}

export function getCaseById(id: string): IncidentCase | null {
  try {
    return getAllCases().find((item) => item.id === id) ?? null;
  } catch {
    return null;
  }
}

export function saveCase(c: IncidentCase): void {
  try {
    if (c.id === DEMO_CASE.id) {
      return;
    }

    const cases = readItems<IncidentCase>(CASES_KEY).filter((item) => item.id !== c.id && item.id !== DEMO_CASE.id);
    writeItems(CASES_KEY, [c, ...cases]);
  } catch {
    return;
  }
}

export function updateCase(id: string, updates: Partial<IncidentCase>): void {
  try {
    if (id === DEMO_CASE.id) {
      return;
    }

    const cases = readItems<IncidentCase>(CASES_KEY);
    const updatedCases = cases.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item,
    );
    writeItems(CASES_KEY, updatedCases);
  } catch {
    return;
  }
}

export function deleteCase(id: string): void {
  try {
    if (id === DEMO_CASE.id) {
      return;
    }

    const cases = readItems<IncidentCase>(CASES_KEY).filter((item) => item.id !== id);
    const evidence = readItems<EvidenceItem>(EVIDENCE_KEY).filter((item) => item.caseId !== id);
    const packets = readItems<GeneratedPacket>(PACKETS_KEY).filter((item) => item.caseId !== id);

    writeItems(CASES_KEY, cases);
    writeItems(EVIDENCE_KEY, evidence);
    writeItems(PACKETS_KEY, packets);
  } catch {
    return;
  }
}

export function getEvidenceForCase(caseId: string): EvidenceItem[] {
  try {
    if (caseId === DEMO_CASE.id) {
      return DEMO_EVIDENCE;
    }

    return readItems<EvidenceItem>(EVIDENCE_KEY).filter((item) => item.caseId === caseId);
  } catch {
    return [];
  }
}

export function saveEvidence(item: EvidenceItem): void {
  try {
    const persistedItem = item.fileUrl.startsWith("blob:") ? { ...item, fileUrl: "" } : item;
    const evidence = readItems<EvidenceItem>(EVIDENCE_KEY).filter((savedItem) => savedItem.id !== item.id);
    writeItems(EVIDENCE_KEY, [persistedItem, ...evidence]);
  } catch {
    return;
  }
}

export function removeEvidence(id: string): void {
  try {
    const evidence = readItems<EvidenceItem>(EVIDENCE_KEY).filter((item) => item.id !== id);
    writeItems(EVIDENCE_KEY, evidence);
  } catch {
    return;
  }
}

export function getPacketForCase(caseId: string): GeneratedPacket | null {
  try {
    if (caseId === DEMO_CASE.id) {
      return DEMO_PACKET;
    }

    return readItems<GeneratedPacket>(PACKETS_KEY).find((item) => item.caseId === caseId) ?? null;
  } catch {
    return null;
  }
}

export function savePacket(packet: GeneratedPacket): void {
  try {
    const packets = readItems<GeneratedPacket>(PACKETS_KEY).filter((item) => item.id !== packet.id);
    writeItems(PACKETS_KEY, [packet, ...packets]);
  } catch {
    return;
  }
}

export function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    const timestamp = Date.now().toString(36);
    const randomA = Math.random().toString(36).slice(2, 10);
    const randomB = Math.random().toString(36).slice(2, 10);
    return `${timestamp}-${randomA}-${randomB}`;
  } catch {
    return `id-${Date.now()}`;
  }
}
