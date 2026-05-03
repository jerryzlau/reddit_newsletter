import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from "@react-email/components";
import type { NewsletterSection } from "../src/types";

interface NewsletterEmailProps {
  digestDate: string;
  cadence: "daily" | "weekly";
  sections: NewsletterSection[];
  unsubscribeUrl: string;
  manageUrl: string;
  recipientEmail: string;
}

const styles = {
  body: { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "20px 16px" },
  header: { borderBottom: "2px solid #ff4500", paddingBottom: "16px", marginBottom: "24px" },
  logo: { color: "#ff4500", fontSize: "20px", fontWeight: "700", textDecoration: "none" },
  date: { color: "#888888", fontSize: "13px", marginTop: "4px" },
  subredditHeader: { color: "#ff4500", fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" },
  hr: { borderColor: "#e0e0e0", margin: "8px 0 16px 0" },
  postTitle: { color: "#1a1a1a", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "block", marginBottom: "4px" },
  score: { display: "inline-block", backgroundColor: "#f0f0f0", color: "#666666", fontSize: "12px", padding: "2px 8px", borderRadius: "12px", marginBottom: "6px" },
  summary: { color: "#444444", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0" },
  footer: { borderTop: "1px solid #e0e0e0", marginTop: "32px", paddingTop: "16px" },
  footerText: { color: "#888888", fontSize: "12px", textAlign: "center" as const },
  footerLink: { color: "#ff4500", textDecoration: "none" },
};

export function NewsletterEmail({
  digestDate,
  cadence,
  sections,
  unsubscribeUrl,
  manageUrl,
  recipientEmail,
}: NewsletterEmailProps) {
  const title = `Your ${cadence === "daily" ? "Daily" : "Weekly"} Reddit Digest`;
  const firstPost = sections[0]?.posts[0];

  return (
    <Html>
      <Head />
      <Preview>{firstPost ? `${firstPost.title} — ${digestDate}` : `${title} — ${digestDate}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={manageUrl} style={styles.logo}>Reddit Newsletter</Link>
            <Text style={styles.date}>{title} · {digestDate}</Text>
          </Section>

          {sections.map((section) => (
            <Section key={section.subreddit}>
              <Text style={styles.subredditHeader}>r/{section.subreddit}</Text>
              <Hr style={styles.hr} />
              {section.posts.map((post, i) => (
                <Section key={i}>
                  <Link href={post.url} style={styles.postTitle}>{post.title}</Link>
                  <Text style={styles.score}>▲ {post.score.toLocaleString()}</Text>
                  <Text style={styles.summary}>{post.summary}</Text>
                </Section>
              ))}
            </Section>
          ))}

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              <Link href={manageUrl} style={styles.footerLink}>Manage preferences</Link>
              {" · "}
              <Link href={unsubscribeUrl} style={styles.footerLink}>Unsubscribe</Link>
            </Text>
            <Text style={styles.footerText}>Reddit Newsletter · {recipientEmail}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterEmail;
