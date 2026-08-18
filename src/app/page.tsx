import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplaintFeed } from "@/components/complaints/complaint-feed";
import { getAnalytics, getComplaints } from "@/lib/data";
import { formatPercent } from "@/lib/utils";
import { DynamicMap } from "@/components/maps/dynamic-map";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [complaints, analytics] = await Promise.all([getComplaints(), getAnalytics()]);
  const recentComplaints = complaints.slice(0, 6);

  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center gap-6">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              Report a problem in your area
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Help your local community identify issues and track their resolution.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/report">
                  Report an Issue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/admin">Municipality dashboard</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Reports" value={analytics.total} />
              <Stat label="Resolved" value={formatPercent(analytics.resolvedPercent)} />
              <Stat label="Hotspots" value={analytics.hotspots.length} />
            </div>
          </div>
          <DynamicMap complaints={complaints} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Nearby complaints</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest citizen reports visible to the public.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/report">New report</Link>
          </Button>
        </div>
        <ComplaintFeed complaints={recentComplaints} />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
