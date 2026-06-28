import { NextResponse, type NextRequest } from "next/server";
import { analyzeImage } from "@/lib/ai/analyze-image";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit({
    key: `analyze:${ip}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many image analysis requests. Try again later." },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Image is required." }, { status: 400 });
  }

  if (!image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Upload a valid image under 8 MB." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const analysis = await analyzeImage({
    base64: buffer.toString("base64"),
    mimeType: image.type,
  });

  return NextResponse.json(analysis);
}
