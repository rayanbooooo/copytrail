"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupInput } from "@/lib/validation/schemas";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setFormError(error.message);
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">Follow proven traders. Trade your way.</p>
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
            autoComplete="new-password"
            className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-emerald-signal/50 focus:outline-none"
            placeholder="At least 8 characters"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-rose-signal">{errors.password.message}</p>
          )}
        </div>
      </div>

      {formError && <p className="text-sm text-rose-signal">{formError}</p>}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-signal">
          Sign in
        </Link>
      </p>
    </form>
  );
}
