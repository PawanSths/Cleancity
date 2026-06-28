import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/system-status";

export async function GET() {
  return NextResponse.json(await getSystemStatus());
}
