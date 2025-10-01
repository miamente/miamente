import { NextRequest } from "next/server";

// Use BACKEND_INTERNAL_URL for server-side proxy (private Railway URL)
// Fallback to NEXT_PUBLIC_API_URL if BACKEND_INTERNAL_URL is not set
const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

console.log("🔧 Proxy using backend URL:", backendBaseUrl);

async function proxy(request: NextRequest, context: { params?: Promise<{ path?: string | string[] }> }) {
  const params = await context?.params;
  const raw = params?.path;
  const pathSuffix = Array.isArray(raw) ? raw.join("/") : (raw ?? "");
  const targetUrl = `${backendBaseUrl}/api/v1/${pathSuffix}${request.nextUrl.search}`;

  console.log("🌐 Proxying request to:", targetUrl);

  const headers = new Headers(request.headers);
  headers.set("host", new URL(backendBaseUrl).host);
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.blob(),
    redirect: "manual",
  };

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return new Response(JSON.stringify({ error: "Backend unavailable", details: String(error) }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
