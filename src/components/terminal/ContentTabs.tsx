"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { SymbolMeta } from "@/lib/data/symbols";

const TABS = ["Overview", "News", "Financials", "About"] as const;
type Tab = (typeof TABS)[number];

export function ContentTabs({ meta }: { meta: SymbolMeta }) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div>
      <div className="flex items-center gap-5 border-b border-hairline-soft">
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative pb-2.5 text-[13px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {t}
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-emerald-signal" />}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        {tab === "Overview" && (
          <div>
            <h3 className="mb-1.5 text-[13px] font-semibold text-ink">About {meta.symbol}</h3>
            <p className="text-[12.5px] leading-relaxed text-ink-muted">{meta.description}</p>
          </div>
        )}

        {tab === "About" && (
          <div className="space-y-2">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-ink-muted">Symbol</span>
              <span className="font-mono text-ink">{meta.symbol}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-ink-muted">Name</span>
              <span className="text-ink">{meta.name}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-ink-muted">Asset class</span>
              <span className="text-ink">{meta.assetClass === "forex" ? "Forex" : "Equity"}</span>
            </div>
            <p className="pt-2 text-[12.5px] leading-relaxed text-ink-muted">{meta.description}</p>
          </div>
        )}

        {(tab === "News" || tab === "Financials") && (
          <p className="text-[12.5px] text-ink-faint">
            {tab} aren&apos;t connected yet — this build doesn&apos;t have a market-data provider wired for {tab.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}
