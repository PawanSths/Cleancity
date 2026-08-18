"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { DynamicMap } from "@/components/maps/dynamic-map";
import { StatusBadge, SeverityBadge } from "@/components/complaints/status-badge";
import { complaintCategories, complaintStatuses, severityLevels } from "@/lib/constants";
import { formatDurationHours, formatPercent } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import { isSupabasePublicConfigured } from "@/lib/public-env";
import { assignComplaint, updateComplaintStatus } from "@/lib/actions";
import type {
  Complaint,
  ComplaintAnalytics,
  ComplaintCategory,
  ComplaintStatus,
  Severity,
  StaffMember,
} from "@/types/database";

type FilterState = {
  area: string;
  category: ComplaintCategory | "all";
  severity: Severity | "all";
  status: ComplaintStatus | "all";
};

export function AdminDashboard({
  initialComplaints,
  analytics,
  staff,
}: {
  initialComplaints: Complaint[];
  analytics: ComplaintAnalytics;
  staff: StaffMember[];
}) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [filters, setFilters] = useState<FilterState>({
    area: "",
    category: "all",
    severity: "all",
    status: "all",
  });

  useEffect(() => {
    if (!isSupabasePublicConfigured) return;
    const supabase = createClient();
    const channel = supabase
      .channel("complaints-admin-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => {
          window.location.reload();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => setComplaints(initialComplaints), [initialComplaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const areaMatch = filters.area
        ? complaint.area?.toLowerCase().includes(filters.area.toLowerCase())
        : true;
      const categoryMatch =
        filters.category === "all" ? true : complaint.category === filters.category;
      const severityMatch =
        filters.severity === "all" ? true : complaint.severity === filters.severity;
      const statusMatch =
        filters.status === "all" ? true : complaint.status === filters.status;
      return areaMatch && categoryMatch && severityMatch && statusMatch;
    });
  }, [complaints, filters]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Reports</p>
          <p className="mt-1 text-2xl font-semibold">{analytics.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="mt-1 text-2xl font-semibold">{formatPercent(analytics.resolvedPercent)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg. Response</p>
          <p className="mt-1 text-2xl font-semibold">{formatDurationHours(analytics.averageResponseHours)}</p>
          <p className="text-xs text-muted-foreground">Resolved reports only</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Top Hotspot</p>
          <p className="mt-1 text-2xl font-semibold">{analytics.hotspots[0]?.area ?? "None"}</p>
          <p className="text-xs text-muted-foreground">{analytics.hotspots[0]?.count ?? 0} reports</p>
        </div>
      </section>

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <UserRound className="h-4 w-4" />
            Manage users
          </Link>
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Reports</h2>
            <p className="text-sm text-muted-foreground">Filter, assign, and update municipal response status.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Filter by area"
            value={filters.area}
            onChange={(event) =>
              setFilters((current) => ({ ...current, area: event.target.value }))
            }
          />
          <SelectNative
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value as ComplaintCategory | "all",
              }))
            }
          >
            <option value="all">All categories</option>
            {complaintCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </SelectNative>
          <SelectNative
            value={filters.severity}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                severity: event.target.value as Severity | "all",
              }))
            }
          >
            <option value="all">All severities</option>
            {severityLevels.map((severity) => (
              <option key={severity.value} value={severity.value}>
                {severity.label}
              </option>
            ))}
          </SelectNative>
          <SelectNative
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as ComplaintStatus | "all",
              }))
            }
          >
            <option value="all">All statuses</option>
            {complaintStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </SelectNative>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Report</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Area</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{complaint.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {complaint.ai_summary ?? complaint.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {complaint.area ?? "Unmapped"}
                  </td>
                  <td className="px-4 py-3 text-sm">{complaint.category}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={complaint.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form action={updateComplaintStatus} className="flex gap-2">
                        <input type="hidden" name="complaintId" value={complaint.id} />
                        <SelectNative name="status" defaultValue={complaint.status}>
                          {complaintStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </SelectNative>
                        <Button type="submit" variant="secondary" size="sm">Save</Button>
                      </form>
                      <form action={assignComplaint} className="flex gap-2">
                        <input type="hidden" name="complaintId" value={complaint.id} />
                        <SelectNative name="staffId" defaultValue={complaint.assigned_to ?? ""}>
                          <option value="">Unassigned</option>
                          {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.full_name ?? "Unnamed staff"}
                            </option>
                          ))}
                        </SelectNative>
                        <Button type="submit" variant="outline" size="sm">Assign</Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Hotspots</h2>
        <p className="text-sm text-muted-foreground">Area concentration based on current complaint volume.</p>
        <div className="rounded-lg border bg-card p-4 space-y-3">
          {analytics.hotspots.map((hotspot) => (
            <div key={hotspot.area} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{hotspot.area}</span>
                <span>{hotspot.count}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${Math.max(
                      8,
                      (hotspot.count / Math.max(1, analytics.hotspots[0]?.count ?? 1)) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Map</h2>
        <DynamicMap complaints={filteredComplaints} heightClassName="h-[400px]" />
      </section>
    </div>
  );
}
