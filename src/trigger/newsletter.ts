import { schedules, task } from "@trigger.dev/sdk/v3";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { getHotPosts } from "@/lib/reddit/client";
import { summarizePost } from "@/lib/anthropic/summarize";
import { sendNewsletterEmail, buildUnsubscribeToken } from "@/lib/resend/client";
import { calcNextSendAt } from "@/lib/utils";

interface UserPayload {
  user_id: string;
  top_posts_count: number;
  cadence: string;
  user_email: string;
  user_name: string | null;
}

export const newsletterCron = schedules.task({
  id: "newsletter-cron",
  cron: "0 * * * *",
  run: async () => {
    const supabase = createServiceSupabaseClient();

    const { data: dueSettings } = await supabase
      .from("newsletter_settings")
      .select("user_id, top_posts_count, cadence")
      .lte("next_send_at", new Date().toISOString())
      .eq("is_active", true);

    if (!dueSettings?.length) return;

    const userIds = dueSettings.map((s) => s.user_id);
    const { data: users } = await supabase
      .from("users")
      .select("id, email, full_name")
      .in("id", userIds);

    const userMap = new Map((users ?? []).map((u) => [u.id, u]));

    const payloads: UserPayload[] = dueSettings
      .map((s) => {
        const user = userMap.get(s.user_id);
        if (!user) return null;
        return {
          user_id: s.user_id,
          top_posts_count: s.top_posts_count,
          cadence: s.cadence,
          user_email: user.email,
          user_name: user.full_name,
        };
      })
      .filter((p): p is UserPayload => p !== null);

    await processUserNewsletter.batchTrigger(payloads.map((p) => ({ payload: p })));
  },
});

export const processUserNewsletter = task({
  id: "process-user-newsletter",
  retry: { maxAttempts: 3, factor: 2, minTimeoutInMs: 5000 },
  run: async (payload: UserPayload) => {
    const supabase = createServiceSupabaseClient();

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("subreddit")
      .eq("user_id", payload.user_id);

    if (!subscriptions?.length) return;

    const digestDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const subject = `Your ${payload.cadence === "daily" ? "Daily" : "Weekly"} Reddit Digest — ${digestDate}`;

    const { data: newsletter } = await supabase
      .from("newsletters")
      .insert({ user_id: payload.user_id, status: "pending", subject })
      .select()
      .single();

    if (!newsletter) throw new Error("Failed to create newsletter record");

    try {
      const sections = [];

      for (const { subreddit } of subscriptions) {
        const posts = await getHotPosts(subreddit, payload.top_posts_count);
        const items = [];

        for (const [i, post] of posts.entries()) {
          const summary = await summarizePost({
            title: post.title,
            body: post.selftext,
            subreddit,
            score: post.score,
          });

          items.push({
            newsletter_id: newsletter.id,
            subreddit,
            post_id: post.id,
            post_title: post.title,
            post_url: `https://reddit.com${post.permalink}`,
            post_permalink: post.permalink,
            upvotes: post.score,
            summary,
            position: i,
          });
        }

        await supabase.from("newsletter_items").insert(items);

        sections.push({
          subreddit,
          posts: items.map((item) => ({
            title: item.post_title,
            url: item.post_url,
            score: item.upvotes,
            summary: item.summary,
          })),
        });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const unsubscribeToken = buildUnsubscribeToken(newsletter.id, payload.user_id);

      await sendNewsletterEmail(payload.user_email, {
        digestDate,
        cadence: payload.cadence as "daily" | "weekly",
        sections,
        unsubscribeUrl: `${appUrl}/api/newsletters/${newsletter.id}/unsubscribe?token=${unsubscribeToken}&user=${payload.user_id}`,
        manageUrl: `${appUrl}/settings`,
        recipientEmail: payload.user_email,
      });

      await supabase
        .from("newsletters")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", newsletter.id);

      await supabase
        .from("newsletter_settings")
        .update({ next_send_at: calcNextSendAt(payload.cadence) })
        .eq("user_id", payload.user_id);
    } catch (err) {
      await supabase
        .from("newsletters")
        .update({ status: "failed" })
        .eq("id", newsletter.id);
      throw err;
    }
  },
});
