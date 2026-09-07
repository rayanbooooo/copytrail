import Link from "next/link";
import { Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWatchlist } from "@/lib/db/queries";
import { Card } from "@/components/ui/Card";
import { WatchlistGrid } from "@/components/watchlist/WatchlistGrid";

export default async function WatchlistPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const items = await getWatchlist(supabase, user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[19px] font-semibold tracking-tight text-ink">Watchlist</h1>
        <Link
          href="/markets"
          aria-label="Add asset"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-ink active:scale-90 transition-transform"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-[13px] text-ink-muted">
            Tap the star on any asset to add it to your watchlist.
          </p>
        </Card>
      ) : (
        <WatchlistGrid items={items} />
      )}

      <Link
        href="/markets"
        className="flex items-center justify-center gap-1.5 rounded-full bg-white/[0.06] py-3 text-[13px] font-medium text-ink-muted hover:text-ink"
      >
        <Plus className="h-4 w-4" />
        Add asset
      </Link>
    </div>
  );
}
