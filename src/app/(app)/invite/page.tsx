import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth } from "@clerk/nextjs/server";
import { InviteForm } from "@/components/invite/InviteForm";
import { SentInvitesTable } from "@/components/invite/SentInvitesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage() {
  const { userId } = await auth();
  const supabase = createServiceSupabaseClient();

  const { data: invites } = await supabase
    .from("invites")
    .select("id, invitee_email, created_at, accepted_at")
    .eq("inviter_id", userId!)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Invite a Friend</h1>
        <p className="text-sm text-[#888888] mt-1">
          Send someone an invite to set up their own Reddit Newsletter
        </p>
      </div>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardContent className="pt-5">
          <InviteForm />
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f0f0f0]">Sent Invites</CardTitle>
        </CardHeader>
        <CardContent>
          <SentInvitesTable invites={invites ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
