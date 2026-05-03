import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { getHotPosts } from "@/lib/reddit/client";
import { summarizePost } from "@/lib/anthropic/summarize";
import { sendNewsletterEmail, buildUnsubscribeToken } from "@/lib/resend/client";
import { calcNextSendAt } from "@/lib/utils";

export async function runNewsletterPipeline(userId: string) {
  const supabase = createServiceSupabaseClient();

  const [{ data: subscriptions }, { data: settings }, { data: user }] = await Promise.all([
    supabase.from("subscriptions").select("subreddit").eq("user_id", userId),
    supabase.from("newsletter_settings").select("cadence, top_posts_count, accent_color, show_scores, intro_text").eq("user_id", userId).single(),
    supabase.from("users").select("email").eq("id", userId).single(),
  ]);

  if (!subscriptions?.length) throw new Error("No subscriptions — add some subreddits first.");
  if (!user?.email) throw new Error("User not found.");

  const cadence = settings?.cadence ?? "daily";
  const topPostsCount = settings?.top_posts_count ?? 5;
  const digestDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const subject = `Your ${cadence === "daily" ? "Daily" : "Weekly"} Reddit Digest — ${digestDate}`;

  const { data: newsletter } = await supabase
    .from("newsletters")
    .insert({ user_id: userId, status: "pending", subject })
    .select()
    .single();

  if (!newsletter) throw new Error("Failed to create newsletter record.");

  try {
    const sections = [];

    for (const { subreddit } of subscriptions) {
      const posts = await getHotPosts(subreddit, topPostsCount);
      const items = [];

      for (const [i, post] of posts.entries()) {
        const summary = await summarizePost({ title: post.title, body: post.selftext, subreddit, score: post.score });
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
      sections.push({ subreddit, posts: items.map((item) => ({ title: item.post_title, url: item.post_url, score: item.upvotes, summary: item.summary })) });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendNewsletterEmail(user.email, {
      digestDate,
      cadence: cadence as "daily" | "weekly",
      sections,
      unsubscribeUrl: `${appUrl}/api/newsletters/${newsletter.id}/unsubscribe?token=${buildUnsubscribeToken(newsletter.id, userId)}&user=${userId}`,
      manageUrl: `${appUrl}/settings`,
      recipientEmail: user.email,
      accentColor: settings?.accent_color ?? "#ff4500",
      showScores: settings?.show_scores ?? true,
      introText: settings?.intro_text ?? null,
    });

    await supabase.from("newsletters").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", newsletter.id);
    await supabase.from("newsletter_settings").update({ next_send_at: calcNextSendAt(cadence) }).eq("user_id", userId);
  } catch (err) {
    await supabase.from("newsletters").update({ status: "failed" }).eq("id", newsletter.id);
    throw err;
  }
}
