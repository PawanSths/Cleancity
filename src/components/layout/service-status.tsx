import { Brain, Database, MapPinned, TriangleAlert } from "lucide-react";
import { getSystemStatus } from "@/lib/system-status";

export async function ServiceStatus() {
  const status = await getSystemStatus();
  const items = [
    {
      label: "Supabase",
      detail: status.supabase.message,
      ok: status.supabase.configured && status.supabase.databaseReady,
      icon: <Database className="h-4 w-4" />,
    },
    {
      label: "AI Vision",
      detail: status.ai.message,
      ok: status.ai.configured,
      icon: <Brain className="h-4 w-4" />,
    },
    {
      label: "Maps",
      detail: "OpenStreetMap, no card needed",
      ok: true,
      icon: <MapPinned className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
        >
          <span
            className={
              item.ok
                ? "rounded-md bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                : "rounded-md bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
            }
          >
            {item.ok ? item.icon : <TriangleAlert className="h-4 w-4" />}
          </span>
          <span>
            <span className="block font-medium">{item.label}</span>
            <span className="block text-xs text-muted-foreground">{item.detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
