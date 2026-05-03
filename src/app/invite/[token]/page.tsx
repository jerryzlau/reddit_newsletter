import { createServiceSupabaseClient } from "@/lib/supabase/service";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceSupabaseClient();

  const { data: invite } = await supabase
    .from("invites")
    .select("inviter_id, invitee_email, accepted_at")
    .eq("token", token)
    .single();

  let inviterName = "Someone";
  if (invite?.inviter_id) {
    const { data: inviter } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", invite.inviter_id)
      .single();
    if (inviter?.full_name) inviterName = inviter.full_name;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center">
        <div className="text-[#ff4500] font-bold text-xl mb-6">Reddit Newsletter</div>

        {!invite ? (
          <>
            <h1 className="text-lg font-semibold text-[#f0f0f0] mb-3">Invalid invite link</h1>
            <p className="text-sm text-[#888888]">
              This invite link is no longer valid or has expired.
            </p>
          </>
        ) : invite.accepted_at ? (
          <>
            <h1 className="text-lg font-semibold text-[#f0f0f0] mb-3">Invite already used</h1>
            <p className="text-sm text-[#888888] mb-6">
              This invite has already been accepted. Sign in to your account.
            </p>
            <Button asChild className="w-full bg-[#ff4500] hover:bg-[#ff4500]/90 text-white">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-[#f0f0f0] mb-3">
              {inviterName} invited you to Reddit Newsletter
            </h1>
            <p className="text-sm text-[#888888] mb-6">
              Get AI-powered summaries of your favorite subreddits delivered to your inbox.
              Subscribe to any community and choose your own delivery cadence.
            </p>
            <Button asChild className="w-full bg-[#ff4500] hover:bg-[#ff4500]/90 text-white">
              <Link href="/sign-up">Create your account</Link>
            </Button>
          </>
        )}

        <p className="text-xs text-[#888888] mt-6">
          If you didn&apos;t expect this invite, you can ignore this page.
        </p>
      </div>
    </div>
  );
}
