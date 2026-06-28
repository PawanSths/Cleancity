"use client";

import { useTransition } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upvoteComplaint } from "@/lib/actions";
import { isSupabasePublicConfigured } from "@/lib/public-env";

export function UpvoteButton({
  complaintId,
  count,
}: {
  complaintId: string;
  count: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        if (!isSupabasePublicConfigured) {
          toast.info("Demo mode: connect Supabase to persist upvotes.");
          return;
        }
        startTransition(() => upvoteComplaint(complaintId));
      }}
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
      Upvote {count}
    </Button>
  );
}
