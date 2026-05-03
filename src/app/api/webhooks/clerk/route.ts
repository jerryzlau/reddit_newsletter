import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const full_name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await supabase.from("users").upsert({
      id,
      email,
      full_name,
      avatar_url: image_url || null,
    });

    await supabase.from("newsletter_settings").insert({
      user_id: id,
      cadence: "daily",
      top_posts_count: 5,
      is_active: true,
    });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await supabase.from("users").delete().eq("id", id);
    }
  }

  return new Response("OK", { status: 200 });
}
