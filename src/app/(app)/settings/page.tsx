import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const { userId } = await auth();
  const supabase = createServiceSupabaseClient();

  const [settingsRes, user] = await Promise.all([
    supabase
      .from("newsletter_settings")
      .select("cadence, top_posts_count, is_active")
      .eq("user_id", userId!)
      .single(),
    currentUser(),
  ]);

  const settings = settingsRes.data ?? {
    cadence: "daily" as const,
    top_posts_count: 5 as const,
    is_active: true,
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[#f0f0f0]">Settings</h1>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f0f0f0]">Newsletter Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initial={{
              cadence: settings.cadence as "daily" | "weekly",
              top_posts_count: settings.top_posts_count as 3 | 5 | 10,
              is_active: settings.is_active,
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f0f0f0]">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-[#f0f0f0]">
              {user?.emailAddresses[0]?.emailAddress ?? "—"}
            </p>
          </div>
          <Separator className="bg-[#2a2a2a]" />
          <p className="text-xs text-[#888888]">
            To change your email or password, visit your{" "}
            <span className="text-[#ff4500]">account settings</span> in Clerk.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
