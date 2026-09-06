import { Landmark, ShieldCheck } from "lucide-react";
import { Card, CardDivider } from "@/components/ui/Card";
import { ConfigMissingBanner } from "@/components/ui/ConfigMissingBanner";
import { Pill } from "@/components/ui/Pill";
import { maskAccountNumber } from "@/lib/utils/formatting";
import type { AlpacaAchRelationship } from "@/lib/alpaca/types";

interface LinkedBanksModuleProps {
  relationships: AlpacaAchRelationship[];
  configured: boolean;
}

export function LinkedBanksModule({ relationships, configured }: LinkedBanksModuleProps) {
  if (!configured) {
    return (
      <ConfigMissingBanner
        service="Plaid + Alpaca ACH"
        detail="Link a bank account once Plaid and Alpaca credentials are configured."
      />
    );
  }

  if (relationships.length === 0) {
    return (
      <Card>
        <p className="text-[13px] text-ink-muted">No linked bank accounts yet.</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-hairline-soft p-0">
      {relationships.map((rel, i) => (
        <div key={rel.id}>
          {i > 0 && <CardDivider />}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-black/20">
                <Landmark className="h-4 w-4 text-ink-muted" />
              </span>
              <div>
                <p className="text-[14px] font-medium text-ink">
                  {rel.bank_account_type ?? "Bank account"}
                </p>
                <p className="text-[12px] text-ink-faint">{maskAccountNumber(rel.id.slice(-4))}</p>
              </div>
            </div>
            <Pill tone={rel.status === "APPROVED" ? "emerald" : "amber"} className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {rel.status}
            </Pill>
          </div>
        </div>
      ))}
    </Card>
  );
}
