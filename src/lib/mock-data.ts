import { subHours } from "date-fns";
import type { Complaint, ComplaintAnalytics, StaffMember } from "@/types/database";

export const mockStaff: StaffMember[] = [
  { id: "staff-1", full_name: "Asha Shrestha", role: "staff", area: "Thamel" },
  { id: "staff-2", full_name: "Ramesh K.C.", role: "staff", area: "Patan" },
  { id: "staff-3", full_name: "Mina Gurung", role: "staff", area: "Lazimpat" },
];

export const mockComplaints: Complaint[] = [
  {
    id: "demo-1",
    title: "Overflowing roadside garbage",
    description: "Garbage bags have piled up beside the market lane for three days.",
    category: "garbage",
    status: "pending",
    severity: "high",
    latitude: 27.7168,
    longitude: 85.3121,
    address: "Thamel Marg",
    area: "Thamel",
    image_url:
      "https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=1200&auto=format&fit=crop",
    ai_summary: "Large garbage accumulation near a public walking corridor.",
    ai_confidence: 0.91,
    ai_spam_score: 0.04,
    upvote_count: 38,
    is_anonymous: false,
    user_id: "citizen-1",
    assigned_to: "staff-1",
    created_at: subHours(new Date(), 6).toISOString(),
    updated_at: subHours(new Date(), 2).toISOString(),
    resolved_at: null,
    profiles: { full_name: "Citizen reporter", avatar_url: null },
    assignee: { full_name: "Asha Shrestha", avatar_url: null },
  },
  {
    id: "demo-2",
    title: "Broken drain cover",
    description: "Open drain beside a bus stop is dangerous during evening rush.",
    category: "drainage",
    status: "in_progress",
    severity: "critical",
    latitude: 27.6789,
    longitude: 85.3187,
    address: "Pulchowk Road",
    area: "Patan",
    image_url:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
    ai_summary: "Uncovered drainage hazard in a high foot-traffic area.",
    ai_confidence: 0.87,
    ai_spam_score: 0.08,
    upvote_count: 64,
    is_anonymous: true,
    user_id: null,
    assigned_to: "staff-2",
    created_at: subHours(new Date(), 30).toISOString(),
    updated_at: subHours(new Date(), 4).toISOString(),
    resolved_at: null,
    profiles: null,
    assignee: { full_name: "Ramesh K.C.", avatar_url: null },
  },
  {
    id: "demo-3",
    title: "Pothole after water repair",
    description: "A deep pothole is damaging two-wheelers near the intersection.",
    category: "pothole",
    status: "resolved",
    severity: "medium",
    latitude: 27.7242,
    longitude: 85.3313,
    address: "Lazimpat Road",
    area: "Lazimpat",
    image_url:
      "https://images.unsplash.com/photo-1615915825221-f477b54e6bb0?q=80&w=1200&auto=format&fit=crop",
    ai_summary: "Road-surface damage requiring patch repair.",
    ai_confidence: 0.82,
    ai_spam_score: 0.03,
    upvote_count: 21,
    is_anonymous: false,
    user_id: "citizen-2",
    assigned_to: "staff-3",
    created_at: subHours(new Date(), 72).toISOString(),
    updated_at: subHours(new Date(), 20).toISOString(),
    resolved_at: subHours(new Date(), 20).toISOString(),
    profiles: { full_name: "Nabin Rai", avatar_url: null },
    assignee: { full_name: "Mina Gurung", avatar_url: null },
  },
];

export function buildAnalytics(complaints: Complaint[]): ComplaintAnalytics {
  const total = complaints.length;
  const resolved = complaints.filter((complaint) => complaint.status === "resolved");
  const responseHours = resolved
    .filter((complaint) => complaint.resolved_at)
    .map((complaint) => {
      const opened = new Date(complaint.created_at).getTime();
      const closed = new Date(complaint.resolved_at as string).getTime();
      return Math.max(1, (closed - opened) / 36e5);
    });

  const hotspots = Object.entries(
    complaints.reduce<Record<string, number>>((acc, complaint) => {
      const area = complaint.area ?? "Unmapped";
      acc[area] = (acc[area] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    resolvedPercent: total ? (resolved.length / total) * 100 : 0,
    averageResponseHours: responseHours.length
      ? responseHours.reduce((sum, value) => sum + value, 0) / responseHours.length
      : 0,
    hotspots,
    byStatus: {
      pending: complaints.filter((item) => item.status === "pending").length,
      in_progress: complaints.filter((item) => item.status === "in_progress").length,
      resolved: resolved.length,
    },
    byCategory: {
      garbage: complaints.filter((item) => item.category === "garbage").length,
      pothole: complaints.filter((item) => item.category === "pothole").length,
      drainage: complaints.filter((item) => item.category === "drainage").length,
      sewage: complaints.filter((item) => item.category === "sewage").length,
      graffiti: complaints.filter((item) => item.category === "graffiti").length,
      other: complaints.filter((item) => item.category === "other").length,
    },
  };
}
