"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { complaintSchema, statusUpdateSchema } from "@/lib/validations/complaint";
import { isSupabaseConfigured } from "@/lib/env";
import { safeFileName } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { ComplaintStatus } from "@/types/database";

export type ActionState = {
  ok: boolean;
  message: string;
};

const emptyActionState: ActionState = {
  ok: false,
  message: "",
};

export async function createComplaint(
  prevState: ActionState = emptyActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        "Supabase is not configured yet. Add environment variables to enable live submissions.",
    };
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { ok: false, message: "Upload a photo of the issue." };
  }

  if (!image.type.startsWith("image/")) {
    return { ok: false, message: "Only image uploads are accepted." };
  }

  if (image.size > 8 * 1024 * 1024) {
    return { ok: false, message: "Images must be under 8 MB." };
  }

  const parsed = complaintSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    severity: formData.get("severity"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    area: formData.get("area"),
    address: formData.get("address"),
    aiSummary: formData.get("aiSummary"),
    aiConfidence: formData.get("aiConfidence") || undefined,
    aiSpamScore: formData.get("aiSpamScore") || undefined,
    anonymous: formData.get("anonymous") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the complaint details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !parsed.data.anonymous) {
    return {
      ok: false,
      message: "Sign in or enable anonymous reporting before submitting.",
    };
  }

  const filePath = `complaints/${user?.id ?? "anonymous"}/${crypto.randomUUID()}-${safeFileName(
    image.name,
  )}`;
  const { error: uploadError } = await supabase.storage
    .from("complaint-photos")
    .upload(filePath, image, {
      contentType: image.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, message: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("complaint-photos").getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      severity: parsed.data.severity,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      area: parsed.data.area || null,
      address: parsed.data.address || null,
      image_url: publicUrl,
      ai_summary: parsed.data.aiSummary || null,
      ai_confidence: parsed.data.aiConfidence ?? null,
      ai_spam_score: parsed.data.aiSpamScore ?? null,
      is_anonymous: parsed.data.anonymous,
      user_id: parsed.data.anonymous ? null : user?.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Could not create complaint." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/complaints/${data.id}`);
}

export async function upvoteComplaint(complaintId: string) {
  if (!isSupabaseConfigured) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase.from("complaint_upvotes").insert({
    complaint_id: complaintId,
    user_id: user.id,
  });

  if (!error) {
    revalidatePath("/");
    revalidatePath(`/complaints/${complaintId}`);
  }
}

export async function updateComplaintStatus(formData: FormData) {
  const parsed = statusUpdateSchema.safeParse({
    complaintId: formData.get("complaintId"),
    status: formData.get("status"),
  });

  if (!parsed.success || !isSupabaseConfigured) return;

  const supabase = await createClient();
  const patch: { status: ComplaintStatus; resolved_at?: string | null } = {
    status: parsed.data.status,
  };
  if (parsed.data.status === "resolved") patch.resolved_at = new Date().toISOString();
  if (parsed.data.status !== "resolved") patch.resolved_at = null;

  await supabase
    .from("complaints")
    .update(patch)
    .eq("id", parsed.data.complaintId);

  revalidatePath("/admin");
  revalidatePath(`/complaints/${parsed.data.complaintId}`);
}

export async function assignComplaint(formData: FormData) {
  if (!isSupabaseConfigured) return;

  const complaintId = String(formData.get("complaintId") ?? "");
  const staffId = String(formData.get("staffId") ?? "");
  const supabase = await createClient();

  await supabase
    .from("complaints")
    .update({ assigned_to: staffId || null })
    .eq("id", complaintId);

  revalidatePath("/admin");
  revalidatePath(`/complaints/${complaintId}`);
}

export async function updateUserRole(formData: FormData) {
  if (!isSupabaseConfigured) return;

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId || !["citizen", "staff", "admin"].includes(role)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function signOut() {
  if (!isSupabaseConfigured) redirect("/");

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
