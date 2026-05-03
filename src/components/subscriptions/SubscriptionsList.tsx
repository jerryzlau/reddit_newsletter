"use client";

import { useTransition } from "react";
import { SubredditCard } from "./SubredditCard";
import { unsubscribeFromSubreddit } from "@/app/(app)/subscriptions/actions";
import { toast } from "sonner";
import type { SubredditResult } from "@/types";

interface SubscriptionsListProps {
  subscriptions: SubredditResult[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const [isPending, startTransition] = useTransition();

  function handleUnsubscribe(subreddit: string) {
    startTransition(async () => {
      try {
        await unsubscribeFromSubreddit(subreddit);
        toast.success(`Unsubscribed from r/${subreddit}`);
      } catch {
        toast.error("Failed to unsubscribe");
      }
    });
  }

  if (!subscriptions.length) {
    return (
      <p className="text-sm text-[#888888] py-6 text-center">
        No subscriptions yet — search above to add some
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {subscriptions.map((sr) => (
        <SubredditCard
          key={sr.name}
          subreddit={sr}
          isSubscribed
          onUnsubscribe={handleUnsubscribe}
          loading={isPending}
        />
      ))}
    </div>
  );
}
