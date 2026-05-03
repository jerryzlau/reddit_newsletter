"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatSubscriberCount } from "@/lib/utils";
import type { SubredditResult } from "@/types";

interface SubredditCardProps {
  subreddit: SubredditResult;
  isSubscribed?: boolean;
  onSubscribe?: (s: SubredditResult) => void;
  onUnsubscribe?: (name: string) => void;
  loading?: boolean;
}

export function SubredditCard({
  subreddit,
  isSubscribed,
  onSubscribe,
  onUnsubscribe,
  loading,
}: SubredditCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
      {subreddit.icon_img ? (
        <Image
          src={subreddit.icon_img}
          alt={subreddit.name}
          width={40}
          height={40}
          className="rounded-full flex-shrink-0"
          unoptimized
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#ff4500]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[#ff4500] text-xs font-bold">r/</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f0f0f0] truncate">r/{subreddit.name}</p>
        <p className="text-xs text-[#888888]">
          {formatSubscriberCount(subreddit.subscribers)}
        </p>
      </div>

      {isSubscribed ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUnsubscribe?.(subreddit.name)}
          disabled={loading}
          className="border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-xs"
        >
          Remove
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => onSubscribe?.(subreddit)}
          disabled={loading}
          className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white text-xs"
        >
          Subscribe
        </Button>
      )}
    </div>
  );
}
