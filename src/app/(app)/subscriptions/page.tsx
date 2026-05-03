import { createServerSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { SubredditSearch } from "@/components/subscriptions/SubredditSearch";
import { SubscriptionsList } from "@/components/subscriptions/SubscriptionsList";
import { Separator } from "@/components/ui/separator";

export default async function SubscriptionsPage() {
  const { userId } = await auth();
  const supabase = await createServerSupabaseClient();

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("subreddit, display_name, icon_url, subscribers")
    .eq("user_id", userId!);

  const subscriptions = (subs ?? []).map((s) => ({
    name: s.subreddit,
    display_name: s.display_name ?? `r/${s.subreddit}`,
    title: "",
    subscribers: s.subscribers ?? 0,
    icon_img: s.icon_url ?? "",
    public_description: "",
  }));

  const subscribedNames = subscriptions.map((s) => s.name);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f0f0] mb-6">Subscriptions</h1>

      <SubredditSearch subscribedNames={subscribedNames} />

      <Separator className="my-6 bg-[#2a2a2a]" />

      <h2 className="text-base font-semibold text-[#f0f0f0] mb-3">Your Subscriptions</h2>
      <SubscriptionsList subscriptions={subscriptions} />
    </div>
  );
}
