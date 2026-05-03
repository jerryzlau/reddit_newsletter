import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rss } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#ff4500]/10 flex items-center justify-center mb-6">
        <Rss className="w-8 h-8 text-[#ff4500]" />
      </div>
      <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">No subscriptions yet</h2>
      <p className="text-sm text-[#888888] mb-6 max-w-xs">
        Subscribe to your first subreddit to start receiving AI-powered digest emails.
      </p>
      <Button asChild className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white">
        <Link href="/subscriptions">Subscribe to a subreddit</Link>
      </Button>
    </div>
  );
}
