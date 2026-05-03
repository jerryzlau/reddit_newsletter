import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a newsletter editor writing concise summaries of Reddit posts for busy readers.
Your summaries are 2-3 sentences maximum. Focus on: what happened or was shared, why it matters, any notable reactions.
Avoid filler phrases like "In this post..." or "The author discusses...".
Write in third person, present tense. Be factual and neutral.`;

export async function summarizePost(post: {
  title: string;
  body: string;
  subreddit: string;
  score: number;
}): Promise<string> {
  const userContent = post.body
    ? `Title: ${post.title}\n\nPost body: ${post.body.slice(0, 2000)}`
    : `Title: ${post.title}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  return (response.content[0] as { type: "text"; text: string }).text;
}
