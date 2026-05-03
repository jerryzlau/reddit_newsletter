import { createServerSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentDigests } from "@/components/dashboard/RecentDigests";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default async function DashboardPage() {
  const { userId } = await auth();
  const supabase = await createServerSupabaseClient();

  const [subscriptionsRes, settingsRes, newslettersRes] = await Promise.all([
    supabase.from("subscriptions").select("subreddit").eq("user_id", userId!),
    supabase
      .from("newsletter_settings")
      .select("next_send_at, is_active")
      .eq("user_id", userId!)
      .single(),
    supabase
      .from("newsletters")
      .select("id, subject, created_at, status")
      .eq("user_id", userId!)
      .eq("status", "sent")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const subscriptions = subscriptionsRes.data ?? [];
  const settings = settingsRes.data;
  const recentNewsletters = newslettersRes.data ?? [];

  const sentCount = await supabase
    .from("newsletters")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId!)
    .eq("status", "sent");

  const stats = {
    activeSubscriptions: subscriptions.length,
    nextSendAt: settings?.next_send_at ?? null,
    isActive: settings?.is_active ?? false,
    totalNewslettersSent: sentCount.count ?? 0,
  };

  // Fetch subreddits covered in each recent newsletter
  const digestsWithSubreddits = await Promise.all(
    recentNewsletters.map(async (n) => {
      const { data: items } = await supabase
        .from("newsletter_items")
        .select("subreddit")
        .eq("newsletter_id", n.id);

      const uniqueSubreddits = [...new Set((items ?? []).map((i) => i.subreddit))];
      return { ...n, subreddits: uniqueSubreddits };
    })
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#f0f0f0] mb-6">Dashboard</h1>
      <StatsCards stats={stats} />
      {subscriptions.length === 0 ? (
        <EmptyState />
      ) : (
        <RecentDigests digests={digestsWithSubreddits} />
      )}
    </div>
  );
}
