"use client";

import { motion } from "framer-motion";
import { WatchlistRow } from "@/components/watchlist/WatchlistRow";
import { fadeInUp, staggerContainer } from "@/lib/motion/variants";
import { getSymbolMeta } from "@/lib/data/symbols";
import type { WatchlistItemRow } from "@/types/database";

export function WatchlistGrid({ items }: { items: WatchlistItemRow[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="divide-y divide-hairline-soft lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-y-0 xl:grid-cols-3"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={fadeInUp}>
          <WatchlistRow meta={getSymbolMeta(item.symbol)} />
        </motion.div>
      ))}
    </motion.div>
  );
}
