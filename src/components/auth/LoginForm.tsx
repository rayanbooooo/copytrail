"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validation/schemas";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setFormError(error.message);
      return;
    }
    router.push(searchParams.get("redirectedFrom") ?? "/home");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to your CopyTrail account</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ink-muted">Email</label>
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-emerald-signal/50 focus:outline-none"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-signal">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ink-muted">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-emerald-signal/50 focus:outline-none"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-rose-signal">{errors.password.message}</p>
          )}
        </div>
      </div>

      {formError && <p className="text-sm text-rose-signal">{formError}</p>}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-emerald-signal">
          Create an account
        </Link>
      </p>
    </form>
  );
}
