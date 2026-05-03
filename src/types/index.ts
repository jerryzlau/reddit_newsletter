export interface SubredditResult {
  name: string;
  display_name: string;
  title: string;
  subscribers: number;
  icon_img: string;
  public_description: string;
}

export interface NewsletterPost {
  title: string;
  url: string;
  score: number;
  summary: string;
}

export interface NewsletterSection {
  subreddit: string;
  posts: NewsletterPost[];
}

export interface NewsletterWithItems {
  id: string;
  user_id: string;
  status: "pending" | "sent" | "failed";
  subject: string | null;
  sent_at: string | null;
  created_at: string;
  sections?: NewsletterSection[];
}

export interface DashboardStats {
  activeSubscriptions: number;
  nextSendAt: string | null;
  isActive: boolean;
  totalNewslettersSent: number;
}
