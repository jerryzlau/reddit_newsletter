export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; full_name: string | null; avatar_url: string | null; created_at: string };
        Insert: { id: string; email: string; full_name?: string | null; avatar_url?: string | null; created_at?: string };
        Update: { id?: string; email?: string; full_name?: string | null; avatar_url?: string | null; created_at?: string };
        Relationships: [];
      };
      subscriptions: {
        Row: { id: string; user_id: string; subreddit: string; display_name: string | null; icon_url: string | null; subscribers: number | null; created_at: string };
        Insert: { id?: string; user_id: string; subreddit: string; display_name?: string | null; icon_url?: string | null; subscribers?: number | null; created_at?: string };
        Update: { id?: string; user_id?: string; subreddit?: string; display_name?: string | null; icon_url?: string | null; subscribers?: number | null; created_at?: string };
        Relationships: [];
      };
      newsletter_settings: {
        Row: { user_id: string; cadence: string; top_posts_count: number; is_active: boolean; next_send_at: string | null; updated_at: string };
        Insert: { user_id: string; cadence?: string; top_posts_count?: number; is_active?: boolean; next_send_at?: string | null; updated_at?: string };
        Update: { user_id?: string; cadence?: string; top_posts_count?: number; is_active?: boolean; next_send_at?: string | null; updated_at?: string };
        Relationships: [];
      };
      newsletters: {
        Row: { id: string; user_id: string; status: string; subject: string | null; sent_at: string | null; created_at: string };
        Insert: { id?: string; user_id: string; status?: string; subject?: string | null; sent_at?: string | null; created_at?: string };
        Update: { id?: string; user_id?: string; status?: string; subject?: string | null; sent_at?: string | null; created_at?: string };
        Relationships: [];
      };
      newsletter_items: {
        Row: { id: string; newsletter_id: string; subreddit: string; post_id: string; post_title: string; post_url: string; post_permalink: string; upvotes: number | null; summary: string; position: number; created_at: string };
        Insert: { id?: string; newsletter_id: string; subreddit: string; post_id: string; post_title: string; post_url: string; post_permalink: string; upvotes?: number | null; summary: string; position: number; created_at?: string };
        Update: { id?: string; newsletter_id?: string; subreddit?: string; post_id?: string; post_title?: string; post_url?: string; post_permalink?: string; upvotes?: number | null; summary?: string; position?: number; created_at?: string };
        Relationships: [];
      };
      invites: {
        Row: { id: string; inviter_id: string; invitee_email: string; token: string; accepted_at: string | null; created_at: string };
        Insert: { id?: string; inviter_id: string; invitee_email: string; token?: string; accepted_at?: string | null; created_at?: string };
        Update: { id?: string; inviter_id?: string; invitee_email?: string; token?: string; accepted_at?: string | null; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
