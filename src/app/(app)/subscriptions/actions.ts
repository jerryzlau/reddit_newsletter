"use server";

import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { SubredditResult } from "@/types";

async function ensureUserExists(userId: string) {
  const supabase = createServiceSupabaseClient();
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existing) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? "";
    const full_name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
    await supabase.from("users").upsert({ id: userId, email, full_name, avatar_url: user?.imageUrl ?? null });
    await supabase.from("newsletter_settings").upsert({ user_id: userId });
  }
}

export async function subscribeToSubreddit(subreddit: SubredditResult) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await ensureUserExists(userId);

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    subreddit: subreddit.name,
    display_name: subreddit.display_name,
    icon_url: subreddit.icon_img || null,
    subscribers: subreddit.subscribers,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}

export async function unsubscribeFromSubreddit(subreddit: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createServiceSupabaseClient();
  await supabase
    .from("subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("subreddit", subreddit);

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}
