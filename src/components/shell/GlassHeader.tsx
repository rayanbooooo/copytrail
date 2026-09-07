import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

interface GlassHeaderProps {
  title?: string;
  userEmail?: string;
}

export function GlassHeader({ title, userEmail }: GlassHeaderProps) {
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-white/[0.06] bg-[#090A0F]/80 backdrop-blur-xl2">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-5">
        <Link href="/home" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-emerald-signal/25 to-transparent">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 9.5L5 5.5L8 8.5L13 2"
                stroke="#34D399"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {title ? (
            <span className="text-[15px] font-semibold tracking-tight text-ink">{title}</span>
          ) : (
            <span className="text-[15px] font-semibold tracking-tight text-ink">CopyTrail</span>
          )}
        </Link>
        {userEmail && (
          <Link href="/account" aria-label="Account">
            <Avatar name={userEmail} size={32} />
          </Link>
        )}
      </div>
    </header>
  );
}
