"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Card } from "@/components/ui/Card";

export function FundingForm({ disabled }: { disabled?: boolean }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startLink = useCallback(async () => {
    setStatus(null);
    const response = await fetch("/api/plaid/link-token", { method: "POST" });
    const body = await response.json();
    if (!response.ok) {
      setStatus(body.error ?? "Failed to start Plaid Link");
      return;
    }
    setLinkToken(body.linkToken);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: async (publicToken, metadata) => {
      setLoading(true);
      const plaidAccountId = metadata.accounts[0]?.id;
      const response = await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicToken, plaidAccountId }),
      });
      const body = await response.json();
      setLoading(false);
      setStatus(response.ok ? "Bank linked. You can now deposit." : body.error);
    },
  });

  return (
    <Card className="space-y-4">
      <div>
        <p className="mb-1.5 text-[13px] font-medium text-ink-muted">Deposit amount</p>
        <CurrencyInput value={amount} onValueChange={setAmount} disabled={disabled} />
      </div>

      <Button
        fullWidth
        variant="outline"
        disabled={disabled || loading}
        onClick={linkToken ? () => open() : startLink}
      >
        {linkToken && ready ? "Continue with Plaid" : "Link your bank"}
      </Button>

      {status && <p className="text-sm text-ink-muted">{status}</p>}
    </Card>
  );
}
