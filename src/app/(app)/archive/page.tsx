import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth } from "@clerk/nextjs/server";
import { NewsletterCard } from "@/components/archive/NewsletterCard";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const { userId } = await auth();
  const supabase = createServiceSupabaseClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: newsletters, count } = await supabase
    .from("newsletters")
    .select("id, subject, created_at, status", { count: "exact" })
    .eq("user_id", userId!)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const newslettersWithSubreddits = await Promise.all(
    (newsletters ?? []).map(async (n) => {
      const { data: items } = await supabase
        .from("newsletter_items")
        .select("subreddit")
        .eq("newsletter_id", n.id);
      return { ...n, subreddits: [...new Set((items ?? []).map((i) => i.subreddit))] };
    })
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f0f0] mb-6">Newsletter Archive</h1>

      {!newslettersWithSubreddits.length ? (
        <p className="text-sm text-[#888888] py-12 text-center">
          No newsletters sent yet.
        </p>
      ) : (
        <div className="space-y-3">
          {newslettersWithSubreddits.map((n) => (
            <NewsletterCard key={n.id} {...n} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/archive?page=${page - 1}`}
              className="px-3 py-1.5 text-sm text-[#888888] hover:text-[#f0f0f0] border border-[#2a2a2a] rounded-md"
            >
              ← Previous
            </Link>
          )}
          <span className="text-xs text-[#888888]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/archive?page=${page + 1}`}
              className="px-3 py-1.5 text-sm text-[#888888] hover:text-[#f0f0f0] border border-[#2a2a2a] rounded-md"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
