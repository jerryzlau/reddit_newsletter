import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { sendInviteEmail } from "@/lib/resend/client";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { email } = await req.json() as { email: string };
  if (!email || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const user = await currentUser();
  const inviterName = user?.firstName
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "Someone";

  const { data: invite } = await supabase
    .from("invites")
    .insert({ inviter_id: userId, invitee_email: email })
    .select("token")
    .single();

  if (!invite) {
    return Response.json({ error: "Failed to create invite" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendInviteEmail(email, {
    inviterName,
    acceptUrl: `${appUrl}/invite/${invite.token}`,
  });

  return Response.json({ success: true });
}
