"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SubredditCard } from "./SubredditCard";
import { subscribeToSubreddit } from "@/app/(app)/subscriptions/actions";
import { toast } from "sonner";
import type { SubredditResult } from "@/types";

interface SubredditSearchProps {
  subscribedNames: string[];
}

export function SubredditSearch({ subscribedNames }: SubredditSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubredditResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/subreddits/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSubscribe(subreddit: SubredditResult) {
    startTransition(async () => {
      try {
        await subscribeToSubreddit(subreddit);
        toast.success(`Subscribed to r/${subreddit.name}`);
      } catch (e) {
        console.error("subscribe error", e);
        toast.error(e instanceof Error ? e.message : "Failed to subscribe");
      }
    });
  }

  const filteredResults = results.filter((r) => !subscribedNames.includes(r.name));

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search subreddits (e.g. programming, worldnews)"
        className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] placeholder:text-[#888888] focus-visible:ring-[#ff4500]"
      />

      {isSearching && (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[#2a2a2a] rounded-lg" />
          ))}
        </div>
      )}

      {!isSearching && filteredResults.length > 0 && (
        <div className="mt-3 space-y-2">
          {filteredResults.map((sr) => (
            <SubredditCard
              key={sr.name}
              subreddit={sr}
              isSubscribed={false}
              onSubscribe={handleSubscribe}
              loading={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
