export const config = { runtime: "edge" };

const UPSTREAM_URL = "https://trustdash.replit.app/api/configurations";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (req.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }

  const upstream = await fetch(UPSTREAM_URL, { method: "GET" });
  const rawBody = await upstream.text();

  // Try to pass through JSON; if upstream sends HTML or other content, wrap in an error payload.
  let responseBody: string;
  let contentType = upstream.headers.get("content-type") ?? "application/json";
  if (contentType.includes("application/json")) {
    responseBody = rawBody;
  } else {
    contentType = "application/json";
    responseBody = JSON.stringify({
      error: "Upstream response was not JSON",
      status: upstream.status,
      snippet: rawBody.slice(0, 500),
    });
  }

  const status = upstream.ok ? upstream.status : 502;

  return cors(
    new Response(responseBody, {
      status,
      headers: {
        "content-type": contentType,
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
