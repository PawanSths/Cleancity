import { getSystemStatus } from "@/lib/system-status";

export async function ServiceStatus() {
  const status = await getSystemStatus();
  const items = [
    {
      label: "Database",
      detail: status.supabase.message,
      ok: status.supabase.configured && status.supabase.databaseReady,
    },
    {
      label: "AI Vision",
      detail: status.ai.message,
      ok: status.ai.configured,
    },
    {
      label: "Maps",
      detail: "OpenStreetMap",
      ok: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <span className={`flex h-2 w-2 rounded-full ${item.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span>
            <span className="block font-medium">{item.label}</span>
            <span className="block text-xs text-muted-foreground">{item.detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
