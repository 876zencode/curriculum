declare const process: { env: Record<string, string | undefined> };

export const config = { runtime: "edge" };

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type ChatMessage = {
  role: string;
  content: unknown;
};

type ChatRequestBody = {
  model?: string;
  messages: ChatMessage[];
  [key: string]: unknown;
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("OPENAI_API_KEY not set", { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return new Response("Body must be a JSON object", { status: 400 });
  }

  const { model = "gpt-4o-mini", messages, ...rest } = payload as ChatRequestBody;
  if (!Array.isArray(messages)) {
    return new Response("Missing 'messages'", { status: 400 });
  }

  const upstream = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, ...rest }),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
