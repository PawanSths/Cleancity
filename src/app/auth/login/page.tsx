import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to CleanCity</CardTitle>
          <CardDescription>
            Track your reports, upvote nearby issues, and manage municipal work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={params.next ?? "/"} />
        </CardContent>
      </Card>
    </main>
  );
}
