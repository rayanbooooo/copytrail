"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { fadeIn, slideUpModal } from "@/lib/motion/variants";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, subtitle, children }: BottomSheetProps) {
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
            className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-3xl border border-hairline bg-surface p-6 sm:rounded-3xl"
            variants={slideUpModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="text-ink-faint">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
