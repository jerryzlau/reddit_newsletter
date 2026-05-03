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
  Button,
} from "@react-email/components";

interface InviteEmailProps {
  inviterName: string;
  acceptUrl: string;
}

const styles = {
  body: { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  container: { maxWidth: "480px", margin: "0 auto", padding: "40px 24px" },
  logo: { color: "#ff4500", fontSize: "20px", fontWeight: "700", textDecoration: "none", display: "block", marginBottom: "32px" },
  heading: { color: "#1a1a1a", fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" },
  body_text: { color: "#444444", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px 0" },
  button: { backgroundColor: "#ff4500", color: "#ffffff", padding: "12px 28px", borderRadius: "6px", fontWeight: "600", fontSize: "15px", textDecoration: "none", display: "inline-block" },
  hr: { borderColor: "#e0e0e0", margin: "32px 0" },
  footer: { color: "#888888", fontSize: "12px", lineHeight: "1.5" },
};

export function InviteEmail({ inviterName, acceptUrl }: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to Reddit Newsletter</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Link href={acceptUrl} style={styles.logo}>Reddit Newsletter</Link>

          <Text style={styles.heading}>{inviterName} invited you to Reddit Newsletter</Text>
          <Text style={styles.body_text}>
            Get AI-summarized digests from your favorite subreddits, delivered to your inbox.
            Subscribe to any community and choose your own delivery cadence.
          </Text>

          <Button href={acceptUrl} style={styles.button}>
            Accept Invitation
          </Button>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            If you didn&apos;t expect this invite, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteEmail;
