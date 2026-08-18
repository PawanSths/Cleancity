import { env, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type SystemStatus = {
  supabase: {
    configured: boolean;
    databaseReady: boolean;
    message: string;
  };
  ai: {
    configured: boolean;
    provider: string;
    model: string;
    message: string;
  };
  maps: {
    provider: "OpenStreetMap";
    tokenRequired: false;
    message: string;
  };
};

export async function getSystemStatus(): Promise<SystemStatus> {
  let databaseReady = false;
  let supabaseMessage = isSupabaseConfigured
    ? "configured, checking schema"
    : "missing .env.local";

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("complaints")
        .select("id", { count: "exact", head: true });

      databaseReady = !error;
      supabaseMessage = error
        ? "keys found, schema not applied"
        : "connected and schema ready";
    } catch {
      supabaseMessage = "keys found, connection failed";
    }
  }

  const aiConfigured = Boolean(env.geminiApiKey);

  return {
    supabase: {
      configured: isSupabaseConfigured,
      databaseReady,
      message: supabaseMessage,
    },
    ai: {
      configured: aiConfigured,
      provider: "Google Gemini",
      model: env.geminiVisionModel,
      message: aiConfigured ? `Google Gemini · ${env.geminiVisionModel}` : "no API key configured",
    },
    maps: {
      provider: "OpenStreetMap",
      tokenRequired: false,
      message: "free map tiles active",
    },
  };
}
