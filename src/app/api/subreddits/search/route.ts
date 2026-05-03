import { searchSubreddits } from "@/lib/reddit/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q || q.length < 2) return Response.json([]);

  try {
    const results = await searchSubreddits(q);
    return Response.json(results);
  } catch {
    return Response.json([], { status: 500 });
  }
}
