"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createUser, endSession, getCurrentUser, startSession, verifyCredentials } from "@/lib/auth";
import { getTitle, toggleWatchlist } from "@/lib/catalog";

export type AuthState = { error?: string; name?: string; email?: string } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const fields = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message, ...fields };
  const user = await createUser(parsed.data.name, parsed.data.email, parsed.data.password);
  if (!user) return { error: "An account with that email already exists", ...fields };
  await startSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const fields = { email: String(formData.get("email") ?? "") };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message, ...fields };
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Incorrect email or password", ...fields };
  await startSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function toggleWatchlistAction(slug: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/title/${encodeURIComponent(slug)}`);
  if (!getTitle(slug)) throw new Error("Unknown title");
  const added = toggleWatchlist(user.id, slug);
  revalidatePath("/", "layout");
  return added;
}
