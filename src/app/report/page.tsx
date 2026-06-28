import type { Metadata } from "next";
import { ComplaintForm } from "@/components/complaints/complaint-form";

export const metadata: Metadata = {
  title: "Report an issue",
};

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Report an issue</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Photo evidence and GPS location help the municipality verify and resolve
          complaints faster.
        </p>
      </div>
      <ComplaintForm />
    </main>
  );
}
