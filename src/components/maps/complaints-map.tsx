"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import L, { type Map as LeafletMap, type Marker } from "leaflet";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cityCenter } from "@/lib/constants";
import type { Complaint } from "@/types/database";

export function ComplaintsMap({
  complaints,
  heightClassName = "h-[440px]",
}: {
  complaints: Complaint[];
  heightClassName?: string;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const first = complaints[0];
    const map = L.map(containerRef.current, {
      center: first
        ? [first.latitude, first.longitude]
        : [cityCenter.latitude, cityCenter.longitude],
      zoom: first ? 13 : 12,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [complaints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = complaints.map((complaint) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="cleancity-marker">${severityInitial(complaint.severity)}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      return L.marker([complaint.latitude, complaint.longitude], { icon })
        .bindPopup(
          `<strong>${escapeHtml(complaint.title)}</strong><br/><span>${complaint.status.replace(
            "_",
            " ",
          )}</span>`,
        )
        .addTo(map);
    });

    if (complaints.length === 1) {
      map.setView([complaints[0].latitude, complaints[0].longitude], 14);
    } else if (complaints.length > 1) {
      const bounds = L.latLngBounds(
        complaints.map((complaint) => [complaint.latitude, complaint.longitude]),
      );
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
    }
  }, [complaints]);

  if (!complaints.length) {
    return (
      <Card>
        <CardContent className={`${heightClassName} flex items-center justify-center p-4`}>
          <div className="text-center text-sm text-muted-foreground">
            <MapPin className="mx-auto mb-2 h-5 w-5" />
            No mapped complaints yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`${heightClassName} overflow-hidden rounded-lg border bg-secondary`}>
      <div ref={containerRef} className="h-full w-full" />
      <noscript>
        <div className="grid gap-3 p-4">
          {complaints.map((complaint) => (
            <Link
              key={complaint.id}
              href={`/complaints/${complaint.id}`}
              className="rounded-md border bg-background p-3 text-sm"
            >
              <div className="font-medium">{complaint.title}</div>
              <div className="text-muted-foreground">
                {complaint.latitude}, {complaint.longitude}
              </div>
            </Link>
          ))}
        </div>
      </noscript>
    </div>
  );
}

function severityInitial(severity: Complaint["severity"]) {
  return {
    low: "L",
    medium: "M",
    high: "H",
    critical: "!",
  }[severity];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}
