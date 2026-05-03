"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(email);
      setEmail("");
      toast.success(`Invite sent to ${email}`);
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@example.com"
          required
          className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] placeholder:text-[#888888] focus-visible:ring-[#ff4500]"
        />
        <Button
          type="submit"
          disabled={loading || !email}
          className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white"
        >
          {loading ? "Sending…" : "Send Invite"}
        </Button>
      </form>
      {sent && (
        <p className="text-sm text-[#22c55e] mt-2">Invite sent to {sent}</p>
      )}
    </div>
  );
}
