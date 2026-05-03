import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

interface RecentDigest {
  id: string;
  subject: string | null;
  created_at: string;
  status: string;
  subreddits: string[];
}

export function RecentDigests({ digests }: { digests: RecentDigest[] }) {
  if (!digests.length) return null;

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold text-[#f0f0f0] mb-3">Recent Digests</h2>
      <div className="space-y-3">
        {digests.map((digest) => (
          <Card key={digest.id} className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f0f0f0] truncate">
                  {digest.subject ?? "Reddit Digest"}
                </p>
                <p className="text-xs text-[#888888] mt-0.5">
                  {formatRelativeDate(digest.created_at)}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {digest.subreddits.slice(0, 4).map((sr) => (
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
                href={`/archive/${digest.id}`}
                className="ml-4 text-xs text-[#ff4500] hover:underline flex-shrink-0"
              >
                View →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
