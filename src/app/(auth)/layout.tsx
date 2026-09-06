export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-emerald-signal/25 to-transparent">
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 9.5L5 5.5L8 8.5L13 2"
                stroke="#34D399"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">CopyTrail</span>
        </div>
        {children}
      </div>
    </div>
  );
}
