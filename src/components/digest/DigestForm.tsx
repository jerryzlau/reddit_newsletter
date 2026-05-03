"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveAppearance, sendNewsletterNow } from "@/app/(app)/digest/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

const ACCENT_PRESETS = [
  { value: "#ff4500", label: "Reddit Orange" },
  { value: "#0079d3", label: "Blue" },
  { value: "#46d160", label: "Green" },
  { value: "#ff585b", label: "Coral" },
  { value: "#a06ef5", label: "Purple" },
  { value: "#888888", label: "Neutral" },
];

interface DigestFormProps {
  initial: {
    accentColor: string;
    showScores: boolean;
    introText: string;
  };
}

export function DigestForm({ initial }: DigestFormProps) {
  const [accentColor, setAccentColor] = useState(initial.accentColor);
  const [showScores, setShowScores] = useState(initial.showScores);
  const [introText, setIntroText] = useState(initial.introText);
  const [isSaving, startSaveTransition] = useTransition();
  const [isSending, startSendTransition] = useTransition();

  const isDirty =
    accentColor !== initial.accentColor ||
    showScores !== initial.showScores ||
    introText !== initial.introText;

  function handleSave() {
    startSaveTransition(async () => {
      try {
        await saveAppearance({ accentColor, showScores, introText });
        toast.success("Appearance saved");
      } catch {
        toast.error("Failed to save appearance");
      }
    });
  }

  function handleSendNow() {
    startSendTransition(async () => {
      try {
        await sendNewsletterNow();
        toast.success("Digest sent! Check your inbox.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send digest");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-xs text-[#888888] uppercase tracking-wider block">Accent Color</Label>
        <div className="flex gap-3 flex-wrap">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.label}
              onClick={() => setAccentColor(preset.value)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer",
                accentColor === preset.value ? "border-[#f0f0f0] scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
        <p className="text-xs text-[#888888]">
          Used for links, subreddit headers, and the email border.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="show-scores"
          checked={showScores}
          onCheckedChange={setShowScores}
          className="data-[state=checked]:bg-[#ff4500]"
        />
        <Label htmlFor="show-scores" className="text-sm text-[#f0f0f0] cursor-pointer">
          Show upvote scores on each post
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro-text" className="text-xs text-[#888888] uppercase tracking-wider block">
          Intro Text
        </Label>
        <Textarea
          id="intro-text"
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="Add a custom greeting shown at the top of every digest… (optional)"
          maxLength={500}
          rows={3}
          className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] placeholder:text-[#555555] focus-visible:ring-[#ff4500] resize-none"
        />
        <p className="text-xs text-[#555555] text-right">{introText.length}/500</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving || isSending}
          className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save Appearance"}
        </Button>

        <Button
          variant="outline"
          onClick={handleSendNow}
          disabled={isSending || isSaving}
          className="border-[#2a2a2a] text-[#f0f0f0] hover:bg-[#2a2a2a] disabled:opacity-50 gap-2"
        >
          <Send className="w-4 h-4" />
          {isSending ? "Sending…" : "Send digest now"}
        </Button>
      </div>
    </div>
  );
}
