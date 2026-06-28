import Link from "next/link";
import { ArrowRight, BellRing, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComplaintFeed } from "@/components/complaints/complaint-feed";
import { ServiceStatus } from "@/components/layout/service-status";
import { DynamicMap } from "@/components/maps/dynamic-map";
import { getAnalytics, getComplaints } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [complaints, analytics] = await Promise.all([getComplaints(), getAnalytics()]);
  const recentComplaints = complaints.slice(0, 6);

  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm text-muted-foreground">
              <BellRing className="h-4 w-4 text-primary" />
              Real-time civic issue reporting
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                CleanCity
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Citizens report sanitation, road, and drainage problems with photos and
                GPS. Municipal teams triage, assign, and resolve complaints from one
                live dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/report">
                  Report an issue
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
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            icon={<MapPinned className="h-5 w-5" />}
            title="GPS-first reporting"
            text="Every complaint is tied to a map location so crews can route field work quickly."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="AI-assisted triage"
            text="Vision analysis suggests category, severity, summary, and spam risk before dispatch."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure operations"
            text="Supabase Auth, row-level security, protected admin routes, and upload validation."
          />
        </div>

        <ServiceStatus />

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
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
