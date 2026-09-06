import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ConfigMissingBannerProps {
  service: string;
  detail?: string;
  className?: string;
}

export function ConfigMissingBanner({ service, detail, className }: ConfigMissingBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
      <div className="space-y-0.5">
        <p className="text-[13px] font-medium text-amber-200">{service} isn&apos;t connected yet</p>
        <p className="text-[12px] leading-relaxed text-amber-200/70">
          {detail ?? "Add the required API keys to your environment to enable this feature."}
        </p>
      </div>
    </div>
  );
}
