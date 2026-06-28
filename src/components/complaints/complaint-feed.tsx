import { AlertCircle } from "lucide-react";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Complaint } from "@/types/database";

export function ComplaintFeed({ complaints }: { complaints: Complaint[] }) {
  if (!complaints.length) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-5 w-5" />}
        title="No complaints found"
        description="Try changing filters or submit the first report in this area."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}
    </div>
  );
}
