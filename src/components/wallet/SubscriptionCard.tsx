"use client";

import { useState } from "react";
import { Card, CardDivider } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { ConfigMissingBanner } from "@/components/ui/ConfigMissingBanner";
import type { SubscriptionStatus } from "@/types/database";

interface SubscriptionCardProps {
  status: SubscriptionStatus | null;
  nextBillingDate: string | null;
  configured: boolean;
}

export function SubscriptionCard({ status, nextBillingDate, configured }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const body = await response.json();
    setLoading(false);
    if (body.url) window.location.href = body.url;
  }

  async function openPortal() {
    setLoading(true);
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const body = await response.json();
    setLoading(false);
    if (body.url) window.location.href = body.url;
  }

  if (!configured) {
    return (
      <ConfigMissingBanner
        service="Stripe billing"
        detail="Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID_COPY_SUBSCRIPTION to enable subscriptions."
      />
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">Copy-trading subscription</h3>
          <p className="mt-0.5 text-[13px] text-ink-muted">$15.00 / month</p>
        </div>
        <Pill tone={status === "active" ? "emerald" : status === "past_due" ? "amber" : "neutral"}>
          {status ?? "none"}
        </Pill>
      </div>

      <CardDivider className="my-4" />

      {status === "active" || status === "past_due" ? (
        <>
          {nextBillingDate && (
            <p className="mb-3 text-[12px] text-ink-faint">
              Next billing date · {new Date(nextBillingDate).toLocaleDateString()}
            </p>
          )}
          <Button fullWidth variant="outline" onClick={openPortal} disabled={loading}>
            Manage subscription
          </Button>
        </>
      ) : (
        <Button fullWidth onClick={startCheckout} disabled={loading}>
          {loading ? "Redirecting…" : "Subscribe for $15/mo"}
        </Button>
      )}
    </Card>
  );
}
