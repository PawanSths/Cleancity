import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAnalytics, getComplaints, getCurrentUserRole, getStaff } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [complaints, analytics, staff, role] = await Promise.all([
    getComplaints(),
    getAnalytics(),
    getStaff(),
    getCurrentUserRole(),
  ]);

  if (!role) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Sign in required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sign in with an admin or staff account to manage municipal complaints.
            </p>
            <Button asChild>
              <Link href="/auth/login?next=/admin">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!["admin", "staff"].includes(role)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Admin access required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your account does not have admin or staff privileges. Contact your
              municipality to request access.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Municipality dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Live triage, assignment, analytics, and hotspot monitoring for field response.
        </p>
      </div>
      <AdminDashboard
        initialComplaints={complaints}
        analytics={analytics}
        staff={staff}
      />
    </main>
  );
}
