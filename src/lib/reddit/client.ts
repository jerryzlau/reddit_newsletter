import type { SubredditInfo, RedditPost } from "./types";

const USER_AGENT = "reddit-newsletter/1.0";

async function redditFetch(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Reddit fetch error ${res.status} for ${url}`);
  }
  return res.json();
}

export async function searchSubreddits(query: string): Promise<SubredditInfo[]> {
  const data = (await redditFetch(
    `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=10&include_over_18=false`
  )) as { data: { children: { data: Record<string, unknown> }[] } };

  return data.data.children.map((child) => {
    const s = child.data;
    return {
      name: s.display_name as string,
      display_name: (s.display_name_prefixed as string) || `r/${s.display_name}`,
      title: (s.title as string) || "",
      subscribers: (s.subscribers as number) || 0,
      icon_img: ((s.community_icon as string) || (s.icon_img as string) || "").replace(/&amp;/g, "&"),
      public_description: (s.public_description as string) || "",
    };
  });
}

export async function getHotPosts(subreddit: string, limit: number): Promise<RedditPost[]> {
  const data = (await redditFetch(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
  )) as { data: { children: { data: Record<string, unknown> }[] } };

  return data.data.children.map((child) => {
    const p = child.data;
    return {
      id: p.id as string,
      title: p.title as string,
      url: p.url as string,
      permalink: p.permalink as string,
      score: (p.score as number) || 0,
      selftext: (p.selftext as string) || "",
      is_self: (p.is_self as boolean) || false,
    };
  });
}
