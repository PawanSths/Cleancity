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

  const aiConfigured = Boolean(env.aiApiKey || env.openaiApiKey);
  let aiProvider = "OpenAI";
  if (env.aiApiBaseUrl) {
    if (env.aiApiBaseUrl.includes("groq")) aiProvider = "Groq";
    else if (env.aiApiBaseUrl.includes("localhost") || env.aiApiBaseUrl.includes("ollama")) aiProvider = "Ollama";
    else if (env.aiApiBaseUrl.includes("together")) aiProvider = "Together AI";
    else aiProvider = "OpenAI-compatible";
  }

  return {
    supabase: {
      configured: isSupabaseConfigured,
      databaseReady,
      message: supabaseMessage,
    },
    ai: {
      configured: aiConfigured,
      provider: aiProvider,
      model: env.aiVisionModel,
      message: aiConfigured ? `${aiProvider} · ${env.aiVisionModel}` : "no API key configured",
    },
    maps: {
      provider: "OpenStreetMap",
      tokenRequired: false,
      message: "free map tiles active",
    },
  };
}
