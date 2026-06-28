import OpenAI from "openai";
import { env } from "@/lib/env";
import type { AiAnalysis, ComplaintCategory, Severity } from "@/types/database";

const categories: ComplaintCategory[] = [
  "garbage",
  "pothole",
  "drainage",
  "sewage",
  "graffiti",
  "other",
];

const severities: Severity[] = ["low", "medium", "high", "critical"];

const fallbackMessages = [
  "Potential civic sanitation issue detected. Review the image and location before dispatch.",
  "Could not analyze image details. Manual review recommended.",
  "Image analysis unavailable at this time. Staff should verify the report contents.",
  "Automatic vision processing failed. Assign this report for manual inspection.",
  "AI analysis skipped. Dispatch crew to verify the reported issue on site.",
];

function fallbackAnalysis(index?: number): AiAnalysis {
  return {
    category: "garbage",
    summary:
      fallbackMessages[index ?? 0] ??
      "Potential civic sanitation issue detected. Review the image and location before dispatch.",
    severity: "medium",
    confidence: 0.52,
    spamScore: 0.12,
    suggestedTitle: "Civic sanitation issue",
  };
}

function coerceAnalysis(value: Partial<AiAnalysis>): AiAnalysis {
  return {
    category: categories.includes(value.category as ComplaintCategory)
      ? (value.category as ComplaintCategory)
      : "other",
    summary:
      typeof value.summary === "string" && value.summary.length
        ? value.summary.slice(0, 600)
        : fallbackAnalysis().summary,
    severity: severities.includes(value.severity as Severity)
      ? (value.severity as Severity)
      : "medium",
    confidence:
      typeof value.confidence === "number"
        ? Math.min(1, Math.max(0, value.confidence))
        : 0.5,
    spamScore:
      typeof value.spamScore === "number"
        ? Math.min(1, Math.max(0, value.spamScore))
        : 0.1,
    suggestedTitle:
      typeof value.suggestedTitle === "string"
        ? value.suggestedTitle.slice(0, 120)
        : undefined,
  };
}

function isConfigured(): { ok: true } | { ok: false; reason: string } {
  const hasBaseUrl = Boolean(env.aiApiBaseUrl);
  const hasApiKey = Boolean(env.aiApiKey || env.openaiApiKey);

  if (!hasBaseUrl && !hasApiKey) {
    return { ok: false, reason: "No AI provider configured (set AI_API_BASE_URL or OPENAI_API_KEY)." };
  }

  // Detect placeholder key
  const key = env.aiApiKey || env.openaiApiKey || "";
  if (key.startsWith("gsk_") && key.length < 30) {
    return {
      ok: false,
      reason:
        "Groq API key looks like a placeholder. Sign up at https://console.groq.com to get a real key, or switch to Ollama in .env.local.",
    };
  }

  return { ok: true };
}

export async function analyzeImage({
  base64,
  mimeType,
}: {
  base64: string;
  mimeType: string;
}): Promise<AiAnalysis> {
  const check = isConfigured();
  if (!check.ok) {
    return {
      category: "other",
      summary: `AI review unavailable: ${check.reason}`,
      severity: "medium",
      confidence: 0,
      spamScore: 0,
      suggestedTitle: undefined,
    };
  }

  try {
    const client = new OpenAI({
      apiKey: env.aiApiKey || env.openaiApiKey || "ollama",
      baseURL: env.aiApiBaseUrl || undefined,
    });

    const response = await client.chat.completions.create({
      model: env.aiVisionModel,
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a civic issue inspector analyzing a photo submitted by a citizen.
Describe what you see in detail FIRST, then classify it according to the strict schema below.
Return ONLY valid JSON with these exact fields:

{
  "category": "garbage" | "pothole" | "drainage" | "sewage" | "graffiti" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "summary": "A concise 1-2 sentence description of what the image shows and why it matters",
  "confidence": 0.0-1.0 (how sure you are about the category),
  "spamScore": 0.0-1.0 (0 = legitimate civic issue, 1 = unrelated/fake/spam),
  "suggestedTitle": "A short 4-8 word descriptive title for this report"
}

IMPORTANT: Look at the image carefully. If there is garbage or litter, categorize as "garbage". If there is a road damage, categorize as "pothole". If blocked water flow, "drainage". If sewage/wastewater, "sewage". If spray paint on walls, "graffiti". For anything else, "other".`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: "low" },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    try {
      return coerceAnalysis(JSON.parse(text) as Partial<AiAnalysis>);
    } catch {
      return {
        ...fallbackAnalysis(),
        summary: text.slice(0, 600) || fallbackAnalysis().summary,
      };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";

    if (msg.includes("does not support image") || msg.includes("does not support images") || msg.includes("vision")) {
      return {
        category: "other",
        summary: `AI review unavailable: model "${env.aiVisionModel}" does not support image input. Replace with a vision-capable model (e.g. llama-3.2-11b-vision-preview for Groq, or llama3.2-vision for Ollama).`,
        severity: "medium",
        confidence: 0,
        spamScore: 0,
        suggestedTitle: undefined,
      };
    }

    if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("403") || msg.includes("api key")) {
      return {
        category: "other",
        summary: `AI review unavailable: authentication failed. Check your AI_API_KEY or sign up for a free key at https://console.groq.com.`,
        severity: "medium",
        confidence: 0,
        spamScore: 0,
        suggestedTitle: undefined,
      };
    }

    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many")) {
      return {
        category: "other",
        summary: "AI review unavailable: too many requests. Try again in a minute.",
        severity: "medium",
        confidence: 0,
        spamScore: 0,
        suggestedTitle: undefined,
      };
    }

    if (msg.includes("model") && (msg.includes("not found") || msg.includes("does not exist"))) {
      return {
        category: "other",
        summary: `AI review unavailable: model "${env.aiVisionModel}" not found. Check the model name or use a different one.`,
        severity: "medium",
        confidence: 0,
        spamScore: 0,
        suggestedTitle: undefined,
      };
    }

    return fallbackAnalysis(Math.floor(Math.random() * fallbackMessages.length));
  }
}
