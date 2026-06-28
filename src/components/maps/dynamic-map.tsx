"use client";

import dynamic from "next/dynamic";
import type { Complaint } from "@/types/database";

const LeafletMap = dynamic(
  () => import("@/components/maps/complaints-map").then((mod) => mod.ComplaintsMap),
  { ssr: false },
);

export function DynamicMap({
  complaints,
  heightClassName,
}: {
  complaints: Complaint[];
  heightClassName?: string;
}) {
  return <LeafletMap complaints={complaints} heightClassName={heightClassName} />;
}
