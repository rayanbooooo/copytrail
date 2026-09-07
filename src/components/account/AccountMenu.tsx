import Link from "next/link";
import { ChevronRight, History, LifeBuoy, ShieldCheck, Star, Wallet } from "lucide-react";
import { Card, CardDivider } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { KycStatus } from "@/types/database";

const kycToneMap: Record<KycStatus, "emerald" | "amber" | "rose"> = {
  approved: "emerald",
  pending: "amber",
  rejected: "rose",
};

export function AccountMenu({ kycStatus }: { kycStatus: KycStatus }) {
  const rows = [
    {
      href: "/onboarding/kyc",
      icon: ShieldCheck,
      label: "Verification",
      trailing: <Pill tone={kycToneMap[kycStatus]}>{kycStatus}</Pill>,
    },
    {
      href: "/onboarding/fund",
      icon: Wallet,
      label: "Funding & withdrawals",
      trailing: null,
    },
    {
      href: "/activity",
      icon: History,
      label: "Activity",
      trailing: null,
    },
    {
      href: "/watchlist",
      icon: Star,
      label: "Watchlist",
      trailing: null,
    },
    {
      href: "mailto:support@copytrail.app",
      icon: LifeBuoy,
      label: "Help & support",
      trailing: null,
    },
  ];

  return (
    <Card className="p-0">
      {rows.map((row, i) => (
        <div key={row.label}>
          {i > 0 && <CardDivider />}
          <Link href={row.href} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <row.icon className="h-[18px] w-[18px] text-ink-muted" strokeWidth={1.8} />
              <span className="text-[14px] font-medium text-ink">{row.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {row.trailing}
              <ChevronRight className="h-4 w-4 text-ink-faint" />
            </div>
          </Link>
        </div>
      ))}
    </Card>
  );
}
