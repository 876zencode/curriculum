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

  let responseBody: string;
  let contentType = "application/json";
  let status = upstream.ok ? upstream.status : 502;

  try {
    const parsed = JSON.parse(rawBody);
    const allowed = new Set(["java", "javascript"]);
    const filtered =
      Array.isArray(parsed)
        ? parsed.filter((item) => {
            const name = typeof item?.name === "string" ? item.name.trim().toLowerCase() : "";
            return allowed.has(name);
          })
        : [];
    responseBody = JSON.stringify(filtered);
  } catch (error) {
    responseBody = JSON.stringify({
      error: "Failed to parse upstream JSON",
      status,
      snippet: rawBody.slice(0, 500),
    });
    status = 502;
  }

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
