"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Clock, Filter, MapPinned, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { MetricCard } from "@/components/admin/metric-card";
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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total complaints" value={analytics.total} icon={<Activity className="h-5 w-5" />} />
        <MetricCard
          label="Resolved"
          value={formatPercent(analytics.resolvedPercent)}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Average response"
          value={formatDurationHours(analytics.averageResponseHours)}
          icon={<Clock className="h-5 w-5" />}
          hint="Resolved reports only"
        />
        <MetricCard
          label="Top hotspot"
          value={analytics.hotspots[0]?.area ?? "None"}
          icon={<MapPinned className="h-5 w-5" />}
          hint={`${analytics.hotspots[0]?.count ?? 0} reports`}
        />
      </section>

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <UserRound className="h-4 w-4" />
            Manage users
          </Link>
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Live complaint feed
            </CardTitle>
            <CardDescription>
              Filter, assign, and update municipal response status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
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

            <div className="max-h-[640px] space-y-3 overflow-auto pr-1">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="rounded-lg border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{complaint.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {complaint.area ?? "Unmapped"} · {complaint.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge status={complaint.status} />
                      <SeverityBadge severity={complaint.severity} />
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {complaint.ai_summary ?? complaint.description}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <form action={updateComplaintStatus} className="flex gap-2">
                      <input type="hidden" name="complaintId" value={complaint.id} />
                      <SelectNative name="status" defaultValue={complaint.status}>
                        {complaintStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </SelectNative>
                      <Button type="submit" variant="secondary">Save</Button>
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
                      <Button type="submit" variant="outline">Assign</Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <DynamicMap complaints={filteredComplaints} heightClassName="h-[520px]" />
          <Card>
            <CardHeader>
              <CardTitle>Hotspot heatmap</CardTitle>
              <CardDescription>Area concentration based on current complaint volume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
