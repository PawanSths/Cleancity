import { publicEnv, isSupabasePublicConfigured } from "@/lib/public-env";

export const env = {
  supabaseUrl: publicEnv.supabaseUrl,
  supabaseAnonKey: publicEnv.supabaseAnonKey,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiVisionModel: process.env.GEMINI_VISION_MODEL ?? "gemini-2.0-flash",
  appUrl: publicEnv.appUrl,
};

export const isSupabaseConfigured = isSupabasePublicConfigured;

export const isAdminSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);
