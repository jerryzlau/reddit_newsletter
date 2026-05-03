export interface SubredditInfo {
  name: string;
  display_name: string;
  title: string;
  subscribers: number;
  icon_img: string;
  public_description: string;
}

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  permalink: string;
  score: number;
  selftext: string;
  is_self: boolean;
}
