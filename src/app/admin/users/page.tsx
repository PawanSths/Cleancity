import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProfiles, getCurrentUserRole } from "@/lib/data";
import { updateUserRole } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Manage users",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [profiles, role] = await Promise.all([
    getAllProfiles(),
    getCurrentUserRole(),
  ]);

  if (!role || role !== "admin") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h1 className="text-3xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">
          Only admins can manage user roles.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold">Manage users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promote users to staff or admin roles.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-5 w-5" />
            All users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Area</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <span className="font-medium">
                          {profile.full_name ?? "Unnamed"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            profile.role === "admin"
                              ? "inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              : profile.role === "staff"
                                ? "inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-200"
                                : "inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {profile.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {profile.area ?? "—"}
                      </td>
                      <td className="py-3">
                        <form action={updateUserRole} className="flex gap-2">
                          <input type="hidden" name="userId" value={profile.id} />
                          <select
                            name="role"
                            defaultValue={profile.role}
                            className="rounded-md border bg-background px-2 py-1 text-xs"
                          >
                            <option value="citizen">citizen</option>
                            <option value="staff">staff</option>
                            <option value="admin">admin</option>
                          </select>
                          <Button type="submit" size="sm" variant="secondary">
                            Save
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
