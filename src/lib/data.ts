import { buildAnalytics, mockComplaints, mockStaff } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type {
  Complaint,
  ComplaintAnalytics,
  ComplaintFilters,
  StaffMember,
} from "@/types/database";

export async function getComplaints(
  filters: ComplaintFilters = {},
): Promise<Complaint[]> {
  if (!isSupabaseConfigured) {
    return applyFilters(mockComplaints, filters);
  }

  const supabase = await createClient();
  let query = supabase
    .from("complaints")
    .select("*", { count: "exact", head: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.severity && filters.severity !== "all") {
    query = query.eq("severity", filters.severity);
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    return applyFilters(mockComplaints, filters);
  }

  return (data ?? []) as Complaint[];
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  if (!isSupabaseConfigured) {
    return mockComplaints.find((complaint) => complaint.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return mockComplaints.find((complaint) => complaint.id === id) ?? null;
  return data as Complaint;
}

export async function getStaff(): Promise<StaffMember[]> {
  if (!isSupabaseConfigured) return mockStaff;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, area")
    .in("role", ["admin", "staff"])
    .order("full_name");

  if (error) return mockStaff;
  return (data ?? []) as StaffMember[];
}

export async function getAllProfiles() {
  if (!isSupabaseConfigured) return [] as StaffMember[];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, area, created_at")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getAnalytics(): Promise<ComplaintAnalytics> {
  const complaints = await getComplaints();
  return buildAnalytics(complaints);
}

export async function getCurrentUserRole() {
  if (!isSupabaseConfigured) return "admin";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role && ["admin", "staff"].includes(profile.role)) {
      return profile.role;
    }

    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "staff"]);

    if (count === 0) {
      await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);
      return "admin";
    }

    return "citizen";
  } catch {
    return null;
  }
}

function applyFilters(complaints: Complaint[], filters: ComplaintFilters) {
  return complaints.filter((complaint) => {
    const areaMatch = filters.area
      ? complaint.area?.toLowerCase().includes(filters.area.toLowerCase())
      : true;
    const categoryMatch =
      filters.category && filters.category !== "all"
        ? complaint.category === filters.category
        : true;
    const severityMatch =
      filters.severity && filters.severity !== "all"
        ? complaint.severity === filters.severity
        : true;
    const statusMatch =
      filters.status && filters.status !== "all"
        ? complaint.status === filters.status
        : true;

    return areaMatch && categoryMatch && severityMatch && statusMatch;
  });
}
