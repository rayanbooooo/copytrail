import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassHeader } from "@/components/shell/GlassHeader";
import { BottomNav } from "@/components/shell/BottomNav";
import { Sidebar } from "@/components/shell/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email ?? undefined} />
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="lg:hidden">
          <GlassHeader userEmail={user.email ?? undefined} />
        </div>
        <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-8 pt-5 lg:max-w-5xl lg:px-10 lg:py-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
