import { Resend } from "resend";
import { createHmac } from "crypto";
import type { NewsletterSection } from "@/types";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface NewsletterEmailProps {
  digestDate: string;
  cadence: "daily" | "weekly";
  sections: NewsletterSection[];
  unsubscribeUrl: string;
  manageUrl: string;
  recipientEmail: string;
}

export interface InviteEmailProps {
  inviterName: string;
  acceptUrl: string;
}

export function buildUnsubscribeToken(newsletterId: string, userId: string): string {
  return createHmac("sha256", process.env.RESEND_API_KEY || "")
    .update(`${newsletterId}:${userId}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(
  token: string,
  newsletterId: string,
  userId: string
): boolean {
  const expected = buildUnsubscribeToken(newsletterId, userId);
  return token === expected;
}

export async function sendNewsletterEmail(
  to: string,
  props: NewsletterEmailProps
): Promise<string> {
  const { NewsletterEmail } = await import("../../../emails/NewsletterEmail");
  const { createElement } = await import("react");

  const { data, error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Your ${props.cadence === "daily" ? "Daily" : "Weekly"} Reddit Digest — ${props.digestDate}`,
    react: createElement(NewsletterEmail, props),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return data!.id;
}

export async function sendInviteEmail(
  to: string,
  props: InviteEmailProps
): Promise<void> {
  const { InviteEmail } = await import("../../../emails/InviteEmail");
  const { createElement } = await import("react");

  const { error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `${props.inviterName} invited you to Reddit Newsletter`,
    react: createElement(InviteEmail, props),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}
