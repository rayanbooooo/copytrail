/**
 * Subtle ambient motion behind every screen — two large, heavily blurred
 * gradient fields drifting on independent slow loops. Kept low-opacity and
 * pointer-events-none so it reads as depth, not a decorative distraction.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-15%] h-[60vw] w-[60vw] max-h-[720px] max-w-[720px] animate-drift-a rounded-full bg-emerald-signal/[0.07] blur-[110px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[55vw] w-[55vw] max-h-[640px] max-w-[640px] animate-drift-b rounded-full bg-indigo-500/[0.06] blur-[110px]" />
    </div>
  );
}
