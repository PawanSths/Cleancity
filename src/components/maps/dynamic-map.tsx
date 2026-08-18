"use client";

import { useEffect, useState } from "react";
import type { Complaint } from "@/types/database";

export function DynamicMap({
  complaints,
  heightClassName = "h-[440px]",
}: {
  complaints: Complaint[];
  heightClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [MapComponent, setMapComponent] = useState<
    React.ComponentType<{
      complaints: Complaint[];
      heightClassName?: string;
    }> | null
  >(null);

  useEffect(() => {
    setMounted(true);
    import("@/components/maps/complaints-map").then((m) => {
      const Comp = m.ComplaintsMap;
      setMapComponent(() => Comp);
    });
  }, []);

  if (!mounted || !MapComponent) {
    return (
      <div
        className={`${heightClassName} overflow-hidden rounded-lg border bg-secondary`}
      />
    );
  }

  return <MapComponent complaints={complaints} heightClassName={heightClassName} />;
}
