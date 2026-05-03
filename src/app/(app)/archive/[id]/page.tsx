import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth } from "@clerk/nextjs/server";
import { NewsletterView } from "@/components/archive/NewsletterView";

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const supabase = createServiceSupabaseClient();

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("id, subject, created_at, status, user_id")
    .eq("id", id)
    .eq("user_id", userId!)
    .single();

  if (!newsletter) notFound();

  const { data: items } = await supabase
    .from("newsletter_items")
    .select("subreddit, post_title, post_url, upvotes, summary, position")
    .eq("newsletter_id", id)
    .order("subreddit")
    .order("position");

  // Group items by subreddit
  const sectionsMap: Record<string, typeof items> = {};
  for (const item of items ?? []) {
    if (!sectionsMap[item.subreddit]) sectionsMap[item.subreddit] = [];
    sectionsMap[item.subreddit]!.push(item);
  }

  const sections = Object.entries(sectionsMap).map(([subreddit, posts]) => ({
    subreddit,
    posts: posts ?? [],
  }));

  return (
    <div>
      <Link href="/archive" className="text-xs text-[#888888] hover:text-[#f0f0f0] mb-6 inline-block">
        ← Archive
      </Link>
      <NewsletterView
        subject={newsletter.subject}
        created_at={newsletter.created_at}
        sections={sections}
      />
    </div>
  );
}
