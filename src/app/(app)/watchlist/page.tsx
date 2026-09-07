import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWatchlist } from "@/lib/db/queries";
import { getSymbolMeta } from "@/lib/data/symbols";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WatchlistRow } from "@/components/watchlist/WatchlistRow";

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
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">Watchlist</h1>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-[13px] text-ink-muted">
            Tap the star on any asset to add it to your watchlist.
          </p>
        </Card>
      ) : (
        <div className="rounded-lg border border-hairline">
          {items.map((item) => (
            <WatchlistRow key={item.id} meta={getSymbolMeta(item.symbol)} />
          ))}
        </div>
      )}

      <Link href="/markets">
        <Button fullWidth variant="outline">
          Add asset
        </Button>
      </Link>
    </div>
  );
}
