import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/formatting";

const palette = [
  "from-emerald-500/30 to-emerald-900/40 text-emerald-200",
  "from-sky-500/30 to-sky-900/40 text-sky-200",
  "from-amber-500/30 to-amber-900/40 text-amber-200",
  "from-fuchsia-500/30 to-fuchsia-900/40 text-fuchsia-200",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash;
}

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 44, className }: AvatarProps) {
  const swatch = palette[hashName(name) % palette.length];
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br font-semibold",
        swatch,
        className,
      )}
    >
      <span style={{ fontSize: size * 0.36 }}>{initials(name)}</span>
    </div>
  );
}
