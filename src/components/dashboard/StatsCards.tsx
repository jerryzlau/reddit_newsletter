import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

function formatNextSend(dateStr: string | null, isActive: boolean): string {
  if (!isActive) return "Paused";
  if (!dateStr) return "Not scheduled";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-[#888888] font-medium uppercase tracking-wider">
            Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-[#f0f0f0]">{stats.activeSubscriptions}</p>
          <p className="text-xs text-[#888888] mt-1">subreddits</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-[#888888] font-medium uppercase tracking-wider">
            Next Digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-[#f0f0f0] leading-tight">
            {formatNextSend(stats.nextSendAt, stats.isActive)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-[#888888] font-medium uppercase tracking-wider">
            Newsletters Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-[#f0f0f0]">{stats.totalNewslettersSent}</p>
          <p className="text-xs text-[#888888] mt-1">all time</p>
        </CardContent>
      </Card>
    </div>
  );
}
