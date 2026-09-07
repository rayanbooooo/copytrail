"use client";

import { motion } from "framer-motion";
import { springSnappy } from "@/lib/motion/variants";

/** Fades/rises a section in on mount, optionally staggered by `delay` —
 * cheap, reusable entrance motion for server-rendered page sections that
 * don't need their own stagger-container logic. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSnappy, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
