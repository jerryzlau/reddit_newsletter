"use server";

import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth } from "@clerk/nextjs/server";
import { runNewsletterPipeline } from "@/lib/newsletter/pipeline";
import { revalidatePath } from "next/cache";

export interface AppearancePayload {
  accentColor: string;
  showScores: boolean;
  introText: string;
}

export async function saveAppearance(payload: AppearancePayload): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createServiceSupabaseClient();
  await supabase.from("newsletter_settings").upsert({
    user_id: userId,
    accent_color: payload.accentColor,
    show_scores: payload.showScores,
    intro_text: payload.introText || null,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/digest");
}

export async function sendNewsletterNow(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await runNewsletterPipeline(userId);
}
