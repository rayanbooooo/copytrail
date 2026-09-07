import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
        <main className="safe-top mx-auto w-full max-w-lg flex-1 px-4 pb-8 pt-5 lg:max-w-[1400px] lg:px-8 lg:py-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
