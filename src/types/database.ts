export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ComplaintCategory =
  | "garbage"
  | "pothole"
  | "drainage"
  | "sewage"
  | "graffiti"
  | "other";

export type ComplaintStatus = "pending" | "in_progress" | "resolved";

export type Severity = "low" | "medium" | "high" | "critical";

export type UserRole = "citizen" | "staff" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  area: string | null;
  created_at: string;
};

export type Complaint = {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  severity: Severity;
  latitude: number;
  longitude: number;
  address: string | null;
  area: string | null;
  image_url: string;
  ai_summary: string | null;
  ai_confidence: number | null;
  ai_spam_score: number | null;
  upvote_count: number;
  is_anonymous: boolean;
  user_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  profiles?: Pick<Profile, "full_name" | "avatar_url"> | null;
  assignee?: Pick<Profile, "full_name" | "avatar_url"> | null;
};

export type StaffMember = Pick<Profile, "id" | "full_name" | "area" | "role">;

export type ComplaintFilters = {
  area?: string;
  category?: ComplaintCategory | "all";
  severity?: Severity | "all";
  status?: ComplaintStatus | "all";
};

export type ComplaintAnalytics = {
  total: number;
  resolvedPercent: number;
  averageResponseHours: number;
  hotspots: Array<{ area: string; count: number }>;
  byStatus: Record<ComplaintStatus, number>;
  byCategory: Record<ComplaintCategory, number>;
};

export type AiAnalysis = {
  category: ComplaintCategory;
  summary: string;
  severity: Severity;
  confidence: number;
  spamScore: number;
  suggestedTitle?: string;
};
