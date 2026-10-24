import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const raw = (await searchParams).next ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#3b0a0d,_#0b0b0f_60%)] px-4 pt-16">
      <div className="w-full max-w-md rounded-lg bg-black/70 p-8 shadow-2xl sm:p-12">
        <h1 className="mb-2 text-3xl font-bold">Sign in</h1>
        <p className="mb-6 text-sm text-white/60">Free forever. No credit card, no ads.</p>
        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}
