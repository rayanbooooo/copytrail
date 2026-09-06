import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassHeader } from "@/components/shell/GlassHeader";
import { BottomNav } from "@/components/shell/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <GlassHeader userEmail={user.email ?? undefined} />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-8 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}
