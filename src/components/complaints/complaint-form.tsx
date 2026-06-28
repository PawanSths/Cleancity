"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Camera, Crosshair, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { complaintCategories, cityCenter, severityLevels } from "@/lib/constants";
import { createComplaint, type ActionState } from "@/lib/actions";
import type { AiAnalysis } from "@/types/database";

const initialState: ActionState = { ok: false, message: "" };

export function ComplaintForm() {
  const [state, formAction] = useActionState(createComplaint, initialState);
  const [location, setLocation] = useState({
    latitude: cityCenter.latitude,
    longitude: cityCenter.longitude,
  });
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (state.message) toast.error(state.message);
  }, [state.message]);

  const confidence = useMemo(
    () => Math.round((analysis?.confidence ?? 0) * 100),
    [analysis],
  );

  async function analyzeSelectedImage(file: File) {
    setAnalyzing(true);
    setAiError(null);
    setAnalysis(null);
    const data = new FormData();
    data.set("image", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        const errMsg = result.error ?? "Image analysis failed.";
        setAiError(errMsg);
        throw new Error(errMsg);
      }
      setAnalysis(result as AiAnalysis);
      toast.success("AI analysis added to the report.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Report a civic issue</CardTitle>
          <CardDescription>
            Add a photo, a precise location, and enough context for municipal staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="image">Photo</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-52 w-full items-center justify-center rounded-lg border border-dashed bg-secondary/50 text-sm hover:border-primary"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Selected complaint preview"
                  className="h-56 w-full rounded-lg object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                  Upload issue photo
                </span>
              )}
            </button>
            <Input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setPreview(URL.createObjectURL(file));
                void analyzeSelectedImage(file);
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                minLength={6}
                maxLength={120}
                placeholder="Overflowing garbage near bus stop"
                defaultValue={analysis?.suggestedTitle ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <SelectNative id="category" name="category" defaultValue={analysis?.category ?? "garbage"}>
                {complaintCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <SelectNative id="severity" name="severity" defaultValue={analysis?.severity ?? "medium"}>
                {severityLevels.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                minLength={12}
                maxLength={1000}
                placeholder="Describe what happened, how long it has been there, and any immediate hazard."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input id="area" name="area" placeholder="Ward, neighborhood, or landmark" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Street or closest place" />
            </div>
          </div>

          <input type="hidden" name="latitude" value={location.latitude} />
          <input type="hidden" name="longitude" value={location.longitude} />
          <input type="hidden" name="aiSummary" value={analysis?.summary ?? ""} />
          <input type="hidden" name="aiConfidence" value={analysis?.confidence ?? ""} />
          <input type="hidden" name="aiSpamScore" value={analysis?.spamScore ?? ""} />

          <div className="flex flex-col gap-3 rounded-lg bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-sm">
              <Crosshair className="h-4 w-4 text-primary" />
              {location.latitude}, {location.longitude}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigator.geolocation?.getCurrentPosition((position) =>
                  setLocation({
                    latitude: Number(position.coords.latitude.toFixed(6)),
                    longitude: Number(position.coords.longitude.toFixed(6)),
                  }),
                );
              }}
            >
              Refresh GPS
            </Button>
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
            <input name="anonymous" type="checkbox" className="mt-1 h-4 w-4 accent-primary" />
            <span>
              Submit anonymously
              <span className="block text-muted-foreground">
                Your report is public, but your profile will not be attached.
              </span>
            </span>
          </label>

          <SubmitButton />
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI review
            </CardTitle>
            <CardDescription>
              Vision analysis helps route the report and prioritize response.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing image
              </div>
            ) : aiError ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {aiError}
                </p>
                <p className="text-xs text-muted-foreground">
                  Set up a vision-capable AI provider in .env.local or submit the report for manual review.
                </p>
              </div>
            ) : analysis ? (
              <>
                <div className="rounded-lg bg-secondary p-4 text-sm">{analysis.summary}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span>{confidence}%</span>
                  </div>
                  <Progress value={confidence} />
                </div>
                {analysis.spamScore > 0.7 ? (
                  <p className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    This image may be unrelated or fake.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upload an image to auto-detect category, summary, severity, and spam risk.
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Submit complaint
    </Button>
  );
}
