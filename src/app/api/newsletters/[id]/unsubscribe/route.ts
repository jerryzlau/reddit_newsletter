import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { verifyUnsubscribeToken } from "@/lib/resend/client";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const userId = searchParams.get("user");

  if (!token || !userId || !verifyUnsubscribeToken(token, id, userId)) {
    return new Response("Invalid unsubscribe link", { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  await supabase
    .from("newsletter_settings")
    .update({ is_active: false })
    .eq("user_id", userId);

  redirect("/unsubscribed");
}
