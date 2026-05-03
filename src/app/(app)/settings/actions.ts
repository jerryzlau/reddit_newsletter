"use server";

import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth } from "@clerk/nextjs/server";
import { calcNextSendAt } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface SettingsPayload {
  cadence: "daily" | "weekly";
  top_posts_count: 3 | 5 | 10;
  is_active: boolean;
}

export async function saveSettings(payload: SettingsPayload): Promise<{ nextSendAt: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const nextSendAt = payload.is_active ? calcNextSendAt(payload.cadence) : null;

  const supabase = createServiceSupabaseClient();
  await supabase.from("newsletter_settings").upsert({
    user_id: userId,
    cadence: payload.cadence,
    top_posts_count: payload.top_posts_count,
    is_active: payload.is_active,
    next_send_at: nextSendAt,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { nextSendAt: nextSendAt ?? "" };
}
