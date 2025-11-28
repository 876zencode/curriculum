export const config = { runtime: "edge" };

const MAX_URLS = 20;

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { ...response, headers });
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkUrl(url: string): Promise<{ url: string; ok: boolean; status: number; finalUrl?: string }> {
  const doFetch = async (method: "HEAD" | "GET") => {
    const res = await fetch(url, { method, redirect: "follow" });
    return { status: res.status, finalUrl: res.url };
  };

  try {
    const head = await doFetch("HEAD");
    if (head.status && head.status < 400) {
      return { url, ok: true, status: head.status, finalUrl: head.finalUrl };
    }

    const get = await doFetch("GET");
    return { url, ok: get.status < 400, status: get.status, finalUrl: get.finalUrl };
  } catch (error) {
    return { url, ok: false, status: 0 };
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return withCors(
      new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      }),
    );
  }

  if (req.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return withCors(
      new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );
  }

  const urls = Array.isArray(payload?.urls) ? payload.urls.filter(isHttpUrl) : [];
  if (!urls.length) {
    return withCors(new Response(JSON.stringify({ results: [] }), { status: 200, headers: { "content-type": "application/json" } }));
  }

  const limited = urls.slice(0, MAX_URLS);
  const results = await Promise.all(limited.map((url) => checkUrl(url)));

  return withCors(
    new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
}
