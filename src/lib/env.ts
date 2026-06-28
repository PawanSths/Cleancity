import { publicEnv, isSupabasePublicConfigured } from "@/lib/public-env";

export const env = {
  supabaseUrl: publicEnv.supabaseUrl,
  supabaseAnonKey: publicEnv.supabaseAnonKey,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiVisionModel: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
  aiApiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
  aiApiBaseUrl: process.env.AI_API_BASE_URL ?? "",
  aiVisionModel: process.env.AI_VISION_MODEL || process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
  appUrl: publicEnv.appUrl,
};

export const isSupabaseConfigured = isSupabasePublicConfigured;

export const isAdminSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);
