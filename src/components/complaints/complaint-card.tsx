import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, SeverityBadge } from "@/components/complaints/status-badge";
import type { Complaint } from "@/types/database";

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Link href={`/complaints/${complaint.id}`} className="block">
      <Card className="overflow-hidden hover:border-primary/50 hover:shadow-md">
        <div className="relative h-44 w-full bg-secondary">
          <Image
            src={complaint.image_url}
            alt={complaint.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
            quality={75}
          />
        </div>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={complaint.status} />
            <SeverityBadge severity={complaint.severity} />
          </div>
          <div>
            <h3 className="line-clamp-2 font-semibold">{complaint.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {complaint.ai_summary ?? complaint.description}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {complaint.area ?? "Mapped issue"}
            </span>
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3.5 w-3.5" />
              {complaint.upvote_count}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
