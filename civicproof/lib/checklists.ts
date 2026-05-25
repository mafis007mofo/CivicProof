import civicIssueChecklist from "@/data/checklists/civic-issue-checklist.json";
import potholeDamageChecklist from "@/data/checklists/pothole-damage-checklist.json";
import roadAccidentChecklist from "@/data/checklists/road-accident-checklist.json";
import type { IncidentType } from "@/types";

export const POTHOLE_CHECKLIST: string[] = potholeDamageChecklist;

export function getChecklistForCase(incidentType: IncidentType): string[] {
  if (incidentType === "road_accident") {
    return roadAccidentChecklist;
  }

  return civicIssueChecklist;
}
