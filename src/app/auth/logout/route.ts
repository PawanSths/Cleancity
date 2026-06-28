import { signOut } from "@/lib/actions";

export async function GET() {
  await signOut();
}
