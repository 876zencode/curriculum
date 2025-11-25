export const config = { runtime: "edge" };

const UPSTREAM_URL = "https://trustdash.replit.app/api/configuration";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (req.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }

  const upstream = await fetch(UPSTREAM_URL, { method: "GET" });
  const body = await upstream.text();

  return cors(
    new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    }),
  );
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { ...response, headers });
}
