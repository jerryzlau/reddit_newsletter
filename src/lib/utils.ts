import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcNextSendAt(cadence: string): string {
  const now = new Date();
  if (cadence === "daily") {
    const next = new Date(now);
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(0, 0, 0, 0);
    return next.toISOString();
  }
  // weekly: next Monday midnight UTC
  const next = new Date(now);
  const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7;
  next.setUTCDate(next.getUTCDate() + daysUntilMonday);
  next.setUTCHours(0, 0, 0, 0);
  return next.toISOString();
}

export function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M members`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K members`;
  return `${count} members`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
