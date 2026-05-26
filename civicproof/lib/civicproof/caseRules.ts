import type { PacketPath } from "@/types/civicproof";

export const CASE_RULES: Record<PacketPath, string[]> = {
  police_general_complaint: [
    "location",
    "incidentDate",
    "incidentTime",
    "description",
    "vehicle_damage_photo_or_description",
    "vehicle_number_or_description",
  ],
  police_fir_ready: [
    "location",
    "incidentDate",
    "incidentTime",
    "description",
    "injury_or_hit_and_run_or_serious_damage",
    "vehicle_number_or_description",
    "witness_or_cctv_info",
    "medical_document_if_injury",
  ],
  insurance_claim: [
    "insurance_claim_needed",
    "damage_photos",
    "repair_estimate_or_bill",
    "rc_or_vehicle_details",
    "driving_license_or_driver_details",
    "police_complaint_if_required",
  ],
  mact_support_note: [
    "serious_injury_or_death",
    "police_complaint_or_fir",
    "medical_records",
    "identity_details",
    "income_or_damage_support",
    "witness_or_cctv_info",
  ],
  civic_grievance: ["civic_issue_type", "location", "landmark", "date_noticed", "photo_or_video", "public_impact"],
  civic_followup_escalation: [
    "previous_complaint_id",
    "previous_complaint_date",
    "current_status_description",
    "updated_photo_or_video",
    "location",
  ],
};

export function getChecklistForPacketPath(path: PacketPath): string[] {
  return CASE_RULES[path] ?? [];
}
