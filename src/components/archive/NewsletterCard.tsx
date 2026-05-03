import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";

interface NewsletterCardProps {
  id: string;
  subject: string | null;
  created_at: string | null;
  status: string;
  subreddits: string[];
}

export function NewsletterCard({ id, subject, created_at, status, subreddits }: NewsletterCardProps) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-[#f0f0f0] truncate">
            {subject ?? "Reddit Digest"}
          </p>
          <Badge
            className={
              status === "sent"
                ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 text-xs"
                : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20 text-xs"
            }
            variant="outline"
          >
            {status === "sent" ? "Sent" : "Failed"}
          </Badge>
        </div>
        <p className="text-xs text-[#888888] mb-2">{formatRelativeDate(created_at)}</p>
        <div className="flex flex-wrap gap-1">
          {subreddits.slice(0, 5).map((sr) => (
            <Badge
              key={sr}
              variant="outline"
              className="text-xs border-[#2a2a2a] text-[#888888] px-2 py-0"
            >
              r/{sr}
            </Badge>
          ))}
        </div>
      </div>
      <Link
        href={`/archive/${id}`}
        className="ml-4 text-xs text-[#ff4500] hover:underline flex-shrink-0 mt-0.5"
      >
        View →
      </Link>
    </div>
  );
}
