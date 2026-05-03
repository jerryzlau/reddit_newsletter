"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { SubredditResult } from "@/types";

export async function subscribeToSubreddit(subreddit: SubredditResult) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = await createServerSupabaseClient();
  await supabase.from("subscriptions").upsert({
    user_id: userId,
    subreddit: subreddit.name,
    display_name: subreddit.display_name,
    icon_url: subreddit.icon_img || null,
    subscribers: subreddit.subscribers,
  });

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}

export async function unsubscribeFromSubreddit(subreddit: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("subreddit", subreddit);

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}
