import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Post {
  post_title: string;
  post_url: string;
  upvotes: number | null;
  summary: string;
}

interface Section {
  subreddit: string;
  posts: Post[];
}

interface NewsletterViewProps {
  subject: string | null;
  created_at: string | null;
  sections: Section[];
}

export function NewsletterView({ subject, created_at, sections }: NewsletterViewProps) {
  const date = created_at
    ? new Date(created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="max-w-2xl">
      <div className="mb-6 pb-4 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold text-[#f0f0f0]">{subject ?? "Reddit Digest"}</h1>
        <p className="text-sm text-[#888888] mt-1">{date}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {sections.map((s) => (
            <Badge key={s.subreddit} variant="outline" className="text-xs border-[#2a2a2a] text-[#888888]">
              r/{s.subreddit}
            </Badge>
          ))}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.subreddit} className="mb-8">
          <h2 className="text-base font-semibold text-[#ff4500] mb-3">r/{section.subreddit}</h2>
          <div className="border-t border-[#2a2a2a] pt-3 space-y-5">
            {section.posts.map((post, i) => (
              <div key={i}>
                <Link
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#f0f0f0] hover:text-[#ff4500] transition-colors block mb-1"
                >
                  {post.post_title}
                </Link>
                {post.upvotes != null && (
                  <span className="inline-block text-xs text-[#888888] bg-[#2a2a2a] px-2 py-0.5 rounded-full mb-2">
                    ▲ {post.upvotes.toLocaleString()}
                  </span>
                )}
                <p className="text-sm text-[#888888] leading-relaxed">{post.summary}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-[#2a2a2a] pt-4 flex gap-4 text-xs text-[#888888]">
        <Link href="/settings" className="hover:text-[#ff4500]">Manage preferences</Link>
      </div>
    </div>
  );
}
