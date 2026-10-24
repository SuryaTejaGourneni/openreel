"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/actions";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const input =
    "w-full rounded bg-white/10 px-4 py-3 placeholder:text-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && <input name="name" placeholder="Name" autoComplete="name" defaultValue={state?.name} required className={input} />}
      <input name="email" type="email" placeholder="Email" autoComplete="email" defaultValue={state?.email} required className={input} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        minLength={mode === "signup" ? 8 : undefined}
        required
        className={input}
      />
      {state?.error && (
        <p role="alert" className="rounded bg-amber-500/15 px-3 py-2 text-sm text-amber-300">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="w-full rounded bg-brand py-3 font-semibold hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create free account"}
      </button>
      <p className="text-sm text-white/60">
        {mode === "login" ? (
          <>
            New to OpenReel?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-white hover:underline">
              Sign up free
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-white hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
