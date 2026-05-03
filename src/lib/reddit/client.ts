import type { SubredditInfo, RedditPost } from "./types";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const USER_AGENT = `web:reddit-newsletter:v1.0 (by /u/${process.env.REDDIT_USERNAME || "reddit_newsletter_bot"})`;

async function getAppOnlyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token as string;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function redditFetch(path: string): Promise<unknown> {
  const token = await getAppOnlyToken();
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(`Reddit API error ${res.status} for ${path}`);
  }
  return res.json();
}

export async function searchSubreddits(query: string): Promise<SubredditInfo[]> {
  const data = (await redditFetch(
    `/subreddits/search?q=${encodeURIComponent(query)}&limit=10&include_over_18=false`
  )) as { data: { children: { data: Record<string, unknown> }[] } };

  return data.data.children.map((child) => {
    const s = child.data;
    return {
      name: s.display_name as string,
      display_name: `r/${s.display_name}`,
      title: (s.title as string) || "",
      subscribers: (s.subscribers as number) || 0,
      icon_img: (s.icon_img as string) || "",
      public_description: (s.public_description as string) || "",
    };
  });
}

export async function getHotPosts(subreddit: string, limit: number): Promise<RedditPost[]> {
  const data = (await redditFetch(
    `/r/${subreddit}/hot?limit=${limit}`
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
