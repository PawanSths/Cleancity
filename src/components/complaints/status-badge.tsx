import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus, Severity } from "@/types/database";

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const label = {
    pending: "Pending",
    in_progress: "In Progress",
    resolved: "Resolved",
  }[status];

  const className = {
    pending: "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    in_progress: "border-sky-300 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
    resolved: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  }[status];

  return <Badge className={className} variant="outline">{label}</Badge>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const className = {
    low: "border-slate-300 bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    medium: "border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    high: "border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
    critical: "border-red-300 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  }[severity];

  return <Badge className={className} variant="outline">{severity}</Badge>;
}
