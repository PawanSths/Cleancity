"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/browser";
import { isSupabasePublicConfigured, publicEnv } from "@/lib/public-env";

export function LoginForm({ next = "/" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"password" | "magic" | "google" | null>(null);

  async function signInWithPassword() {
    if (!isSupabasePublicConfigured) {
      toast.error("Add Supabase environment variables to enable auth.");
      return;
    }
    if (!password) { toast.error("Enter your password."); return; }
    setLoading("password");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(null);
    if (error) toast.error(error.message);
    else window.location.href = next;
  }

  async function signInWithMagicLink() {
    if (!isSupabasePublicConfigured) {
      toast.error("Add Supabase environment variables to enable auth.");
      return;
    }
    setLoading("magic");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${publicEnv.appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(null);
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your inbox.");
  }

  async function signInWithGoogle() {
    if (!isSupabasePublicConfigured) {
      toast.error("Add Supabase environment variables to enable auth.");
      return;
    }
    setLoading("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${publicEnv.appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setLoading(null);
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <Button
        className="w-full"
        onClick={signInWithPassword}
        disabled={!email || !password || !!loading}
      >
        {loading === "password" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        Sign in with password
      </Button>
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>
      <Button
        className="w-full"
        variant="outline"
        onClick={signInWithMagicLink}
        disabled={!email || !!loading}
      >
        {loading === "magic" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        Send magic link
      </Button>
      <Button
        className="w-full"
        variant="outline"
        onClick={signInWithGoogle}
        disabled={!!loading}
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
      {!isSupabasePublicConfigured ? (
        <p className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Demo mode is active. Configure Supabase to enable auth.
        </p>
      ) : null}
    </div>
  );
}
