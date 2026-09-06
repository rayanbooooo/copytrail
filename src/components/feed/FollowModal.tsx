"use client";

import { useActionState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { followLeader, type FollowActionState } from "@/lib/actions/follow";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { fadeIn, slideUpModal } from "@/lib/motion/variants";
import type { LeaderCardData } from "@/types/domain";

const initialState: FollowActionState = {};

export function FollowModal({
  leader,
  open,
  onClose,
}: {
  leader: LeaderCardData;
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(followLeader, initialState);

  useEffect(() => {
    if (state.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeIn}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-t-3xl border border-hairline bg-surface p-6 sm:rounded-3xl"
            variants={slideUpModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Copy {leader.displayName}</h2>
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  Set how much capital to allocate. Trades mirror proportionally.
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-ink-faint">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="leaderId" value={leader.id} />
              <CurrencyInput name="allocationAmount" autoFocus />
              {state.error && <p className="text-sm text-rose-signal">{state.error}</p>}
              <Button type="submit" fullWidth disabled={pending}>
                {pending ? "Confirming…" : "Confirm allocation"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
