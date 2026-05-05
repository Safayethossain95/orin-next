"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/providers";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === "login") {
        await signIn({ email: String(form.get("email")), password: String(form.get("password")) });
      } else {
        await signUp({
          name: String(form.get("name")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          phone: String(form.get("phone") || ""),
        });
      }
      router.push("/user");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container flex min-h-[620px] items-center justify-center py-10">
      <form onSubmit={onSubmit} className="surface w-full max-w-md bg-white p-6">
        <h1 className="text-2xl font-black text-slate-950">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="mt-2 text-sm text-slate-600">Connected to ecom-bkend authentication.</p>
        <div className="mt-6 grid gap-4">
          {mode === "register" ? (
            <label className="grid gap-1 text-sm font-semibold">
              Name
              <input name="name" required minLength={2} className="border border-slate-200 px-3 py-2 outline-none focus:border-[var(--brand)]" />
            </label>
          ) : null}
          <label className="grid gap-1 text-sm font-semibold">
            Email
            <input name="email" type="email" required className="border border-slate-200 px-3 py-2 outline-none focus:border-[var(--brand)]" />
          </label>
          {mode === "register" ? (
            <label className="grid gap-1 text-sm font-semibold">
              Phone
              <input name="phone" className="border border-slate-200 px-3 py-2 outline-none focus:border-[var(--brand)]" />
            </label>
          ) : null}
          <label className="grid gap-1 text-sm font-semibold">
            Password
            <input name="password" type="password" required minLength={mode === "register" ? 8 : 1} className="border border-slate-200 px-3 py-2 outline-none focus:border-[var(--brand)]" />
          </label>
        </div>
        {error ? <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <button disabled={isSubmitting} className="mt-6 w-full bg-[var(--brand)] px-4 py-3 text-sm font-black text-white disabled:opacity-60">
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          {mode === "login" ? "No account?" : "Already registered?"}{" "}
          <Link href={mode === "login" ? "/register" : "/login"} className="font-bold text-[var(--brand)]">
            {mode === "login" ? "Create one" : "Sign in"}
          </Link>
        </p>
      </form>
    </main>
  );
}
