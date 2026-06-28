import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, SeverityBadge } from "@/components/complaints/status-badge";
import { UpvoteButton } from "@/components/complaints/upvote-button";
import { DynamicMap } from "@/components/maps/dynamic-map";
import { getComplaint } from "@/lib/data";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border">
            <Image
              src={complaint.image_url}
              alt={complaint.title}
              fill
              priority
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
            />
          </div>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={complaint.status} />
                <SeverityBadge severity={complaint.severity} />
              </div>
              <CardTitle className="text-2xl">{complaint.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-muted-foreground">{complaint.description}</p>
              {complaint.ai_summary ? (
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-medium">AI summary</p>
                  <p className="mt-1 text-sm text-muted-foreground">{complaint.ai_summary}</p>
                </div>
              ) : null}
              <Separator />
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {complaint.address ?? complaint.area ?? "Mapped location"}
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" />
                  {complaint.is_anonymous
                    ? "Anonymous reporter"
                    : complaint.profiles?.full_name ?? "Citizen reporter"}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Timeline status={complaint.status} />
              <UpvoteButton complaintId={complaint.id} count={complaint.upvote_count} />
            </CardContent>
          </Card>
          <DynamicMap complaints={[complaint]} heightClassName="h-80" />
        </aside>
      </div>
    </main>
  );
}

function Timeline({ status }: { status: "pending" | "in_progress" | "resolved" }) {
  const steps = ["pending", "in_progress", "resolved"] as const;
  const activeIndex = steps.indexOf(status);

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-sm">
          <span
            className={`h-3 w-3 rounded-full ${
              index <= activeIndex ? "bg-primary" : "bg-secondary"
            }`}
          />
          <span className={index <= activeIndex ? "font-medium" : "text-muted-foreground"}>
            {step === "pending"
              ? "Pending"
              : step === "in_progress"
                ? "In Progress"
                : "Resolved"}
          </span>
        </li>
      ))}
    </ol>
  );
}
