import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-[#ff4500] font-bold text-xl mb-6">Reddit Newsletter</div>
        <h1 className="text-xl font-semibold text-[#f0f0f0] mb-3">You&apos;ve unsubscribed</h1>
        <p className="text-sm text-[#888888] mb-6">
          Newsletter delivery has been paused. You can re-enable it at any time from your settings.
        </p>
        <Button asChild className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white">
          <Link href="/settings">Manage preferences</Link>
        </Button>
      </div>
    </div>
  );
}
