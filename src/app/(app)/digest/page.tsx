import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { auth } from "@clerk/nextjs/server";
import { DigestForm } from "@/components/digest/DigestForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DigestPage() {
  const { userId } = await auth();
  const supabase = createServiceSupabaseClient();

  const { data: settings } = await supabase
    .from("newsletter_settings")
    .select("accent_color, show_scores, intro_text")
    .eq("user_id", userId!)
    .single();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Digest Appearance</h1>
        <p className="text-sm text-[#888888] mt-1">
          Customize how your email digest looks, then send one right away.
        </p>
      </div>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f0f0f0]">Appearance</CardTitle>
          <CardDescription className="text-[#888888]">
            Changes apply to the next digest you send.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DigestForm
            initial={{
              accentColor: settings?.accent_color ?? "#ff4500",
              showScores: settings?.show_scores ?? true,
              introText: settings?.intro_text ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
