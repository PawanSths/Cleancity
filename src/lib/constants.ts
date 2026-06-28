import type { ComplaintCategory, ComplaintStatus, Severity } from "@/types/database";

export const complaintCategories: Array<{
  value: ComplaintCategory;
  label: string;
}> = [
  { value: "garbage", label: "Garbage" },
  { value: "pothole", label: "Pothole" },
  { value: "drainage", label: "Drainage" },
  { value: "sewage", label: "Sewage" },
  { value: "graffiti", label: "Graffiti" },
  { value: "other", label: "Other" },
];

export const complaintStatuses: Array<{
  value: ComplaintStatus;
  label: string;
}> = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export const severityLevels: Array<{ value: Severity; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const cityCenter = {
  latitude: 27.7172,
  longitude: 85.324,
};
