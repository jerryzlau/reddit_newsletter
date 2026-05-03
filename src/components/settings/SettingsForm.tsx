"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { saveSettings } from "@/app/(app)/settings/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  initial: {
    cadence: "daily" | "weekly";
    top_posts_count: 3 | 5 | 10;
    is_active: boolean;
  };
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <Label className="text-xs text-[#888888] uppercase tracking-wider mb-2 block">{label}</Label>
      <div className="flex rounded-md border border-[#2a2a2a] overflow-hidden w-fit">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              value === opt.value
                ? "bg-[#ff4500] text-white"
                : "bg-[#1a1a1a] text-[#888888] hover:text-[#f0f0f0]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const [cadence, setCadence] = useState(initial.cadence);
  const [topPostsCount, setTopPostsCount] = useState(initial.top_posts_count);
  const [isActive, setIsActive] = useState(initial.is_active);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    cadence !== initial.cadence ||
    topPostsCount !== initial.top_posts_count ||
    isActive !== initial.is_active;

  function handleSave() {
    startTransition(async () => {
      try {
        const { nextSendAt } = await saveSettings({ cadence, top_posts_count: topPostsCount, is_active: isActive });
        const msg = isActive && nextSendAt
          ? `Preferences saved — next digest on ${new Date(nextSendAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
          : "Preferences saved";
        toast.success(msg);
      } catch {
        toast.error("Failed to save preferences");
      }
    });
  }

  return (
    <div className="space-y-6">
      <SegmentedControl
        label="Cadence"
        options={[
          { value: "daily" as const, label: "Daily" },
          { value: "weekly" as const, label: "Weekly" },
        ]}
        value={cadence}
        onChange={setCadence}
      />

      <SegmentedControl
        label="Top posts per subreddit"
        options={[
          { value: 3 as const, label: "3" },
          { value: 5 as const, label: "5" },
          { value: 10 as const, label: "10" },
        ]}
        value={topPostsCount}
        onChange={setTopPostsCount}
      />

      <div className="flex items-center gap-3">
        <Switch
          id="is-active"
          checked={isActive}
          onCheckedChange={setIsActive}
          className="data-[state=checked]:bg-[#ff4500]"
        />
        <Label htmlFor="is-active" className="text-sm text-[#f0f0f0] cursor-pointer">
          {isActive ? "Newsletter delivery active" : "Newsletter delivery paused"}
        </Label>
      </div>

      <Button
        onClick={handleSave}
        disabled={!isDirty || isPending}
        className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Preferences"}
      </Button>
    </div>
  );
}
