import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getTitle, saveProgress } from "@/lib/catalog";

const schema = z.object({
  slug: z.string().min(1),
  position: z.number().nonnegative(),
  duration: z.number().positive(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { slug, position, duration } = parsed.data;
  if (!getTitle(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  saveProgress(user.id, slug, Math.min(position, duration), duration);
  return NextResponse.json({ ok: true });
}
