"use client";

import { useActionState } from "react";
import { createAlpacaAccount, type OnboardingActionState } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialState: OnboardingActionState = {};

const fieldClass =
  "w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-emerald-signal/50 focus:outline-none disabled:opacity-50";

export function KycForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(createAlpacaAccount, initialState);

  return (
    <Card>
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input name="legalFirstName" placeholder="Legal first name" className={fieldClass} disabled={disabled} />
          <input name="legalLastName" placeholder="Legal last name" className={fieldClass} disabled={disabled} />
        </div>
        <input name="dateOfBirth" type="date" className={fieldClass} disabled={disabled} />
        <input name="ssnLast4" placeholder="Last 4 of SSN" maxLength={4} className={fieldClass} disabled={disabled} />
        <input name="streetAddress" placeholder="Street address" className={fieldClass} disabled={disabled} />
        <div className="grid grid-cols-3 gap-3">
          <input name="city" placeholder="City" className={fieldClass} disabled={disabled} />
          <input name="state" placeholder="ST" maxLength={2} className={fieldClass} disabled={disabled} />
          <input name="postalCode" placeholder="ZIP" className={fieldClass} disabled={disabled} />
        </div>
        <input
          name="countryOfCitizenship"
          placeholder="Country of citizenship (e.g. USA)"
          className={fieldClass}
          disabled={disabled}
        />

        {state.error && <p className="text-sm text-rose-signal">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-emerald-signal">Account created — continue to funding.</p>
        )}

        <Button type="submit" fullWidth disabled={disabled || pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </Card>
  );
}
